import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { ROLES } from "./schema";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if(user === null) {
      return null;
    }

    return user;
  },
});

/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx 
 * @returns 
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
}

// Check if the user needs to set their role
export const needsRoleSelection = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;
    return user.role === undefined;
  },
});

// Get a user by ID
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get all patients (for caregivers)
export const getAllPatients = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    const patients = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), ROLES.PATIENT))
      .collect();

    // Get latest form for each patient to calculate priority
    return Promise.all(
      patients.map(async (patient) => {
        const latestForm = await ctx.db
          .query("forms")
          .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
          .order("desc")
          .first();

        return {
          ...patient,
          latestForm,
        };
      })
    );
  },
});

// Set the user's role
export const setUserRole = mutation({
  args: {
    role: v.union(v.literal(ROLES.PATIENT), v.literal(ROLES.CAREGIVER)),
    specialty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const user = await ctx.db.get(userId);
    if (!user) throw new Error("User not found");
    if (user.role) throw new Error("Role already set");

    // Only allow specialty to be set for caregivers
    if (args.role === ROLES.PATIENT && args.specialty) {
      throw new Error("Patients cannot have a specialty");
    }

    await ctx.db.patch(userId, {
      role: args.role,
      ...(args.specialty ? { specialty: args.specialty } : {}),
    });

    return await ctx.db.get(userId);
  },
});