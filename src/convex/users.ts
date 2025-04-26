import { getAuthUserId } from "@convex-dev/auth/server";
import { query, QueryCtx, mutation } from "./_generated/server";
import { v } from "convex/values";
import { ROLES, roleValidator } from "./schema";

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
 * Get a user by ID. Only accessible by caregivers.
 */
export const getUserById = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Not authenticated");
    if (currentUser.role !== ROLES.CAREGIVER) throw new Error("Access denied");

    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

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

/**
 * Set the role for a user (patient or caregiver)
 */
export const setUserRole = mutation({
  args: {
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    await ctx.db.patch(user._id, {
      role: args.role,
    });
    
    return user._id;
  },
});

/**
 * Get all users with a specific role
 */
export const getUsersByRole = query({
  args: {
    role: roleValidator,
  },
  handler: async (ctx, args) => {
    const currentUser = await getCurrentUser(ctx);
    if (!currentUser) throw new Error("Not authenticated");
    if (currentUser.role !== ROLES.CAREGIVER) throw new Error("Access denied");

    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), args.role))
      .collect();
  },
});