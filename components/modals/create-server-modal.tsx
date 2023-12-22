"use client";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RootState, useAppDispatch, useAppSelector } from "@/store";
import { toggleCreateServerModal } from "@/store/toggle-modal-slice";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FileUpload } from "../file-upload";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  name: z.string().min(1, {
    message: "Server name is required",
  }),
  imageUrl: z.string().min(1, {
    message: "Server image is required",
  }),
});

export function CreateServerModal() {
  const { open, type } = useAppSelector(state => state.modal);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    defaultValues: {
      name: "",
      imageUrl: "",
    },
    resolver: zodResolver(formSchema),
  });


  const isLoading = form.formState.isSubmitting;
  const isModalOpen = type === "createServer" && open;

  const handleClose = () => {
    form.reset();
    dispatch(toggleCreateServerModal({ open: false }));
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/servers", values);
      router.refresh();
      router.push(`/channels/${response.data.id}`);
      handleClose();
    } catch (error) {
      console.log("submit create server", error);
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 pt-6">
        <DialogHeader className="md:text-center px-6">
          <DialogTitle>Customize your server</DialogTitle>
          <DialogDescription>
            Give the server a name and an avatar, you can always change them
            later.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-4 space-y-8">
              <div className="flex items-center justify-center text-center">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <FileUpload
                          onChange={field.onChange}
                          value={field.value}
                          endpoint="serverImage"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase">Server Name</FormLabel>
                    <FormControl>
                      <Input
                        className="focus-visible:ring-offset-0
                                    focus-visible:ring-0 bg-muted
                                    text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="sm:bg-gray-200 flex space-x-2 p-4 gap-2">
              <Button
                disabled={isLoading}
                variant="ghost"
                onClick={handleClose}
                className="text-primary/80"
              >
                Cancel
              </Button>
              <Button
                disabled={isLoading}
                type="submit"
                className="ml-auto transition bg-blue-500 
                        hover:bg-blue-600"
              >
                Create
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
