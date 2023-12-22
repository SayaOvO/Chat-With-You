"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import qs from "query-string";
import axios from "axios";

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
import { toggleDeleteMessage, toggleDeleteServer } from "@/store/toggle-modal-slice";

export function DeleteMessageModal() {
  const [isLoading, setIsLoading] = useState(false);
  const { open, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();
  const router = useRouter();

  if (!data || !data.apiUrl || !data.query) {
    return null;
  }
  const { apiUrl, query } = data;

  const isModalOpen = type === "deleteMessage" && open;

  const onDelete = async () => {
    const url = qs.stringifyUrl({
      url: apiUrl,
      query
    })
    try {
      setIsLoading(true);
      await axios.delete(url);
      dispatch(
        toggleDeleteMessage({
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
          toggleDeleteServer({
            open: false,
          })
        )
      }
    >
      <DialogContent className="p-0">
        <DialogHeader className="text-left px-4 py-6 space-y-3">
          <DialogTitle>
            Delete the message
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete This message.
            This action cannot be undone.
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
                toggleDeleteMessage({
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
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
