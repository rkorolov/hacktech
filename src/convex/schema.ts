import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// Update roles for healthcare system
export const ROLES = {
  ADMIN: "admin",
  PATIENT: "patient", 
  CAREGIVER: "caregiver",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.PATIENT),
  v.literal(ROLES.CAREGIVER),
);
export type Role = Infer<typeof roleValidator>;

// Severity levels for symptoms
export const SEVERITY = {
  MILD: "mild",
  MODERATE: "moderate", 
  SEVERE: "severe",
} as const;

export const severityValidator = v.union(
  v.literal(SEVERITY.MILD),
  v.literal(SEVERITY.MODERATE),
  v.literal(SEVERITY.SEVERE),
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
    specialty: v.optional(v.string()), // For caregivers
  }).index("email", ["email"]),

  forms: defineTable({
    patientId: v.id("users"),
    name: v.string(), // Added name field
    age: v.number(),
    symptoms: v.string(),
    severity: severityValidator,
    contactInfo: v.string(),
    priorityScore: v.number(),
    submittedAt: v.number(),
  })
    .index("by_patient", ["patientId"])
    .index("by_priority", ["priorityScore"]),

  appointments: defineTable({
    patientId: v.id("users"),
    caregiverId: v.id("users"),
    date: v.number(),
    notes: v.optional(v.string()),
    recommendations: v.optional(v.string()),
  })
    .index("by_patient", ["patientId"])
    .index("by_caregiver", ["caregiverId"]),

  prescriptions: defineTable({
    patientId: v.id("users"),
    medicationName: v.string(),
    dosage: v.string(),
    refillsRemaining: v.number(),
    prescribedBy: v.id("users"),
    prescribedAt: v.number(),
  })
    .index("by_patient", ["patientId"]),

  messages: defineTable({
    fromId: v.id("users"),
    toId: v.id("users"),
    content: v.string(),
    sentAt: v.number(),
    read: v.boolean(),
  })
    .index("by_from", ["fromId"])
    .index("by_to", ["toId"])
    .index("by_time", ["sentAt"]),

}, {
  schemaValidation: false
});

export default schema;