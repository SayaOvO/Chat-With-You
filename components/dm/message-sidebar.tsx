"use client";

import { currentProfile } from "@/lib/current-profile";
import { ScrollArea } from "../ui/scroll-area";
import { MessageList } from "./message-list";
import { MessageSearch } from "./message-search";
import { UserButton, UserProfile, redirectToSignIn } from "@clerk/nextjs";
import { getAllChatsInvolved, getLastMessage } from "@/lib/query";
import { Conversation, ConversationWithProfiles } from "@/types";
import { useConversationsQuery } from "@/hooks/use-conversations";
import { useConversationSocket } from "@/hooks/use-conversation-socket";
import { UserInfo } from "../user-info";
import { Skeleton } from "../ui/skeleton";

interface MessageSidebarProps {
  profileId: string;
  name: string;
  username: string;
}
export function MessageSidebar({ profileId, name, username }: MessageSidebarProps) {
  const { data, status } = useConversationsQuery({ profileId });
  useConversationSocket();

  const peers = data?.map((conversation: any) =>
    conversation.userOneId === profileId
      ? {
          ...conversation.userTwo,
          conversationId: conversation.id,
        }
      : {
          ...conversation.userOne,
          conversationId: conversation.id,
        }
  );

  return (
    <aside className="w-full h-full bg-[#f2f3f5] flex flex-col">
      <h2 className="px-3 py-4 font-semibold select-none">Direct Messages</h2>
      <ScrollArea className="flex-1">
        <MessageSearch />
        {status === "pending" && <div className="flex items-center space-x-2 px-4 py-2">
          <Skeleton className="h-10 w-10 rounded-full bg-[#e3e5e8]" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-12 bg-[#e3e5e8]" />
            <Skeleton className="h-4 w-32 bg-[#e3e5e8]" />
          </div>
          </div>}
        {status === "error" && <p>Something wrong happened</p>}
        {peers && <MessageList peers={peers} />}
      </ScrollArea>
      <UserInfo 
        profileName={name}
        profileUserName={username}
      />
    </aside>
  );
}
