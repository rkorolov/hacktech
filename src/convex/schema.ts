import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  PATIENT: "patient",
  CAREGIVER: "caregiver"
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.PATIENT),
  v.literal(ROLES.CAREGIVER)
)
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema({
  // default auth tables using convex auth.
  ...authTables,

  // the users table is the default users table that is brought in by the authTables
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(roleValidator)
  })
    .index("email", ["email"]),

  patients: defineTable({
    userId: v.id("users"),
    dateOfBirth: v.optional(v.string()),
    phone: v.optional(v.string()),
    address: v.optional(v.string()),
    medicalHistory: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    insuranceInformation: v.optional(v.string()),
    priorityScore: v.optional(v.number()),
    assignedCaregiverIds: v.optional(v.array(v.id("users")))
  }).index("by_userId", ["userId"]),

  caregivers: defineTable({
    userId: v.id("users"),
    specialization: v.optional(v.string()),
    assignedPatientIds: v.optional(v.array(v.id("users")))
  }).index("by_userId", ["userId"]),

  appointments: defineTable({
    patientId: v.id("users"),
    caregiverId: v.id("users"),
    dateTime: v.number(),
    purpose: v.optional(v.string()),
    notes: v.optional(v.string())
  })
  .index("by_patientId", ["patientId"])
  .index("by_caregiverId", ["caregiverId"])
  .index("by_dateTime", ["dateTime"]),

  patientNotes: defineTable({
    patientId: v.id("users"),
    caregiverId: v.id("users"),
    note: v.string(),
    creationTime: v.number()
  })
  .index("by_patientId", ["patientId"])
  .index("by_caregiverId", ["caregiverId"])
},
{
  schemaValidation: false
});

export default schema;