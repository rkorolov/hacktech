import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id, Doc } from "./_generated/dataModel";
import { ROLES } from "./schema";
import { getCurrentUser } from "./users";

// Define types for patient with form
type PatientWithForm = Doc<"users"> & {
  latestForm: Doc<"patientForms"> | null;
};

// Get all patients with their latest form data
export const getPatients = query({
  args: {
    searchQuery: v.optional(v.string()),
    sortBy: v.optional(v.union(
      v.literal("priority"),
      v.literal("recent"),
      v.literal("name")
    )),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user.role !== ROLES.CAREGIVER) throw new Error("Access denied");

    // Get all users with patient role
    const patientsQuery = ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), ROLES.PATIENT));

    // Get all patients
    const patients = await patientsQuery.collect();

    // Filter patients if search query provided
    const filteredPatients = args.searchQuery 
      ? patients.filter(patient => 
          (patient.name?.toLowerCase() || "").includes(args.searchQuery!.toLowerCase()) ||
          (patient.email?.toLowerCase() || "").includes(args.searchQuery!.toLowerCase())
        )
      : patients;

    // Get latest form for each patient
    const patientsWithForms: PatientWithForm[] = await Promise.all(
      filteredPatients.map(async (patient) => {
        const latestForm = await ctx.db
          .query("patientForms")
          .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
          .order("desc")
          .first();

        return {
          ...patient,
          latestForm,
        };
      })
    );

    // Sort patients based on criteria
    if (args.sortBy === "priority") {
      return patientsWithForms.sort((a: PatientWithForm, b: PatientWithForm) => {
        const scoreA = a.latestForm?.priorityScore ?? 0;
        const scoreB = b.latestForm?.priorityScore ?? 0;
        return scoreB - scoreA;
      });
    } else if (args.sortBy === "recent") {
      return patientsWithForms.sort((a: PatientWithForm, b: PatientWithForm) => {
        const timeA = a.latestForm?.submissionDate ?? 0;
        const timeB = b.latestForm?.submissionDate ?? 0;
        return timeB - timeA;
      });
    } else if (args.sortBy === "name") {
      return patientsWithForms.sort((a: PatientWithForm, b: PatientWithForm) => {
        const nameA = a.name?.toLowerCase() ?? "";
        const nameB = b.name?.toLowerCase() ?? "";
        return nameA.localeCompare(nameB);
      });
    }

    return patientsWithForms;
  },
});

// Add a note to a patient's form
export const addNote = mutation({
  args: {
    formId: v.id("patientForms"),
    noteText: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user.role !== ROLES.CAREGIVER) throw new Error("Access denied");

    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    const noteId = await ctx.db.insert("caregiverNotes", {
      formId: args.formId,
      caregiverId: user._id,
      noteText: args.noteText,
      dateAdded: Date.now(),
    });

    // Update form status to reviewed
    await ctx.db.patch(args.formId, {
      status: "reviewed",
    });

    return noteId;
  },
});

// Get all notes for a specific form
export const getFormNotes = query({
  args: {
    formId: v.id("patientForms"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user.role !== ROLES.CAREGIVER) throw new Error("Access denied");

    return await ctx.db
      .query("caregiverNotes")
      .withIndex("by_form", (q) => q.eq("formId", args.formId))
      .order("desc")
      .collect();
  },
});

// Generate and send a recommendation
export const createRecommendation = mutation({
  args: {
    formId: v.id("patientForms"),
    patientId: v.id("users"),
    recommendationText: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user.role !== ROLES.CAREGIVER) throw new Error("Access denied");

    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");

    const recommendationId = await ctx.db.insert("recommendations", {
      formId: args.formId,
      caregiverId: user._id,
      patientId: args.patientId,
      recommendationText: args.recommendationText,
      dateGenerated: Date.now(),
      emailSent: false, // Will be updated when email is sent
    });

    // Update form status to reviewed
    await ctx.db.patch(args.formId, {
      status: "reviewed",
    });

    return recommendationId;
  },
});

// Get all recommendations for a patient
export const getPatientRecommendations = query({
  args: {
    patientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user.role !== ROLES.CAREGIVER) throw new Error("Access denied");

    return await ctx.db
      .query("recommendations")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});