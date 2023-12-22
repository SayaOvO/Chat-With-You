import { Server } from "@/types";
import { and, asc, desc, eq, inArray, or } from "drizzle-orm";
import { db } from "./db";
import {
  channel_messages,
  channels,
  conversations,
  direct_messages,
  members,
  servers,
} from "./schema";

export async function getAllServersJoined(id: string) {
  const sq = db
    .select({
      serverId: members.serverId,
    })
    .from(members)
    .where(eq(members.profileId, id))
    .as("sq");

  const allServers: Server[] = await db
    .select()
    .from(servers)
    .where(inArray(servers.id, db.select().from(sq)));

  return allServers;
}

export async function getServerWithChannelsAndMembers(serverId: string) {
  const server = await db.query.servers.findFirst({
    where: eq(servers.id, serverId),
    with: {
      channels: {
        orderBy: asc(channels.createdAt),
      },
      members: {
        with: {
          profile: true,
        },
      },
    },
  });

  return server;
  // return JSON.parse(JSON.stringify(server));
}

export async function hasPermission(profileId: string, serverId: string) {
  const member = await db.query.members.findFirst({
    where: and(
      eq(members.profileId, profileId),
      eq(members.serverId, serverId)
    ),
  });
  if (member && member.memberRole !== "member") {
    return true;
  }
  return false;
}

export async function hasEditPermision(
  profileId: string,
  serverId: string,
  messageId: number
) {
  const member = await db.query.members.findFirst({
    where: and(
      eq(members.profileId, profileId),
      eq(members.serverId, serverId)
    ),
  });

  if (!member) {
    return false;
  }

  const [message] = await db
    .select()
    .from(channel_messages)
    .where(
      and(
        eq(channel_messages.id, +messageId),
        eq(channel_messages.memberId, member.id),
        eq(channel_messages.isDeleted, false)
      )
    );

  if (!message) {
    return false;
  }
  return true;
}

export async function hasDeletePermision(
  profileId: string,
  serverId: string,
  messageId: string
) {
  const member = await db.query.members.findFirst({
    where: and(
      eq(members.profileId, profileId),
      eq(members.serverId, serverId)
    ),
  });

  if (!member) {
    return false;
  }

  const [message] = await db
    .select()
    .from(channel_messages)
    .where(
      and(
        eq(channel_messages.id, +messageId),
        eq(channel_messages.memberId, member.id),
        eq(channel_messages.isDeleted, false)
      )
    );

  return member.memberRole !== "member" || message;
}

export async function getAllChatsInvolved(profileId: string) {
  const allConversations = await db.query.conversations.findMany({
    where: or(
      eq(conversations.userOneId, profileId),
      eq(conversations.userTwoId, profileId)
    ),
    with: {
      userOne: true,
      userTwo: true,
    },
  });

  return allConversations;
}

export async function getLastMessage(conversationId: string) {
  const conversation = await db.query.conversations.findFirst({
    where: eq(conversations.id, conversationId),
  });

  if (!conversation) {
    return;
  }

  const lastMessage = await db.query.direct_messages.findFirst({
    where: eq(direct_messages.conversationId, conversation.id),
    orderBy: desc(direct_messages.id),
  });

  return lastMessage;
}
