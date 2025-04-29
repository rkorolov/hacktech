import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { ROLES } from "../schema";

export const createUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if test users already exist by email
    const existingCaregiver = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) =>  q.eq("tokenIdentifier", "1234"))
      .first();

    const existingPatient = await ctx.db
      .query("users")
      .withIndex("by_tokenIdentifier", (q) => q.eq("tokenIdentifier", "5678"))
      .first();

    let caregiverId: Id<"users">;
    let patientId: Id<"users">;

    // Create or get caregiver
    if (existingCaregiver) {
      caregiverId = existingCaregiver._id;
    } else {
      caregiverId = await ctx.db.insert("users", {
        tokenIdentifier: "1234",
        name: "Dr. Sarah Smith",
        email: "test.caregiver@example.com",
        emailVerificationTime: Date.now(),
        role: ROLES.CAREGIVER,
        specialty: "Cardiology",
        isAnonymous: false,
      });
    }

    // Create or get patient
    if (existingPatient) {
      patientId = existingPatient._id;
    } else {
      patientId = await ctx.db.insert("users", {
        tokenIdentifier: "5678",
        name: "John Doe",
        email: "test.patient@example.com",
        emailVerificationTime: Date.now(),
        role: ROLES.PATIENT,
        isAnonymous: false,
      });
    }

    return {
      caregiverId,
      patientId,
      patientUrl: `/protected/patients/${patientId}`,
    };
  },
});