"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import qs from "query-string";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store";
import { toggleDeleteChannel } from "@/store/toggle-modal-slice";

export function DeleteChannelModal() {
  const [isLoading, setIsLoading] = useState(false);
  const { open, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (!data) {
    return null;
  }

  const { server, channel } = data;

  const isModalOpen = type === "deleteChannel" && open;

  const onDelete = async () => {
    try {
      setIsLoading(true);
      const url = qs.stringifyUrl({
        url: `/api/channels/${channel?.id}`,
        query: {
          serverId: server?.id,
        },
      });
      await axios.delete(url);
      dispatch(
        toggleDeleteChannel({
          open: false,
        })
      );
      router.refresh();
    } catch (error) {
      console.log("delete server modal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() =>
        dispatch(
          toggleDeleteChannel({
            open: false,
          })
        )
      }
    >
      <DialogContent className="p-0">
        <DialogHeader className="text-left px-4 py-6 space-y-3">
          <DialogTitle>
            Delete &apos<span>{channel?.name}</span>&apos
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-primary">
              {channel?.type === "text" && "#"}
              {channel?.name}
            </span>
            ? This cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="space-x-3 bg-gray-100 px-4 py-4">
          <Button
            disabled={isLoading}
            variant="ghost"
            className="text-muted-foreground hover:text-muted-foreground 
            hover:underline hover:bg-transparent
            focus-visible:ring-0 focus-visible:ring-offset-0
            "
            onClick={() =>
              dispatch(
                toggleDeleteChannel({
                  open: false,
                })
              )
            }
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            className="bg-rose-500 hover:bg-rose-600 transition
            focus-visible:ring-0 focus-visible:ring-offset-0
          "
            onClick={onDelete}
          >
            Delete Server
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
