"use client";

import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileUpload } from "../file-upload";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import axios from "axios";
import { toggleEditServer } from "@/store/toggle-modal-slice";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  imageUrl: z.string().min(1, {
    message: "Image URL is required",
  }),
});

export function EditServerModal() {
  const router = useRouter();

  const { open, type, data } = useAppSelector((state) => state.modal);
  const dispatch = useAppDispatch();

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: data?.server?.name || "",
      imageUrl: data?.server?.imageUrl || "",
    },
    resolver: zodResolver(formSchema),
  });
  useEffect(() => {
    if (data?.server) {
      form.setValue("name", data?.server.name);
      form.setValue("imageUrl", data?.server.imageUrl);
    }
  }, [data, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await axios.patch(`/api/servers/${data?.server?.id}`, values);
      form.reset();
      dispatch(toggleEditServer({ open: false }));
      router.refresh();
    } catch (error) {
      console.log("Edit Server Modal", error);
    }
  };

  const isLoading = form.formState.isSubmitting;
  const isModalOpen = type === "editServer" && open;

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => dispatch(toggleEditServer({ open: false }))}
    >
      <DialogContent className="p-0 pt-8">
        <DialogHeader className="md:text-center px-6">
          <DialogTitle>Customize your server</DialogTitle>
          <DialogDescription>
            Give the server a name and and avatar. you can always change it
            later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col space-y-2"
          >
            <div className="p-4 space-y-8">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          value={field.value}
                          onChange={field.onChange}
                          endpoint="serverImage"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase">Server Name</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Enter server name"
                        className="focus-visible:ring-offset-0 focus-visible:ring-0
                        bg-muted text-sm"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="bg-gray-100 p-4">
              <Button
                disabled={isLoading}
                type="submit"
                className="ml-auto bg-blue-500 hover:bg-blue-600"
              >
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
