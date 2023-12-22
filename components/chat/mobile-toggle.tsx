import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { NavigationSidebar } from "../navigation/navigation-sidebar";
import { ServerSidebar } from "../server/server-sidebar";
import { MessageSidebar } from "../dm/message-sidebar";
import { currentProfile } from "@/lib/current-profile";
import { redirectToSignIn } from "@clerk/nextjs";

interface MobileToggleProps {
  serverId?: string;
  type: "channel" | "dm";
}
export async function MobileToggle({
  serverId,
  type,
}: MobileToggleProps) {

  const profile = await currentProfile();

  if (!profile) {
    return redirectToSignIn();
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="md:hidden">
          <Menu className="h-5 w-5 mr-2" />
        </button>
      </SheetTrigger>

      <SheetContent side="left" className="w-[312px] p-0 flex gap-0">
        <NavigationSidebar />
        {type === "channel" && !!serverId && (
          <ServerSidebar serverId={serverId!} />
        )}
        {type === "dm" && (
          <MessageSidebar
            profileId={profile.id}
            name={profile.name}
            username={profile.userName}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
