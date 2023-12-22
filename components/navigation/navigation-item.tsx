"use client";

import { cn } from "@/lib/utils";
import { Server } from "@/types";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ActionTooltip } from "../action-tooltip";

interface NavigationItemProps {
  server: Server;
}
export function NavigationItem({ server }: NavigationItemProps) {
  const router = useRouter();
  const params = useParams();
  return (
    <div
      className="w-full flex items-center justify-center
    relative group"
    >
      <ActionTooltip description={server.name} side="right">
        <button
          className="relative w-12 h-12 transition-all hover:cursor-pointer"
          onClick={() => router.push(`/channels/${server.id}`)}
        >
          <Image
            src={server.imageUrl}
            alt={`${server.name}`}
            fill
            sizes="100 100"
            className={cn(
              "rounded-full object-cover transition-all overflow-hidden",
              server.id !== params?.serverId
                ? "group-hover:rounded-2xl"
                : "rounded-2xl"
            )}
          />
        </button>
      </ActionTooltip>
      <span
        className={cn(
          "absolute left-0 h-[30%] inline-block bg-primary/80 w-[4px] rounded-xl\
          rounded-r-xl transition",
          params?.serverId === server.id ? "h-[70%]" : "group-hover:h-[45%]"
        )}
      />
    </div>
  );
}
