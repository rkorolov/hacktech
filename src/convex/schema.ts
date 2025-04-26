import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  PATIENT: "patient",
  CAREGIVER: "caregiver",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.PATIENT),
  v.literal(ROLES.CAREGIVER),
)
export type Role = Infer<typeof roleValidator>;

export const SEVERITY = {
  MILD: "mild",
  MODERATE: "moderate", 
  SEVERE: "severe"
} as const;

export const severityValidator = v.union(
  v.literal(SEVERITY.MILD),
  v.literal(SEVERITY.MODERATE),
  v.literal(SEVERITY.SEVERE)
);

const schema = defineSchema({
  ...authTables,

  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(roleValidator),
  }).index("email", ["email"]),

  patientForms: defineTable({
    patientId: v.id("users"),
    symptoms: v.string(),
    severity: severityValidator,
    priorityScore: v.number(),
    contactInfo: v.string(),
    submissionDate: v.number(),
    status: v.union(v.literal("pending"), v.literal("reviewed")),
  })
    .index("by_patient", ["patientId"])
    .index("by_priority", ["priorityScore"])
    .index("by_status", ["status"])
    .index("by_submission", ["submissionDate"]),

  caregiverNotes: defineTable({
    formId: v.id("patientForms"),
    caregiverId: v.id("users"),
    noteText: v.string(),
    dateAdded: v.number(),
  })
    .index("by_form", ["formId"])
    .index("by_caregiver", ["caregiverId"]),

  recommendations: defineTable({
    formId: v.id("patientForms"),
    caregiverId: v.id("users"),
    patientId: v.id("users"),
    recommendationText: v.string(),
    dateGenerated: v.number(),
    emailSent: v.boolean(),
  })
    .index("by_patient", ["patientId"])
    .index("by_form", ["formId"]),
},
{
  schemaValidation: false
});

export default schema;