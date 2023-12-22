import * as z from "zod";
import { Server as HttpServer } from "http";
import { Socket as NetSocket } from "net";
import type { Server as IOServer } from "socket.io";
import { NextApiResponse } from "next";

import {
  ChannelTypeEnum,
  MemberRoleEnum,
  channel_messages,
  channels,
  conversations,
  direct_messages,
  members,
  profiles,
  servers,
} from "./lib/schema";

export type Profile = typeof profiles.$inferSelect;
export type Server = typeof servers.$inferSelect;
export type Channel = typeof channels.$inferSelect;
export type Member = typeof members.$inferSelect;
export type ChannlMessage = typeof channel_messages.$inferSelect;
export type Conversation = typeof conversations.$inferSelect;
export type DirectMessage = typeof direct_messages.$inferSelect;

export type ServerWithMemberAndChannel = Server & {
  channels: Channel[];
  members: (Member & {
    profile: Profile;
  })[];
};

const role = z.enum(MemberRoleEnum.enumValues);
export type MemberRole = z.infer<typeof role>;
const channelTypes = z.enum(ChannelTypeEnum.enumValues);
export type ChannelType = z.infer<typeof channelTypes>;

interface SocketServer extends HttpServer {
  io?: IOServer;
}

interface SocketWithIO extends NetSocket {
  server: SocketServer;
}

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO;
}

export type ChannelMessageWithMemberAndProfile = ChannlMessage & {
  member: Member & {
    profile: Profile;
  };
  repliedMessage: RepliedMessage | null;
};

export type DirectMessageWithProfiles = DirectMessage & {
  conversation: {
    sender: Profile;
    receiver: Profile;
  };
  sender: Profile;
  repliedMessage: RepliedMessage | null;
};

export type ConversationWithProfiles = Conversation & {
  userOne: Profile;
  userTwo: Profile;
};

export interface RepliedMessage {
  content: string;
  member: {
    profile: {
      imageUrl: string;
      name: string;
    };
  };
  sender: {
    imageUrl: string;
    name: string;
  };
}
