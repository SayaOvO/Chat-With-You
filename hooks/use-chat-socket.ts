import { formatLastestMessageTime } from "@/lib/format-time";
import { useSocket } from "@/providers/socket-provider";
import {
  ChannelMessageWithMemberAndProfile,
  ChannlMessage,
  DirectMessageWithProfiles,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface ChatSocketProps {
  type: "channel" | "conversation";
  queryKey: string;
  addKey: string;
  updateKey: string;
  deleteKey: string;
}
export function useChatSocket({
  queryKey,
  addKey,
  updateKey,
  deleteKey,
  type,
}: ChatSocketProps) {
  const { socket, isConnected } = useSocket();
  const client = useQueryClient();

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.on(
      addKey,
      (
        message: ChannelMessageWithMemberAndProfile | DirectMessageWithProfiles
      ) => {
        client.setQueryData([queryKey], (oldData: any) => {
          if (!oldData || !oldData.pages || oldData.pages.length === 0) {
            return {
              pages: [
                {
                  messages: [message],
                },
              ],
            };
          }
          const newData = [...oldData.pages];
          newData[0] = {
            ...newData[0],
            messages: [message, ...newData[0].messages],
          };
          return {
            ...oldData,
            pages: newData,
          };
        });

        if (type === "conversation") {
          client.setQueryData([`${queryKey}:lastest`], {
            content: message.content,
            time: formatLastestMessageTime(new Date(message.createdAt)),
          });
        }
      }
    );

    socket.on(updateKey, (message: ChannlMessage) => {
      client.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                messages: [message],
              },
            ],
          };
        }
        const newData = [...oldData.pages];
        newData[0] = {
          ...newData[0],
          messages: newData[0].messages.map(
            (m: ChannelMessageWithMemberAndProfile) =>
              m.id === message.id
                ? {
                    ...m,
                    content: message.content,
                    updatedAt: message.updatedAt,
                  }
                : m
          ),
        };
        return {
          ...oldData,
          pages: newData,
        };
      });

      if (type === "conversation") {
        client.invalidateQueries({
          queryKey: [`${queryKey}:lastest`],
        });
      }
    });

    socket.on(deleteKey, (messageId: string) => {
      client.setQueryData([queryKey], (oldData: any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [
              {
                messages: [],
              },
            ],
          };
        }

        const newData = [...oldData.pages];
        newData[0] = {
          ...newData[0],
          messages: newData[0].messages.filter(
            (m: ChannelMessageWithMemberAndProfile) => m.id !== +messageId
          ),
        };
        return {
          ...oldData,
          pages: newData,
        };
      });

      if (type === "conversation") {
        client.invalidateQueries({
          queryKey: [`${queryKey}:lastest`],
        });
      }
    });

    return () => {
      socket.off(updateKey);
      socket.off(addKey);
    };
  }, [addKey, socket, client, updateKey, deleteKey]);
}
