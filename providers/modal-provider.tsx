"use client";

import { CreateChannelModal } from "@/components/modals/create-channel-modal";
import { CreateServerModal } from "@/components/modals/create-server-modal";
import { DeleteChannelModal } from "@/components/modals/delete-channel-modal";
import { DeleteMessageModal } from "@/components/modals/delete-message-modal";
import { DeleteServerModal } from "@/components/modals/delete-server-modal";
import { EditChannelModal } from "@/components/modals/edit-channel-modal";
import { EditServerModal } from "@/components/modals/edit-server-modal";
import { InvitePeopleModal } from "@/components/modals/invite-people-moda";
import { LeaveServerModal } from "@/components/modals/leave-server-modal";
import { ManageMemberModal } from "@/components/modals/manage-member-modal";
import { useEffect, useState } from "react";

export function ModalProvider() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, [])

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CreateServerModal />
      <InvitePeopleModal />
      <EditServerModal />
      <ManageMemberModal />
      <CreateChannelModal />
      <DeleteServerModal />
      <LeaveServerModal />
      <EditChannelModal />
      <DeleteChannelModal />
      <DeleteMessageModal />
    </>
  )


}