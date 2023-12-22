import { currentProfile } from "@/lib/current-profile";
import { getServerWithChannelsAndMembers } from "@/lib/query";
import { Member, ServerWithMemberAndChannel } from "@/types";
import { UserButton, redirectToSignIn } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { ServerHeader } from "./server-header";
import { ServerSearch } from "./server-search";
import { ServerChannelList } from "./server-channel-list";
import { ScrollArea } from "../ui/scroll-area";
import { UserInfo } from "../user-info";

export async function ServerSidebar({ serverId }: { serverId: string }) {
  const profile = await currentProfile();
  if (!profile) {
    return redirectToSignIn();
  }

  const server: ServerWithMemberAndChannel | undefined =
    await getServerWithChannelsAndMembers(serverId);

  if (!server) {
    return redirect("/");
  }

  const member = server.members.find(
    (member) => member.profileId === profile.id
  );

  if (!member) {
    redirect("/");
  }

  const role = member.memberRole!;
  const textChannels = server.channels.filter(
    (channel) => channel.type === "text"
  );
  const voiceChannels = server.channels.filter(
    (channel) => channel.type === "voice"
  );

  return (
    <div className="w-[240px] h-full bg-[#f2f3f5] flex flex-col">
      <ServerHeader server={server} role={role} profile={profile} />
      <ScrollArea className="flex-1">
        <ServerSearch
          server={server}
          textChannels={textChannels}
          voiceChannels={voiceChannels}
          members={server.members}
        />

        <ServerChannelList
          data={{
            type: "text",
            channels: textChannels,
            role: role,
            server: server,
          }}
        />

        <ServerChannelList
          data={{
            type: "voice",
            channels: voiceChannels,
            role: role,
            server: server,
          }}
        />
      </ScrollArea>

      <UserInfo 
        profileName={profile.name}
        profileUserName={profile.userName}
      />
    </div>
  );
}
