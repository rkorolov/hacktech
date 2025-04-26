import { v } from "convex/values";
import { internalQuery, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";
import { ROLES } from "./schema";
import { internal, api } from "./_generated/api";
import { Doc } from "./_generated/dataModel";

// Adjusted PatientDetails type to match the actual return structure
// It includes fields from both, with patient's _id and user's ID as userId
type PatientDetails = Omit<Doc<"users">, "_id" | "_creationTime"> & // Omit user's _id and _creationTime
                      Doc<"patients"> & // Include all patient fields (_id is from patients)
                      { userId: Id<"users"> } | null; // Explicitly include userId

// Query to get the profile for the currently logged-in caregiver (basic for now)
export const getMyCaregiverProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (!user) {
      throw new Error("User not authenticated");
    }

    if (user.role !== ROLES.CAREGIVER) {
      // console.warn("User is not a caregiver");
      return null;
    }

    // Fetch caregiver-specific details if they exist
    const caregiverProfile = await ctx.db
      .query("caregivers")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .unique();

    // Combine user data with caregiver data
    return {
      ...user,
      specialization: caregiverProfile?.specialization,
      assignedPatientIds: caregiverProfile?.assignedPatientIds ?? [],
    };
  },
});

// Query for caregivers to get details of their assigned patients
export const getAssignedPatients = query({
  args: {},
  handler: async (ctx) => {
    const caregiver = await ctx.runQuery(api.caregivers.getMyCaregiverProfile);

    if (!caregiver) {
      return [];
    }

    const assignedPatientIds = caregiver.assignedPatientIds ?? [];

    if (assignedPatientIds.length === 0) {
      return [];
    }

    const patientDetailsPromises = assignedPatientIds.map((patientUserId: Id<"users">) =>
      ctx.runQuery(internal.patients.getPatientByUserId, { userId: patientUserId })
    );

    // Type annotation remains the same, but the definition of PatientDetails is now correct
    const patientDetails: PatientDetails[] = await Promise.all(patientDetailsPromises);

    // Filter out any null results
    return patientDetails.filter((details): details is NonNullable<PatientDetails> => details !== null);
  },
});

// Example Mutation (for admin/system use typically) to assign a patient to a caregiver
// This is just a placeholder example, actual assignment logic might be more complex
// import { mutation } from "./_generated/server";
// export const assignPatientToCaregiver = mutation({
//   args: { caregiverUserId: v.id("users"), patientUserId: v.id("users") },
//   handler: async (ctx, args) => {
//     // Add authorization checks here (e.g., only admin can assign)
//     const caregiverProfile = await ctx.db
//       .query("caregivers")
//       .withIndex("by_userId", q => q.eq("userId", args.caregiverUserId))
//       .unique();

//     if (!caregiverProfile) {
//       throw new Error("Caregiver profile not found");
//     }

//     const currentAssigned = caregiverProfile.assignedPatientIds ?? [];
//     if (!currentAssigned.some(id => id === args.patientUserId)) {
//       await ctx.db.patch(caregiverProfile._id, {
//         assignedPatientIds: [...currentAssigned, args.patientUserId]
//       });
//     }
//     // Also potentially update the patient's assignedCaregiverIds
//   }
// });