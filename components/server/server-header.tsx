"use client";

import { MemberRole, Profile, ServerWithMemberAndChannel } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  LogOut,
  PlusCircle,
  Settings,
  Trash,
  UserPlus,
  Users,
} from "lucide-react";
import { useAppDispatch } from "@/store";
import {
  toggleCreateChannel,
  toggleCreateServerModal,
  toggleDeleteServer,
  toggleEditServer,
  toggleInvitePeople,
  toggleLeaveServer,
  toggleManageMember,
} from "@/store/toggle-modal-slice";

interface ServerHeaderProps {
  server: ServerWithMemberAndChannel;
  role: MemberRole | null;
  profile: Profile;
}

export function ServerHeader({ server, role, profile }: ServerHeaderProps) {
  const isOwner = role === "owner";
  const isMod = role !== "member";

  const dispatch = useAppDispatch();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="h-12 py-3 px-4 flex items-center justify-between transition
          hover:bg-[#e3e5e8] hover:cursor-pointer focus-visible:ring-0
          focus-visible:ring-offset-0 outline-none border-b-[1px] border-[#cccdd3]"
        >
          <span className="text-semibold">{server?.name}</span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[220px] p-2 space-y-1" sideOffset={4}>
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="p-2 hover:cursor-pointer items-center justify-between"
            onClick={() =>
              dispatch(
                toggleInvitePeople({
                  data: { server },
                  open: true,
                  type: "createServer",
                })
              )
            }
          >
            Invite People
            <UserPlus className="h-4 w-4" />
          </DropdownMenuItem>
          {isMod && (
            <>
              <DropdownMenuItem
                className="p-2 hover:cursor-pointer items-center justify-between"
                onClick={() =>
                  dispatch(
                    toggleEditServer({
                      data: { server },
                      open: true,
                      type: "editServer",
                    })
                  )
                }
              >
                Server Settings
                <Settings className="h-4 w-4" />
              </DropdownMenuItem>
              <DropdownMenuItem
                className="p-2 hover:cursor-pointer items-center justify-between"
                onClick={() =>
                  dispatch(
                    toggleManageMember({
                      data: { server, profile },
                      open: true,
                      type: "manageMember",
                    })
                  )
                }
              >
                Manage Members
                <Users className="h-4 w-4" />
              </DropdownMenuItem>

              <DropdownMenuItem
                className="p-2 hover:cursor-pointer items-center justify-between"
                onClick={() =>
                  dispatch(
                    toggleCreateChannel({
                      data: { server },
                      open: true,
                      type: "createChannel",
                    })
                  )
                }
              >
                Create Channels
                <PlusCircle className="h-4 w-4" />
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border h-[1px]" />

        {isOwner ? (
          <DropdownMenuItem
            className="p-2 hover:cursor-pointer items-center justify-between"
            onClick={() =>
              dispatch(
                toggleDeleteServer({
                  data: { server },
                  open: true,
                  type: "deleteServer",
                })
              )
            }
          >
            Delete Server
            <Trash className="h-4 w-4 text-rose-600" />
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="p-2 hover:cursor-pointer items-center justify-between"
            onClick={() =>
              dispatch(
                toggleLeaveServer({
                  data: { server, profile },
                  open: true,
                  type: "leaveServer",
                })
              )
            }
          >
            Leave Server
            <LogOut className="h-4 w-4" />
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
