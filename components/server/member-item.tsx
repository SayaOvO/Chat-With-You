"use client";

import qs from "query-string";
import axios from "axios";
import {
  Check,
  Crown,
  MoreVertical,
  Paintbrush,
  Shield,
  ShieldAlert,
  ShieldQuestion,
} from "lucide-react";

import {
  Member,
  MemberRole,
  Profile,
  ServerWithMemberAndChannel,
} from "@/types";

import { UserAvatar } from "@/components/user-avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store";
import { useRouter } from "next/navigation";
import { toggleManageMember } from "@/store/toggle-modal-slice";

interface MemberItemProps {
  member: Member & { profile: Profile };
}

export function MemberItem({ member }: MemberItemProps) {
  const isOwner = member.memberRole === "owner";
  const isMod = member.memberRole === "moderator";
  const isMember = member.memberRole === "member";

  const { data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (!data) {
    return null;
  }

  const { server, profile } = data;

  const profileRole = server?.members.find(
    (member) => member.profileId === profile?.id
  )?.memberRole as MemberRole;

  const onChangeRole = async (role: MemberRole) => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/members/${member.id}`,
        query: {
          serverId: member.serverId,
        },
      });
      const response = await axios.patch(url, {
        role,
      });
      dispatch(
        toggleManageMember({
          open: true,
          type: "manageMember",
          data: { server: response.data, profile: profile },
        })
      );
      router.refresh();
    } catch (error) {
      console.log("change member role", error);
    }
  };

  const onKick = async () => {
    try {
      const url = qs.stringifyUrl({
        url: `/api/members/${member.id}`,
        query: {
          serverId: member.serverId,
        },
      });
      const response = await axios.delete(url);
      dispatch(
        toggleManageMember({
          open: true,
          type: "manageMember",
          data: { server: response.data, profile },
        })
      );
      router.refresh();
    } catch (error) {
      console.log("Delete Member", error);
    }
  };

  return (
    <div className="flex items-center w-full">
      <UserAvatar src={member.profile.imageUrl} />
      <div className="ml-2">
        <p className="flex items-center">
          {member.profile.name}
          {isOwner && <Crown className="h-4 w-4 ml-1 fill-red-800" />}
          {isMod && <ShieldAlert className="h-4 w-4 ml-1 text-rose-500" />}
        </p>
      </div>
      {/* //TODO Think again the logic */}
      {/* //TODO add loading state or toast */}
      {!isOwner &&
        !(isMod && profileRole !== "owner") &&
        member.profileId !== profile?.id && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <MoreVertical className="ml-auto h-4 w-4 hover:cursor-pointer" />
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom">
              {profileRole === "owner" && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center hover:cursor-pointer">
                    <ShieldQuestion className="h-4 w-4 mr-2" />
                    Role
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem
                        className="hover:cursor-pointer"
                        onClick={() => onChangeRole("member")}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Member
                        {isMember && (
                          <Check className="h-4 w-4 ml-2 text-muted-foreground" />
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="hover:cursor-pointer"
                        onClick={() => onChangeRole("moderator")}
                      >
                        <ShieldAlert className="h-4 w-4 mr-2" />
                        Moderator
                        {isMod && <Check className="h-4 w-4 ml-2" />}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}
              <DropdownMenuItem
                className="hover:cursor-pointer"
                onClick={onKick}
              >
                <Paintbrush className="h-4 w-4 mr-2" />
                Kick
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
    </div>
  );
}
