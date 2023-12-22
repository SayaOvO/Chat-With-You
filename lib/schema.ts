import { relations, sql } from "drizzle-orm";
import {
  AnyPgColumn,
  bigint,
  bigserial,
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").unique().notNull(),
  name: varchar("name").notNull(),
  userName: varchar("username").notNull().unique(),
  email: varchar("email").notNull(),
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const servers = pgTable(
  "servers",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name").unique().notNull(),
    inviteCode: text("invite_code").notNull().unique(),
    imageUrl: text("image_url").notNull(),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    profileIdx: index("profile_idx").on(table.profileId),
  })
);

export const ChannelTypeEnum = pgEnum("channel_type", ["text", "voice"]);

export const channels = pgTable(
  "channels",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    name: varchar("name").notNull(),
    type: ChannelTypeEnum("channel_type").default("text").notNull(),
    serverId: uuid("server_id")
      .notNull()
      .references(() => servers.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    serverIdx: index("server_idx").on(table.serverId),
    unq: unique("server_channel_name_uniq").on(table.name, table.serverId),
  })
);

export const MemberRoleEnum = pgEnum("member_role", [
  "member",
  "owner",
  "moderator",
]);

export const members = pgTable(
  "members",
  {
    id: uuid("id")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    profileId: uuid("profile_id")
      .notNull()
      .references(() => profiles.id, {
        onDelete: "cascade",
      }),
    serverId: uuid("server_id")
      .notNull()
      .references(() => servers.id, {
        onDelete: "cascade",
      }),
    memberRole: MemberRoleEnum("member_role").default("member"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    profileIdx: index("profile_idx").on(table.profileId),
    serverIdx: index("server_idx").on(table.serverId),
    uniq: unique("server_profile").on(table.profileId, table.serverId),
  })
);

export const channel_messages = pgTable(
  "channel_messages",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, {
        onDelete: "cascade",
      }),
    channelId: uuid("channel_id")
      .notNull()
      .references(() => channels.id, {
        onDelete: "cascade",
      }),
    content: text("content").notNull(),
    fileUrl: text("file_url"),
    isDeleted: boolean("is_deleted").notNull().default(false),
    replyTo: bigint("replied_to", { mode: "number" }).references(
      (): AnyPgColumn => channel_messages.id,
      {
        onDelete: "cascade",
      }
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    profileIdx: index("profile_idx").on(table.memberId),
    channelIdx: index("channel_idx").on(table.channelId),
  })
);

export const conversations = pgTable(
  "conversations",
  {
    id: uuid("conversation")
      .primaryKey()
      .default(sql`gen_random_uuid()`),
    userOneId: uuid("user_one_id")
      .notNull()
      .references(() => profiles.id),
    userTwoId: uuid("user_two_id")
      .notNull()
      .references(() => profiles.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    userOneIdx: index("user_one_idx").on(table.userOneId),
    userTwoIdx: index("user_two_idx").on(table.userTwoId),
    senderReceiverUniq: unique("users_uniq").on(
      table.userOneId,
      table.userTwoId
    ),
  })
);

export const conversationsRelations = relations(
  conversations,
  ({ many, one }) => ({
    directMessages: many(direct_messages),
    userOne: one(profiles, {
      fields: [conversations.userOneId],
      references: [profiles.id],
      relationName: "user_one",
    }),
    userTwo: one(profiles, {
      fields: [conversations.userTwoId],
      references: [profiles.id],
      relationName: "user_two",
    }),
  })
);

export const direct_messages = pgTable(
  "direct_messages",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    fileUrl: text("file_url"),
    replyTo: bigint("replied_to", { mode: "number" }).references(
      (): AnyPgColumn => direct_messages.id,
      {
        onDelete: "cascade",
      }
    ),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => ({
    senderIdx: index("sender_idx").on(table.senderId),
    conversationIdx: index("conversation_idx").on(table.conversationId),
  })
);

export const directMessagesRelations = relations(
  direct_messages,
  ({ one }) => ({
    conversation: one(conversations, {
      fields: [direct_messages.conversationId],
      references: [conversations.id],
      relationName: "conversation",
    }),
    sender: one(profiles, {
      fields: [direct_messages.senderId],
      references: [profiles.id],
      relationName: "sender",
    }),
    repliedMessage: one(direct_messages, {
      fields: [direct_messages.replyTo],
      references: [direct_messages.id],
      relationName: "reply_to",
    }),
  })
);

export const serversRelations = relations(servers, ({ many }) => ({
  channels: many(channels),
  members: many(members),
}));

export const channelsRelations = relations(channels, ({ one }) => ({
  server: one(servers, {
    fields: [channels.serverId],
    references: [servers.id],
  }),
}));

export const memberRelations = relations(members, ({ one }) => ({
  server: one(servers, {
    fields: [members.serverId],
    references: [servers.id],
    relationName: "server",
  }),
  profile: one(profiles, {
    fields: [members.profileId],
    references: [profiles.id],
    relationName: "profile",
  }),
}));

export const channelMessageRelations = relations(
  channel_messages,
  ({ one }) => ({
    member: one(members, {
      fields: [channel_messages.memberId],
      references: [members.id],
      relationName: "member",
    }),
    channel: one(channels, {
      fields: [channel_messages.channelId],
      references: [channels.id],
      relationName: "channel",
    }),
    repliedMessage: one(channel_messages, {
      fields: [channel_messages.replyTo],
      references: [channel_messages.id],
    }),
  })
);
