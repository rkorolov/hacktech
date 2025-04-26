import { v } from "convex/values";
import { mutation, query, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { ROLES, SEVERITY } from "./schema";
import { getCurrentUser } from "./users";

// Calculate priority score based on severity and wait time
export const calculatePriorityScore = internalQuery({
  args: {
    severity: v.string(),
    submissionTime: v.number(),
  },
  handler: async (ctx, args) => {
    // Severity weights
    const severityScores = {
      [SEVERITY.MILD]: 1,
      [SEVERITY.MODERATE]: 2,
      [SEVERITY.SEVERE]: 3,
    };

    // Calculate hours waited
    const hoursWaited = (Date.now() - args.submissionTime) / (1000 * 60 * 60);
    
    // Priority = severity score * (1 + sqrt(hours waited))
    // This ensures severity is primary factor but wait time increases priority
    const severityScore = severityScores[args.severity as keyof typeof severityScores];
    const waitTimeFactor = 1 + Math.sqrt(hoursWaited);
    
    return severityScore * waitTimeFactor;
  },
});

// Get all forms for a specific patient
export const getPatientForms = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    if (user.role === ROLES.PATIENT) {
      // Patients can only see their own forms
      return await ctx.db
        .query("patientForms")
        .withIndex("by_patient", (q) => q.eq("patientId", user._id))
        .order("desc")
        .collect();
    } else if (user.role === ROLES.CAREGIVER) {
      // Caregivers can see all forms, sorted by priority
      return await ctx.db
        .query("patientForms")
        .withIndex("by_priority")
        .order("desc")
        .collect();
    }
    
    throw new Error("Invalid role");
  },
});

// Get a single form by ID
export const getFormById = query({
  args: { formId: v.id("patientForms") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");
    
    // Verify access rights
    if (user.role === ROLES.PATIENT && form.patientId !== user._id) {
      throw new Error("Access denied");
    }
    
    return form;
  },
});

// Create a new patient form
export const createForm = mutation({
  args: {
    symptoms: v.string(),
    severity: v.union(
      v.literal(SEVERITY.MILD),
      v.literal(SEVERITY.MODERATE),
      v.literal(SEVERITY.SEVERE)
    ),
    contactInfo: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"patientForms">> => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user.role !== ROLES.PATIENT) throw new Error("Only patients can create forms");
    
    const submissionDate = Date.now();
    
    // Calculate initial priority score using internal API reference
    const priorityScore: number = await ctx.runQuery(internal.patientForms.calculatePriorityScore, {
      severity: args.severity,
      submissionTime: submissionDate,
    });
    
    const formId: Id<"patientForms"> = await ctx.db.insert("patientForms", {
      patientId: user._id,
      symptoms: args.symptoms,
      severity: args.severity,
      priorityScore,
      contactInfo: args.contactInfo,
      submissionDate,
      status: "pending",
    });
    
    return formId;
  },
});

// Update an existing form
export const updateForm = mutation({
  args: {
    formId: v.id("patientForms"),
    symptoms: v.optional(v.string()),
    severity: v.optional(v.union(
      v.literal(SEVERITY.MILD),
      v.literal(SEVERITY.MODERATE),
      v.literal(SEVERITY.SEVERE)
    )),
    contactInfo: v.optional(v.string()),
    status: v.optional(v.union(v.literal("pending"), v.literal("reviewed"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    const form = await ctx.db.get(args.formId);
    if (!form) throw new Error("Form not found");
    
    // Verify access rights
    if (user.role === ROLES.PATIENT) {
      if (form.patientId !== user._id) throw new Error("Access denied");
      if (form.status === "reviewed") throw new Error("Cannot edit reviewed forms");
      if (args.status) throw new Error("Patients cannot change form status");
    }
    
    // Calculate new priority score if severity is updated using internal API reference
    let priorityScore = form.priorityScore;
    if (args.severity) {
      priorityScore = await ctx.runQuery(internal.patientForms.calculatePriorityScore, {
        severity: args.severity,
        submissionTime: form.submissionDate,
      });
    }
    
    await ctx.db.patch(args.formId, {
      ...args,
      priorityScore,
    });
    
    return args.formId;
  },
});

// Get forms by status (pending/reviewed) for caregivers
export const getFormsByStatus = query({
  args: {
    status: v.union(v.literal("pending"), v.literal("reviewed")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user.role !== ROLES.CAREGIVER) throw new Error("Access denied");
    
    return await ctx.db
      .query("patientForms")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc")
      .collect();
  },
});

// Get all forms for a specific patient ID (for caregiver dashboard)
export const getFormsByPatientId = query({
  args: {
    patientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    if (user.role !== ROLES.CAREGIVER) throw new Error("Access denied");
    
    return await ctx.db
      .query("patientForms")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();
  },
});