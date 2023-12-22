import { AtSign, Hash, MoveLeft, MoveRight, Users } from "lucide-react";
import { MobileToggle } from "./mobile-toggle";
import { ServerMembersToggle } from "./server-members-toggle";
import Link from "next/link";

interface ChatHeaderProps {
  serverId?: string;
  type: "channel" | "dm";
  name: string;
}
export function ChatHeader({ serverId, type, name }: ChatHeaderProps) {
  return (
    <header className="flex h-12 bg-[#f2f3f5] items-center px-3">
      {type === "channel" ? (
        <MobileToggle serverId={serverId} type={type} />
      ) : (
        <Link href="/channels/me" className="md:hidden">
          <MoveLeft className="h-5 w-5 mr-3 text-muted-foreground/80 hover:cursor-pointer" />
        </Link>
      )}
      {type === "channel" ? (
        <Hash className="h-5 w-5 mr-2 text-muted-foreground" />
      ) : (
        <AtSign className="h-5 w-5 mr-2 text-muted-foreground" />
      )}
      {name}

      <div className="ml-auto">
        {type === "channel" && (
          // toggle channel members
          <Users />
        )}
      </div>
    </header>
  );
}
