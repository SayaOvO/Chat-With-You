"use client";

import { useChatQuery } from "@/hooks/use-chat-query";
import { useSocket } from "@/providers/socket-provider";
import {
  ChannelMessageWithMemberAndProfile,
  DirectMessageWithProfiles,
  Member,
  Profile,
} from "@/types";
import { Fragment, Ref, Suspense, useRef } from "react";
import { ChatItem } from "./chat-item";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { ChatWelcome } from "./chat-welcome";
import { Loader2 } from "lucide-react";
import { useChatAutoScroll } from "@/hooks/use-chat-autoscroll";
import { formatTime } from "@/lib/format-time";
import { Skeleton } from "../ui/skeleton";

interface ChatMessagesProps {
  apiUrl: string;
  chatId: string;
  chatName: string;
  type: "channel" | "conversation";
  socketApiUrl: string;
  query: Record<string, string>;
  isMod?: boolean;
  profile: Profile;
  paramKey: "channelId" | "conversationId";
}
export function ChatMessages({
  apiUrl,
  chatId,
  chatName,
  type,
  socketApiUrl,
  query,
  isMod,
  profile,
  paramKey,
}: ChatMessagesProps) {
  const chatRef = useRef<HTMLDivElement>(null);
  const { status, data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useChatQuery({
      queryKey: chatId,
      apiUrl,
      paramKey,
      paramValue: chatId,
    });

  useChatSocket({
    queryKey: chatId,
    addKey: `chat:${chatId}:messages`,
    updateKey: `chat:${chatId}:messages:update`,
    deleteKey: `chat:${chatId}:messages:delete`,
    type,
  });

  useChatAutoScroll({
    chatRef,
    loadMore: fetchNextPage,
    shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
  });

  if (status === "pending") {
    return (
      <p className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin h-5 w-5" />
      </p>
    );
  }
  if (status === "error") {
    return <p>Something wrong happened.</p>;
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col px-4" ref={chatRef}>
      {!hasNextPage && <div className="flex-1" />}
      {!hasNextPage && <ChatWelcome name={chatName} type={type} />}
      {hasNextPage && (
        <div className="flex justify-center">
          {isFetchingNextPage ? (
            <Loader2 className="h-6 w-6 animate-spin my-2 text-zinc-600" />
          ) : (
            <button
              className="text-zinc-500 text-xs hover:text-zinc-600 transition my-2"
              onClick={() => fetchNextPage()}
            >
              Load previous message
            </button>
          )}
        </div>
      )}
      <div className=" mt-auto flex-col-reverse flex">
        {data?.pages.map((page, idx) => (
          <Fragment key={idx}>
            {page.messages.map(
              (
                message:
                  | ChannelMessageWithMemberAndProfile
                  | DirectMessageWithProfiles
              ) => {
                if ("member" in message) {
                  return (
                    <ChatItem
                      key={message.id}
                      imageUrl={message.member.profile.imageUrl}
                      type={type}
                      apiUrl={`${socketApiUrl}/${message.id}`}
                      query={query}
                      senderName={message.member.profile.name}
                      canDelete={
                        isMod ||
                        message.member.profile.userId === profile.userId
                      }
                      isMessageOwner={
                        message.member.profile.userId === profile.userId
                      }
                      chatId={chatId}
                      isEdited={
                        message.createdAt.toString() !==
                        message.updatedAt.toString()
                      }
                      content={message.content}
                      messageId={message.id.toString()}
                      repliedMessage={
                        message.repliedMessage && {
                          content: message.repliedMessage.content,
                          imageUrl:
                            message.repliedMessage.member?.profile.imageUrl,
                          name: message.repliedMessage.member?.profile.name,
                        }
                      }
                      createdAt={formatTime(new Date(message.createdAt))}
                      senderId={message.member.profile.id}
                    />
                  );
                } else {
                  return (
                    <ChatItem
                      content={message.content}
                      messageId={message.id.toString()}
                      repliedMessage={
                        message.repliedMessage && {
                          imageUrl: message.repliedMessage.sender.imageUrl,
                          content: message.repliedMessage.content,
                          name: message.repliedMessage.sender.name,
                        }
                      }
                      key={message.id}
                      imageUrl={message.sender.imageUrl}
                      senderName={message.sender.name}
                      senderId={message.senderId}
                      type={type}
                      apiUrl={`${socketApiUrl}/${message.id}`}
                      query={query}
                      canDelete={message.sender.id === profile.id}
                      isMessageOwner={message.sender.id === profile.id}
                      chatId={chatId}
                      createdAt={formatTime(new Date(message.createdAt))}
                      isEdited={
                        message.createdAt.toString() !==
                        message.updatedAt.toString()
                      }
                    />
                  );
                }
              }
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
