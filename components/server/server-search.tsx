"use client";

import { Button } from "@/components/ui/button";
import { Hash, Mic, Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { KeyboardEvent, useEffect, useState } from "react";
import { Channel, Member, Profile, Server } from "@/types";
import { useRouter } from "next/navigation";

interface ServerSearchProps {
  textChannels: Channel[];
  voiceChannels: Channel[];
  members: (Member & {
    profile: Profile;
  })[];
  server: Server;
}

export function ServerSearch({
  textChannels,
  voiceChannels,
  members,
  server,
}: ServerSearchProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onKeydown: (e: KeyboardEvent) => void = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open); // should use updated state in the listener handler
      }
    };
    //TODO to be resolved
    //@ts-ignore
    document.addEventListener("keydown", onKeydown);

    //@ts-ignore
    return () => document.removeEventListener("keydown", onKeydown);
  }, []);

  return (
    <>
      <button
        className="px-4 py-2 bg-transparent flex items-center 
        hover:bg-[#e3e5e8] transition w-full"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-sm ml-1">Search</span>
        <kbd
          className="ml-auto inline-flex gap-1 bg-[#e3e5e8] 
          select-none rounded-sm text-[10px] font-mono"
        >
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search members or channels" />
        <CommandList className="">
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Text channels" className="">
            {textChannels.map((channel) => (
              <CommandItem
                className="flex items-center hover:cursor-pointer"
                key={channel.id}
                onSelect={() =>
                  router.push(`/channels/${server.id}/${channel.id}`)
                }
              >
                <Hash className="h-4 w-4 mr-1" />
                {channel.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Voice channels">
            {voiceChannels.map((channel) => (
              <CommandItem
                className="flex items-center hover:cursor-pointer"
                key={channel.id}
                onSelect={() =>
                  router.push(`/channels/${server.id}/${channel.id}`)
                }
              >
                <Mic className="h-4 w-4 mr-1" />
                {channel.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Members">
            {members.map((member) => (
              <CommandItem
                className="flex items-center hover:cursor-pointer"
                key={member.id}
                onSelect={() => router.push(`/channels/me/${member.id}`)}
              >
                {member.profile.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
