import { currentProfile } from "@/lib/current-profile";
import { ScrollArea } from "../ui/scroll-area";
import { NavigationDM } from "./navigation-dm";
import { UserButton, redirectToSignIn } from "@clerk/nextjs";
import { getAllServersJoined } from "@/lib/query";
import { NavigationItem } from "./navigation-item";
import { NavigationAddServer } from "./navigation-add-server";

export async function NavigationSidebar() {
  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  const allServers = await getAllServersJoined(profile.id);
  return (
    <div className="w-[72px] h-full bg-[#e3e5e8] flex flex-col">
      <NavigationDM />
      <ScrollArea className="flex-1">
        <ul className="flex flex-col space-y-2 my-3">
          {allServers.map((server) => (
            <NavigationItem key={server.id} server={server} />
          ))}
        </ul>
        <NavigationAddServer />
      </ScrollArea>
    </div>
  );
}
