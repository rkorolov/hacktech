import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ROLES } from "./schema";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

// Create a new prescription
export const createPrescription = mutation({
  args: {
    patientId: v.id("users"),
    medicationName: v.string(),
    dosage: v.string(),
    refillsRemaining: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Only caregivers can create prescriptions");
    }

    return await ctx.db.insert("prescriptions", {
      patientId: args.patientId,
      medicationName: args.medicationName,
      dosage: args.dosage,
      refillsRemaining: args.refillsRemaining,
      prescribedBy: user._id,
      prescribedAt: Date.now(),
    });
  },
});

// Get prescriptions for a patient
export const getPatientPrescriptions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.PATIENT) {
      throw new Error("Unauthorized");
    }

    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patientId", user._id))
      .order("desc")
      .collect();

    // Fetch prescriber details for each prescription
    return Promise.all(
      prescriptions.map(async (prescription) => {
        const prescriber = await ctx.db.get(prescription.prescribedBy);
        return {
          ...prescription,
          prescriber,
        };
      })
    );
  },
});

// Get prescriptions prescribed by a caregiver
export const getCaregiverPrescriptions = query({
  args: {
    patientId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    let query = ctx.db
      .query("prescriptions")
      .filter((q) => q.eq(q.field("prescribedBy"), user._id));

    if (args.patientId) {
      query = query.filter((q) => q.eq(q.field("patientId"), args.patientId));
    }

    const prescriptions = await query.order("desc").collect();

    // Fetch patient details for each prescription
    return Promise.all(
      prescriptions.map(async (prescription) => {
        const patient = await ctx.db.get(prescription.patientId);
        return {
          ...prescription,
          patient,
        };
      })
    );
  },
});

// Get all prescriptions for a specific patient (for caregivers)
export const getPrescriptionsByPatientId = query({
  args: {
    patientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    const prescriptions = await ctx.db
      .query("prescriptions")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    // Fetch patient and prescriber details
    const patient = await ctx.db.get(args.patientId);
    
    return Promise.all(
      prescriptions.map(async (prescription) => {
        const prescriber = await ctx.db.get(prescription.prescribedBy);
        return {
          ...prescription,
          patient,
          prescriber,
        };
      })
    );
  },
});

// Get a specific prescription by ID
export const getPrescriptionById = query({
  args: { prescriptionId: v.id("prescriptions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const prescription = await ctx.db.get(args.prescriptionId);
    if (!prescription) throw new Error("Prescription not found");

    // Check authorization
    if (
      user.role === ROLES.PATIENT && prescription.patientId !== user._id ||
      user.role === ROLES.CAREGIVER && prescription.prescribedBy !== user._id
    ) {
      throw new Error("Unauthorized");
    }

    // Fetch related user details
    const patient = await ctx.db.get(prescription.patientId);
    const prescriber = await ctx.db.get(prescription.prescribedBy);

    return {
      ...prescription,
      patient,
      prescriber,
    };
  },
});

// Update prescription refills
export const updateRefills = mutation({
  args: {
    prescriptionId: v.id("prescriptions"),
    refillsRemaining: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Only caregivers can update refills");
    }

    const prescription = await ctx.db.get(args.prescriptionId);
    if (!prescription) throw new Error("Prescription not found");

    // Only the prescribing caregiver can update refills
    if (prescription.prescribedBy !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.prescriptionId, {
      refillsRemaining: args.refillsRemaining,
    });

    return await ctx.db.get(args.prescriptionId);
  },
});

// Request a refill (for patients)
export const requestRefill = mutation({
  args: {
    prescriptionId: v.id("prescriptions"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.PATIENT) {
      throw new Error("Only patients can request refills");
    }

    const prescription = await ctx.db.get(args.prescriptionId);
    if (!prescription) throw new Error("Prescription not found");

    // Verify this prescription belongs to the patient
    if (prescription.patientId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Check if refills are available
    if (prescription.refillsRemaining <= 0) {
      throw new Error("No refills remaining");
    }

    // Decrement refills
    await ctx.db.patch(args.prescriptionId, {
      refillsRemaining: prescription.refillsRemaining - 1,
    });

    return await ctx.db.get(args.prescriptionId);
  },
});