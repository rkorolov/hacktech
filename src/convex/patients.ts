import { v } from "convex/values";
import { internalQuery, mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";
import { ROLES } from "./schema";

// Query to get the profile for the currently logged-in patient
export const getMyPatientProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (user.role !== ROLES.PATIENT) {
      // Return null or throw error if the user is not a patient
      // console.warn("User is not a patient");
      return null; 
    }

    const patientProfile = await ctx.db
      .query("patients")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    // Return the patient profile, or null if it doesn't exist yet
    return patientProfile;
  },
});

// Mutation to create or update the profile for the currently logged-in patient
export const updateMyPatientProfile = mutation({
  args: {
    dateOfBirth: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    medicalHistory: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    insuranceInformation: v.optional(v.string()),
    // priorityScore and assignedCaregiverIds are typically managed by admin/system/caregivers
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      throw new Error("User not authenticated");
    }

     if (user.role !== ROLES.PATIENT) {
       throw new Error("User is not a patient");
     }

    const patientProfile = await ctx.db
      .query("patients")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    if (patientProfile) {
      // Update existing profile
      await ctx.db.patch(patientProfile._id, { ...args });
    } else {
      // Create new profile
      await ctx.db.insert("patients", {
        userId: user._id,
        ...args,
        // Initialize optional fields not included in args if needed
        priorityScore: 0, // Default priority score
        assignedCaregiverIds: [], // Default empty array
      });
    }
  },
});

// Internal query for caregivers/admins to get patient details by userId
export const getPatientByUserId = internalQuery({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const patientUser = await ctx.db.get(args.userId);
        if (!patientUser || patientUser.role !== ROLES.PATIENT) {
            return null; // Or throw an error if preferred
        }

        const patientProfile = await ctx.db
            .query("patients")
            .withIndex("by_userId", (q) => q.eq("userId", args.userId))
            .unique();

        if (!patientProfile) {
            return null; // Patient profile might not exist yet
        }

        // Combine user data and patient profile data
        return {
            ...patientUser, // Includes name, email, image etc. from users table
            ...patientProfile, // Includes dob, address, medical history etc. from patients table
            userId: patientUser._id // Ensure userId is explicitly returned if needed elsewhere
        };
    },
});
