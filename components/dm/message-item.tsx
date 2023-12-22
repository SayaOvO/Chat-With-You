"use client";

import { DirectMessage, Profile } from "@/types";
import { UserAvatar } from "../user-avatar";
import { useParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLastMessage } from "@/hooks/use-last-message";

interface MessageItemProps {
  peer: Profile & { conversationId: string };
}
export function MessageItem({ peer }: MessageItemProps) {
  const params = useParams();
  const router = useRouter();
  const { status, data } = useLastMessage({
    conversationId: peer.conversationId,
  });
  return (
    <div
      className={cn(
        "flex space-x-2 px-2 py-2 hover:bg-[#e3e5e8] hover:cursor-pointer rounded-lg",
        params?.memberId === peer.id && "bg-[#e3e5e8]"
      )}
      onClick={() => router.push(`/channels/me/${peer.id}`)}
    >
      <UserAvatar src={peer.imageUrl} />
      <div className="flex-1">
        <h3 className="flex items-center">
          {peer.name}
          {status === "success" && (
            <span className="ml-auto text-xs text-primary/60">{data?.time}</span>
          )}
        </h3>
        {status === "success" && (
          <p className="text-sm text-primary/60 truncate">{data?.content}</p>
        )}
      </div>
    </div>
  );
}
