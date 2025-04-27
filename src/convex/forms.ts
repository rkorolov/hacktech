import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ROLES, SEVERITY } from "./schema";
import { getCurrentUser } from "./users";
import { Id, Doc } from "./_generated/dataModel";

// Calculate priority score based on severity and wait time
function calculatePriorityScore(severity: "mild" | "moderate" | "severe", submittedAt: number): number {
  const severityScores = {
    mild: 1,
    moderate: 2,
    severe: 3,
  };
  
  const waitTimeHours = (Date.now() - submittedAt) / (1000 * 60 * 60);
  const waitTimeScore = Math.min(waitTimeHours / 24, 5); // Cap wait time score at 5
  
  return severityScores[severity] * 2 + waitTimeScore;
}

// Create a new form
export const createForm = mutation({
  args: {
    name: v.string(),
    age: v.number(),
    symptoms: v.string(),
    severity: v.union(
      v.literal("mild"),
      v.literal("moderate"), 
      v.literal("severe")
    ),
    contactInfo: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.PATIENT) {
      throw new Error("Only patients can submit forms");
    }

    const submittedAt = Date.now();
    const priorityScore = calculatePriorityScore(args.severity, submittedAt);

    return await ctx.db.insert("forms", {
      patientId: user._id,
      name: args.name,
      age: args.age,
      symptoms: args.symptoms,
      severity: args.severity,
      contactInfo: args.contactInfo,
      priorityScore,
      submittedAt,
    });
  },
});

// Get all forms for a patient
export const getPatientForms = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.PATIENT) {
      throw new Error("Unauthorized");
    }

    return await ctx.db
      .query("forms")
      .withIndex("by_patient", (q) => q.eq("patientId", user._id))
      .order("desc")
      .collect();
  },
});

// Get all forms for caregivers, sorted by priority
export const getFormsByPriority = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    const forms = await ctx.db
      .query("forms")
      .withIndex("by_priority")
      .order("desc")
      .collect();

    const limitedForms = args.limit ? forms.slice(0, args.limit) : forms;

    // Fetch patient details for each form
    const formsWithPatients = await Promise.all(
      limitedForms.map(async (form: Doc<"forms">) => {
        const patient = await ctx.db.get(form.patientId);
        return {
          ...form,
          patient,
        };
      })
    );

    return formsWithPatients;
  },
});

// Get forms for a specific patient (for caregivers)
export const getFormsByPatientId = query({
  args: {
    patientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    const forms = await ctx.db
      .query("forms")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    // Fetch patient details
    const patient = await ctx.db.get(args.patientId);
    
    return forms.map(form => ({
      ...form,
      patient,
    }));
  },
});

// Get a specific form by ID
export const getFormById = query({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    // Patients can only view their own forms
    if (user.role === ROLES.PATIENT && form.patientId !== user._id) {
      throw new Error("Unauthorized");
    }

    // Fetch the patient details
    const patient = await ctx.db.get(form.patientId);
    return { ...form, patient };
  },
});

// Update an existing form
export const updateForm = mutation({
  args: {
    formId: v.id("forms"),
    name: v.optional(v.string()),
    age: v.optional(v.number()),
    symptoms: v.optional(v.string()),
    severity: v.optional(
      v.union(
        v.literal("mild"),
        v.literal("moderate"),
        v.literal("severe")
      )
    ),
    contactInfo: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    // Only the patient who created the form can update it
    if (form.patientId !== user._id) {
      throw new Error("Unauthorized");
    }

    const updates: any = { ...args };
    delete updates.formId;

    // Recalculate priority score if severity is updated
    if (args.severity) {
      updates.priorityScore = calculatePriorityScore(args.severity, form.submittedAt);
    }

    await ctx.db.patch(args.formId, updates);
    return await ctx.db.get(args.formId);
  },
});

// Delete a form
export const deleteForm = mutation({
  args: { formId: v.id("forms") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    // Only the patient who created the form or an admin can delete it
    if (form.patientId !== user._id && user.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.formId);
  },
});

// Get forms from patients without appointments, sorted by priority
export const getFormsWithoutAppointments = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    // Get all forms ordered by priority
    const forms = await ctx.db
      .query("forms")
      .withIndex("by_priority")
      .order("desc")
      .collect();

    // Filter out forms from patients who already have appointments
    const formsWithoutAppointments = await Promise.all(
      forms.map(async (form) => {
        // Check if patient has any appointments
        const appointments = await ctx.db
          .query("appointments")
          .withIndex("by_patient", (q) => q.eq("patientId", form.patientId))
          .collect();

        // If no appointments found, include this form
        if (appointments.length === 0) {
          const patient = await ctx.db.get(form.patientId);
          return {
            ...form,
            patient,
          };
        }
        return null;
      })
    );

    // Filter out nulls and apply limit if specified
    const filteredForms = formsWithoutAppointments.filter(Boolean);
    return args.limit ? filteredForms.slice(0, args.limit) : filteredForms;
  },
});

// Get forms filtered by appointment status
export const getFormsByAppointmentStatus = query({
  args: {
    status: v.union(
      v.literal("with_appointments"),
      v.literal("without_appointments"),
      v.literal("all")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    // Get all forms ordered by priority
    const forms = await ctx.db
      .query("forms")
      .withIndex("by_priority")
      .order("desc")
      .collect();

    // Process each form to check appointment status
    const processedForms = await Promise.all(
      forms.map(async (form) => {
        // Check if patient has any appointments
        const appointments = await ctx.db
          .query("appointments")
          .withIndex("by_patient", (q) => q.eq("patientId", form.patientId))
          .collect();

        const hasAppointments = appointments.length > 0;

        // Filter based on status
        if (
          args.status === "with_appointments" && !hasAppointments ||
          args.status === "without_appointments" && hasAppointments
        ) {
          return null;
        }

        const patient = await ctx.db.get(form.patientId);
        return {
          ...form,
          patient,
          hasAppointments,
        };
      })
    );

    // Filter out nulls and apply limit if specified
    const filteredForms = processedForms.filter(Boolean);
    return args.limit ? filteredForms.slice(0, args.limit) : filteredForms;
  },
});