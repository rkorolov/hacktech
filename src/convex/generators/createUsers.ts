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
      .withIndex("email", (q) => q.eq("email", "test.caregiver@example.com"))
      .first();

    const existingPatient = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "test.patient@example.com"))
      .first();

    let caregiverId: Id<"users">;
    let patientId: Id<"users">;

    // Create or get caregiver
    if (existingCaregiver) {
      caregiverId = existingCaregiver._id;
    } else {
      caregiverId = await ctx.db.insert("users", {
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