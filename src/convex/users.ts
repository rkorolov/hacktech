import { getAuthUserId } from "@convex-dev/auth/server";
import { query, mutation, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { ROLES } from "./schema";
import { roleValidator  } from "./schema";

/* 
 Testing function: creates user
*/
// export const createUser = mutation({
//   args: {
//     tokenIdentifier: v.string(),                // required for external auth lookup
//     name:            v.optional(v.string()),    // matches name?: string
//     image:           v.optional(v.string()),    // matches image?: string
//     email:           v.optional(v.string()),    // matches email?: string
//     emailVerificationTime: v.optional(v.number()), // matches emailVerificationTime?: number
//     isAnonymous:     v.optional(v.boolean()),   // matches isAnonymous?: boolean
//     role:            v.optional(roleValidator), // matches role?: "admin"|"patient"|"caregiver"
//     specialty:       v.optional(v.string()),    // matches specialty?: string
//   },
//   handler: async (ctx, args) => {
//     // Inserts a new row with exactly those fields
//     const newUserId = await ctx.db.insert("users", {
//       name:                  args.name,
//       image:                 args.image,
//       email:                 args.email,
//       emailVerificationTime: args.emailVerificationTime,
//       isAnonymous:           args.isAnonymous,
//       role:                  args.role,
//       specialty:             args.specialty,
//     });
//     return newUserId;
//   },
// });

// export const storeUser = mutation({
//   args: {},
//   handler: async (ctx) => {
//     const identity = await ctx.auth.getUserIdentity();
//     if (!identity) throw new Error("Not authenticated");

//     // 1) Check if we already stored them
//     const existing = await ctx.db
//       .query("users")
//       .withIndex("by_tokenIdentifier", (q) =>
//         q.eq("tokenIdentifier", identity.tokenIdentifier)
//       )
//       .unique();

//     if (existing) return existing._id;

//     // 2) Otherwise insert a new row
//     return await ctx.db.insert("users", {
//       tokenIdentifier: identity.tokenIdentifier,
//       name:             identity.name,
//       email:            identity.email,
//     });
//   },
// });
export const ensureUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    console.log(identity)

    const{ tokenIdentifier, email, givenName, familyName} = identity;
    if (!email) {
      throw new Error("No email claim");
    }

    // Try to find an existing row
    const existing = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("tokenIdentifier"), tokenIdentifier))
      .first();

    if (existing) return existing._id;

    console.log(givenName, familyName)

    const full = givenName + " " + familyName
    
    // Insert new if missing
    return await ctx.db.insert("users", {
      tokenIdentifier: tokenIdentifier,
      email: email,
      name: full,
    });
  },
});


/**
 * Helper function: get the current signed-in Convex user document.
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  console.log("token ID is ", identity.tokenIdentifier)
  const firstUser = await ctx.db.query("users").first();
  console.log("first user", firstUser)


  // if (tokenIdentifier === "https://intense-whale-37.clerk.accounts.dev|user_2wQ48zv08Hll5ORtBju2yEpxC3h") {
  //   console.log("TRUE")
  // } else {
  //   console.log("FALSE -- something wrong")
  // }

  const user = await ctx.db
    .query("users")
    .filter((q) => q.eq(q.field("tokenIdentifier"), identity.tokenIdentifier))
    .first();

  console.log(user)

  if (!user) {
    // First-time sign-in: insert a placeholder record
    console.log("null user")
       
    // const newId = await ctx.db.insert("users", { tokenIdentifier });
    // user = await ctx.db.get(newId);
  }
  return user; 

};


/**
 * Public query: get the current user info, or null if not logged in.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    return user;
  },
});

/**
 * Public query: check if user needs to set their role (i.e., role field is undefined).
 */
export const needsRoleSelection = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return false;
    return user.role === undefined;
  },
});

/**
 * Public query: get a user by their Convex _id.
 */
export const getUserById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

/**
 * Public query: get all patients (for caregivers only).
 */
export const getAllPatients = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    const patients = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), ROLES.PATIENT))
      .collect();

    // Get latest form for each patient
    return Promise.all(
      patients.map(async (patient) => {
        const latestForm = await ctx.db
          .query("forms")
          .withIndex("by_patient", (q) => q.eq("patientId", patient._id))
          .order("desc")
          .first();

        return {
          ...patient,
          latestForm,
        };
      })
    );
  },
});

/**
 * Public mutation: set the current user's role (patient or caregiver).
 */
export const setUserRole = mutation({
  args: {
    role: v.union(v.literal(ROLES.PATIENT), v.literal(ROLES.CAREGIVER)),
    specialty: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Null user");

    const newUser = await ensureUser;

   

    if (user.role) throw new Error("Role already set");

    if (args.role === ROLES.PATIENT && args.specialty) {
      throw new Error("Patients cannot have a specialty");
    }

    await ctx.db.patch(user._id, {
      role: args.role,
      ...(args.specialty ? { specialty: args.specialty } : {}),
    });

    return await ctx.db.get(user._id);
  },
});

/**
 * Public mutation: update caregiver profile (name and specialty).
 */
export const updateCaregiverProfile = mutation({
  args: {
    name: v.string(),
    specialty: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(user._id, {
      name: args.name,
      specialty: args.specialty,
    });

    return await ctx.db.get(user._id);
  },
});

/**
 * Public mutation: update patient profile (name only).
 */
export const updatePatientProfile = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.PATIENT) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(user._id, {
      name: args.name,
    });

    return await ctx.db.get(user._id);
  },
});
