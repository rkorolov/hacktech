import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { ROLES, SEVERITY } from "../schema";

export const createSamplePatient = internalMutation({
  args: {},
  handler: async (ctx): Promise<Id<"users">> => {
    // Check if sample patient already exists
    const existingPatient = await ctx.db
      .query("users")
      .filter((q) => 
        q.and(
          q.eq(q.field("role"), ROLES.PATIENT),
          q.eq(q.field("email"), "sample.patient@example.com")
        )
      )
      .first();

    if (existingPatient) {
      return existingPatient._id;
    }

    // Create sample patient
    const patientId = await ctx.db.insert("users", {
      name: "Sample Patient",
      email: "sample.patient@example.com",
      role: ROLES.PATIENT,
      emailVerificationTime: Date.now(),
      isAnonymous: false,
    });

    // Calculate priority score based on severity and wait time
    const submissionDate = Date.now() - 1000 * 60 * 60 * 2; // 2 hours ago
    const severityScore = {
      [SEVERITY.MILD]: 1,
      [SEVERITY.MODERATE]: 2,
      [SEVERITY.SEVERE]: 3,
    }[SEVERITY.MODERATE];
    const hoursWaited = (Date.now() - submissionDate) / (1000 * 60 * 60);
    const priorityScore = severityScore * (1 + Math.sqrt(hoursWaited));

    // Create sample form submission
    await ctx.db.insert("patientForms", {
      patientId,
      symptoms: "Persistent headache and mild fever. Symptoms started yesterday evening and have been gradually getting worse. Having difficulty concentrating at work.",
      severity: SEVERITY.MODERATE,
      priorityScore,
      contactInfo: "Phone: (555) 123-4567\nBest time to reach: Afternoons\nPreferred contact method: Phone call",
      submissionDate,
      status: "pending"
    });

    return patientId;
  },
});