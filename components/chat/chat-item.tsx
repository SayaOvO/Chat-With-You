"use client";

import {
  Copy,
  CornerLeftUp,
  CornerRightDown,
  CornerUpLeft,
  Edit,
  Pencil,
  Trash,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import qs from "query-string";

import {
  ChannelMessageWithMemberAndProfile,
  DirectMessageWithProfiles,
  Member,
  Profile,
} from "@/types";
import { UserAvatar } from "../user-avatar";
import { formatTime } from "@/lib/format-time";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { withHistory } from "slate-history";
import { Descendant, Editor, Node, Transforms, createEditor } from "slate";
import { decorate, renderLeaf } from "./chat-input";
import axios from "axios";
import { useAppDispatch } from "@/store";
import { toggleDeleteMessage } from "@/store/toggle-modal-slice";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";
import { replying } from "@/store/toggle-replying-slice";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQueryClient } from "@tanstack/react-query";

interface ChatItemProps {
  type: "channel" | "conversation";
  apiUrl: string;
  query: Record<string, string>;
  canDelete: boolean;
  isMessageOwner: boolean;
  imageUrl: string;
  senderName: string;
  chatId: string;
  isEdited: boolean;
  content: string;
  messageId: string;
  repliedMessage: {
    content: string;
    imageUrl: string;
    name: string;
  } | null;
  createdAt: string;
  senderId: string;
}
export function ChatItem({
  // message,
  apiUrl,
  query,
  type,
  canDelete,
  isMessageOwner,
  imageUrl,
  senderName,
  chatId,
  isEdited,
  content,
  messageId,
  repliedMessage,
  createdAt,
  senderId,
}: ChatItemProps) {
  const initialValue: (Descendant & { type: string })[] = useMemo(
    () => [
      {
        type: "paragraph",
        children: [
          {
            text: content,
          },
        ],
      },
    ],
    []
  );

  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const dispatch = useAppDispatch();
  const client = useQueryClient();

  const handleUpdate = async (value: any) => {
    try {
      const message: string = value
        .map((n: any) => Node.string(n))
        .join("\n")
        .trim();
      if (message === "") return;
      const url = qs.stringifyUrl({
        url: apiUrl,
        query,
      });
      await axios.patch(url, { content: message });

      setIsEditing(false);
    } catch (error) {
      console.log("update messages", error);
    }
  };

  const handleDeleteDM = async () => {
    try {
      await axios.delete(`/api/socket/conversations/${chatId}`);
      router.push("/channels/me");
      router.refresh();
      client.invalidateQueries({
        queryKey: ["conversations"]
      });

    } catch (error) {
      console.log("DELETE DM", error);
    }
  }

  const onCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content);
    }
  };

  useEffect(() => {
    if (isEditing) {
      //It won't work if in the event handler
      ReactEditor.focus(editor);
      Transforms.select(editor, Editor.end(editor, []));
    }
  }, [isEditing]);
  return (
    <div id={messageId} className="flex py-2 group">
      <UserAvatar
        src={imageUrl}
        className={repliedMessage ? "relative top-6" : ""}
      />
      <div className="ml-2 flex-1">
        {repliedMessage && (
          <div
            className="flex h-6 items-center text-sm 
            relative before:block before:content-[''] before:absolute before:bottom-0
            before:-left-6 before:top-[10px] before:w-[22px] before:h-3 
             before:border-primary-800 before:border-solid
            before:rounded-tl-lg  before:border-2 
            before:border-r-0 before:border-b-0 "
          >
            <UserAvatar src={repliedMessage.imageUrl} className="h-5 w-5" />
            <p className="text-xs ml-1 font-semibold mr-2 text-primary/70">
              {repliedMessage.name}
            </p>
            <p className="text-primary/90">{repliedMessage.content}</p>
          </div>
        )}
        <h3>
          <ContextMenu>
            <ContextMenuTrigger>
              <span className="font-medium hover:cursor-pointer hover:underline">
                {senderName}
              </span>
            </ContextMenuTrigger>
            <ContextMenuContent>
              {type === "channel" && !isMessageOwner && (
                <ContextMenuItem
                  className="hover:cursor-pointer"
                  onClick={() => {
                    router.push(`/channels/me/${senderId}`);
                    router.refresh();
                  }}
                >
                  Message
                </ContextMenuItem>
              )}

              <ContextMenuItem className="hover:cursor-pointer">
                Mention
              </ContextMenuItem>
              {type === "conversation" && !isMessageOwner && (
                <ContextMenuItem 
                  className="hover:cursor-pointer"
                  onClick={() => handleDeleteDM()}
                >
                  Close DM
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
          <time dateTime={createdAt} className="text-xs ml-2 text-primary/80">
            {createdAt}
          </time>
        </h3>

        {isEditing ? (
          <Slate editor={editor} initialValue={initialValue}>
            <form className="relative">
              <Editable
                decorate={decorate}
                renderLeaf={renderLeaf}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.shiftKey) {
                    return;
                  } else if (event.key === "Enter") {
                    event.preventDefault();
                    handleUpdate(editor.children);
                  } else if (event.key === "Escape") {
                    setIsEditing(false);
                  }
                }}
                className="bg-muted p-2 rounded-md outline-none text-primary/80"
              />
              <p className="text-xs mt-1">
                escape to <span className="text-blue-500">cancel</span>, enter
                to <span className="text-blue-500">save</span>
              </p>
            </form>
          </Slate>
        ) : (
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div className="flex items-center space-x-1">
                <div>
                  {content.split("\n").map((line, idx) => (
                    <div key={idx} className="text-primary">
                      {line}
                    </div>
                  ))}
                </div>
                {isEdited && (
                  <span className="text-xs text-primary/80">(edited)</span>
                )}
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48 text-primary/80">
              <ContextMenuItem
                className="items-center justify-between hover:cursor-pointer px-3"
                onClick={() =>
                  dispatch(
                    replying({
                      id: chatId,
                      data: {
                        replyingId: messageId.toString(),
                        replyingName: senderName,
                      },
                    })
                  )
                }
              >
                Reply
                <CornerUpLeft className="h-4 w-4" />
              </ContextMenuItem>
              {isMessageOwner && (
                <ContextMenuItem
                  className="items-center justify-between hover:cursor-pointer px-3"
                  onClick={() => {
                    setIsEditing(true);
                  }}
                >
                  Edit Message
                  <Pencil className="h-4 w-4" />
                </ContextMenuItem>
              )}
              <ContextMenuItem
                className="items-center justify-between hover:cursor-pointer px-3"
                onClick={() => onCopy()}
              >
                Copy Text
                <Copy className="h-4 w-4" />
              </ContextMenuItem>
              {canDelete && (
                <ContextMenuItem
                  className="items-center justify-between hover:cursor-pointer px-3 
                text-rose-600 focus:text-rose-700"
                  onClick={() => {
                    dispatch(
                      toggleDeleteMessage({
                        open: true,
                        type: "deleteMessage",
                        data: {
                          apiUrl,
                          query,
                        },
                      })
                    );
                  }}
                >
                  Delete Message
                  <Trash className="h-4 w-4" />
                </ContextMenuItem>
              )}
            </ContextMenuContent>
          </ContextMenu>
        )}
      </div>
      <p className="flex relative top-6">
        <CornerUpLeft
          className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 hover:cursor-pointer
          transition-opacity"
          onClick={() =>
            dispatch(
              replying({
                id: chatId,
                data: {
                  replyingId: messageId.toString(),
                  replyingName: senderName,
                },
              })
            )
          }
        />
        {isMessageOwner && (
          <Edit
            className="h-4 w-4 hover:cursor-pointer opacity-0
            group-hover:opacity-100 transition-all mr-2"
            onClick={() => {
              setIsEditing(true);
            }}
          />
        )}
        {canDelete && (
          <Trash
            className="h-4 w-4 text-rose-500 hover:cursor-pointer opacity-0 group-hover:opacity-100 transition-all"
            onClick={() =>
              dispatch(
                toggleDeleteMessage({
                  open: true,
                  type: "deleteMessage",
                  data: {
                    apiUrl,
                    query,
                  },
                })
              )
            }
          />
        )}
      </p>
    </div>
  );
}
