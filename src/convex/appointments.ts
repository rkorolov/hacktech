import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ROLES } from "./schema";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

// Create a new appointment
export const createAppointment = mutation({
  args: {
    patientId: v.id("users"),
    date: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Only caregivers can create appointments");
    }

    console.log("")
    return await ctx.db.insert("appointments", {
      patientId: args.patientId,
      caregiverId: user._id,
      date: args.date,
      notes: args.notes,
    });
  },
});

// Get appointments for a patient
export const getPatientAppointments = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.PATIENT) {
      throw new Error("Unauthorized");
    }

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patient", (q) => q.eq("patientId", user._id))
      .order("desc")
      .collect();

    // Fetch caregiver details for each appointment
    return Promise.all(
      appointments.map(async (appointment) => {
        const caregiver = await ctx.db.get(appointment.caregiverId);
        return {
          ...appointment,
          caregiver,
        };
      })
    );
  },
});

// Get appointments for a caregiver
export const getCaregiverAppointments = query({
  args: {
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    status: v.optional(v.union(v.literal("upcoming"), v.literal("past"), v.literal("all"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    let query = ctx.db
      .query("appointments")
      .withIndex("by_caregiver", (q) => q.eq("caregiverId", user._id));

    if (args.startDate) {
      query = query.filter((q) => q.gte(q.field("date"), args.startDate!));
    }
    if (args.endDate) {
      query = query.filter((q) => q.lte(q.field("date"), args.endDate!));
    }

    // Filter by status if specified
    if (args.status === "upcoming") {
      query = query.filter((q) => q.gt(q.field("date"), Date.now()));
    } else if (args.status === "past") {
      query = query.filter((q) => q.lte(q.field("date"), Date.now()));
    }

    const appointments = await query.order("desc").collect();

    // Fetch patient details for each appointment
    return Promise.all(
      appointments.map(async (appointment) => {
        const patient = await ctx.db.get(appointment.patientId);
        return {
          ...appointment,
          patient,
        };
      })
    );
  },
});

// Get appointments for a specific patient (for caregivers)
export const getAppointmentsByPatientId = query({
  args: {
    patientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user || user.role !== ROLES.CAREGIVER) {
      throw new Error("Unauthorized");
    }

    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    // Fetch patient and caregiver details
    const patient = await ctx.db.get(args.patientId);
    
    return Promise.all(
      appointments.map(async (appointment) => {
        const caregiver = await ctx.db.get(appointment.caregiverId);
        return {
          ...appointment,
          patient,
          caregiver,
        };
      })
    );
  },
});

// Get a specific appointment by ID
export const getAppointmentById = query({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) return null; // Return null instead of throwing error when appointment not found

    // Check authorization - allow either the patient or the assigned caregiver
    if (
      (user.role === ROLES.PATIENT && appointment.patientId !== user._id) ||
      (user.role === ROLES.CAREGIVER && appointment.caregiverId !== user._id)
    ) {
      throw new Error("Unauthorized");
    }

    // Fetch related user details
    const patient = await ctx.db.get(appointment.patientId);
    const caregiver = await ctx.db.get(appointment.caregiverId);

    return {
      ...appointment,
      patient,
      caregiver,
    };
  },
});

// Update an appointment
export const updateAppointment = mutation({
  args: {
    appointmentId: v.id("appointments"),
    date: v.optional(v.number()),
    notes: v.optional(v.string()),
    recommendations: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    // Only the assigned caregiver can update the appointment
    if (appointment.caregiverId !== user._id) {
      throw new Error("Unauthorized");
    }

    const updates: any = { ...args };
    delete updates.appointmentId;

    await ctx.db.patch(args.appointmentId, updates);
    return await ctx.db.get(args.appointmentId);
  },
});

// Delete/cancel an appointment
export const deleteAppointment = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) throw new Error("Appointment not found");

    // Only the assigned caregiver or admin can delete appointments
    if (appointment.caregiverId !== user._id && user.role !== ROLES.ADMIN) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.appointmentId);
  },
});