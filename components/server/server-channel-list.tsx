"use client";

import {
  Channel,
  ChannelType,
  MemberRole,
  ServerWithMemberAndChannel,
} from "@/types";
import { Label } from "../ui/label";
import { Edit, Hash, Lock, Mic, Plus, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ActionTooltip } from "../action-tooltip";
// import { useModal } from "@/hooks/use-modal";
import { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { useAppDispatch } from "@/store";
import {
  toggleCreateChannel,
  toggleDeleteChannel,
  toggleEditChannel,
} from "@/store/toggle-modal-slice";
import Link from "next/link";

interface ChannelListProps {
  data: {
    type: ChannelType;
    channels: Channel[];
    role: MemberRole;
    server: ServerWithMemberAndChannel;
  };
}

export function ServerChannelList({
  data: { type, channels, role, server },
}: ChannelListProps) {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();

  const onEditChannel = (
    e: MouseEvent<HTMLButtonElement>,
    channel: Channel
  ) => {
    e.stopPropagation();
    dispatch(
      toggleEditChannel({
        type: "editChannel",
        open: true,
        data: { channel, server },
      })
    );
  };

  const onDeleteChannel = (
    e: MouseEvent<HTMLButtonElement>,
    channel: Channel
  ) => {
    e.stopPropagation();
    dispatch(
      toggleDeleteChannel({
        type: "deleteChannel",
        open: true,
        data: { channel, server },
      })
    );
  };

  return (
    <section className="mt-2 px-2">
      <p
        className="flex justify-between px-2 py-1 text-muted-foreground
      "
      >
        <Label className="text-sm font-semibold">
          {type === "text" ? "Text" : "Voice"} Channels
        </Label>
        {role !== "member" && (
          <ActionTooltip description="Create Channel" side="right">
            <button
              onClick={() =>
                dispatch(
                  toggleCreateChannel({
                    type: "createChannel",
                    open: true,
                    data: { channelType: type, server },
                  })
                )
              }
            >
              <Plus className="h-4 w-4 flex-shrink-0 hover:cursor-pointer" />
            </button>
          </ActionTooltip>
        )}
      </p>
      <ul>
        {channels.map((channel) => (
          <li
            key={channel.id}
            className={cn(
              "flex items-center p-2 hover:bg-[#e3e5e8] hover:cursor-pointer group rounded-md mb-1",
              params?.channelId === channel.id && "bg-[#e3e5e8]"
            )}
            onClick={() => router.push(`/channels/${server.id}/${channel.id}`)}
          >
            {channel.type === "text" ? (
              <Hash className="h-4 w-4 flex-shrink-0 mr-1" />
            ) : (
              <Mic className="w-4 h-4 flex-shrink-0 mr-1" />
            )}
            <ActionTooltip description={channel.name} side="top">
              <p className="text-primary truncate">{channel.name}</p>
            </ActionTooltip>
            {role !== "member" &&
              (channel.name === "general" ? (
                <Lock className="h-4 w-4 ml-auto" />
              ) : (
                <div
                  className="ml-auto flex space-x-1 opacity-0 group-hover:opacity-100
              transition"
                >
                  <ActionTooltip description="Edit Channel" side="top">
                    <button onClick={(e) => onEditChannel(e, channel)}>
                      <Edit className="h-4 w-4" />
                    </button>
                  </ActionTooltip>
                  <ActionTooltip description="Delete Channel" side="top">
                    <button onClick={(e) => onDeleteChannel(e, channel)}>
                      <Trash className="h-4 w-4" />
                    </button>
                  </ActionTooltip>
                </div>
              ))}
          </li>
        ))}
      </ul>
    </section>
  );
}
