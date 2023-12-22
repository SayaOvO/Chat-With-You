import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Users } from "lucide-react";
import { Member } from "@/types";

interface ServerMembersToggleProps {
  members: Member[]
}
export function ServerMembersToggle({ members }: ServerMembersToggleProps) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="md:hidden">
          <Users className="h-5 w-5 mr-2" />
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[312px] p-0">
        <div>
          {members.map((member) => (
            <li key={member.id}>
              {member.id}
            </li>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
