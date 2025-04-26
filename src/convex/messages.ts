import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { ROLES } from "./schema";
import { getCurrentUser } from "./users";
import { Id } from "./_generated/dataModel";

// Send a message to another user
export const sendMessage = mutation({
  args: {
    toId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Verify recipient exists
    const recipient = await ctx.db.get(args.toId);
    if (!recipient) throw new Error("Recipient not found");

    // Verify sender and recipient roles
    if (
      (user.role === ROLES.PATIENT && recipient.role !== ROLES.CAREGIVER) ||
      (user.role === ROLES.CAREGIVER && recipient.role !== ROLES.PATIENT)
    ) {
      throw new Error("Invalid recipient role");
    }

    return await ctx.db.insert("messages", {
      fromId: user._id,
      toId: args.toId,
      content: args.content,
      sentAt: Date.now(),
      read: false,
    });
  },
});

// Get messages for the current user
export const getMessages = query({
  args: {
    otherUserId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    let query = ctx.db.query("messages");

    if (args.otherUserId) {
      // Get messages between current user and specific other user
      query = query
        .filter((q) =>
          q.or(
            q.and(q.eq(q.field("fromId"), user._id), q.eq(q.field("toId"), args.otherUserId)),
            q.and(q.eq(q.field("toId"), user._id), q.eq(q.field("fromId"), args.otherUserId))
          )
        );
    } else {
      // Get all messages involving the current user
      query = query.filter((q) =>
        q.or(q.eq(q.field("fromId"), user._id), q.eq(q.field("toId"), user._id))
      );
    }

    const messages = await query
      .order("desc")
      .collect();

    // Fetch user details for each message
    return Promise.all(
      messages.map(async (message) => {
        const [fromUser, toUser] = await Promise.all([
          ctx.db.get(message.fromId),
          ctx.db.get(message.toId),
        ]);
        return {
          ...message,
          from: fromUser,
          to: toUser,
        };
      })
    );
  },
});

// Get unread message count
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const unreadMessages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.and(q.eq(q.field("toId"), user._id), q.eq(q.field("read"), false))
      )
      .collect();

    return unreadMessages.length;
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: {
    messageIds: v.array(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    // Verify all messages belong to the current user
    const messages = await Promise.all(
      args.messageIds.map((id) => ctx.db.get(id))
    );

    for (const message of messages) {
      if (!message) continue;
      if (message.toId !== user._id) {
        throw new Error("Cannot mark messages as read for other users");
      }
      await ctx.db.patch(message._id, { read: true });
    }
  },
});

// Get message threads (conversations with unique users)
export const getMessageThreads = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Unauthorized");

    const messages = await ctx.db
      .query("messages")
      .filter((q) =>
        q.or(q.eq(q.field("fromId"), user._id), q.eq(q.field("toId"), user._id))
      )
      .order("desc")
      .collect();

    // Group messages by conversation partner
    const threadMap = new Map<Id<"users">, typeof messages[0]>();
    
    for (const message of messages) {
      const partnerId = message.fromId === user._id ? message.toId : message.fromId;
      if (!threadMap.has(partnerId)) {
        threadMap.set(partnerId, message);
      }
    }

    // Fetch user details for each thread
    const threads = await Promise.all(
      Array.from(threadMap.entries()).map(async ([partnerId, lastMessage]) => {
        const partner = await ctx.db.get(partnerId);
        const unreadCount = await ctx.db
          .query("messages")
          .filter((q) =>
            q.and(
              q.eq(q.field("fromId"), partnerId),
              q.eq(q.field("toId"), user._id),
              q.eq(q.field("read"), false)
            )
          )
          .collect();

        return {
          partner,
          lastMessage,
          unreadCount: unreadCount.length,
        };
      })
    );

    return threads.sort((a, b) => b.lastMessage.sentAt - a.lastMessage.sentAt);
  },
});