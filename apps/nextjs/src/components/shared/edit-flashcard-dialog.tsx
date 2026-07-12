"use client";

import type { MouseEvent } from "react";
import type { z } from "zod";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Edit, Loader2Icon } from "lucide-react";

import type { RouterOutputs } from "@acme/api";
import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useForm,
} from "@acme/ui/form";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";
import { EditFlashcardSchema } from "@acme/validators";

import { api } from "~/trpc/react";

interface EditFlashcardDialogProps {
  flashcard: RouterOutputs["studySet"]["byId"]["flashcards"][number];
}

const EditFlashcardDialog = ({ flashcard }: EditFlashcardDialogProps) => {
  const { id }: { id: string } = useParams();
  const [open, setOpen] = useState<boolean>(false);
  const form = useForm({
    schema: EditFlashcardSchema,
    defaultValues: flashcard,
  });
  const utils = api.useUtils();
  const { mutate, isPending } = api.flashcard.edit.useMutation({
    onSuccess() {
      toast.success("Saved flashcard");
      setOpen(false);
      void utils.studySet.byId.invalidate({ id });
    },
    onError({ message }) {
      toast.error(message);
    },
  });

  useEffect(() => {
    form.reset(flashcard);
  }, [flashcard]);

  const handleStopPropagation = (
    event: MouseEvent<HTMLElement, globalThis.MouseEvent>,
  ) => {
    event.stopPropagation();
  };

  function onSubmit(values: z.infer<typeof EditFlashcardSchema>) {
    mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={handleStopPropagation}
          className="rounded-full"
          variant="ghost"
          size="icon"
        >
          <Edit size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Sửa</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      disabled={isPending} 
                      placeholder="Nhập thuật ngữ..." 
                      className="min-h-[120px] resize-none text-base border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-white px-0 bg-transparent font-medium"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="definition"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      disabled={isPending} 
                      placeholder="Nhập định nghĩa..." 
                      className="min-h-[60px] resize-none text-base border-0 border-b-2 rounded-none focus-visible:ring-0 focus-visible:border-white px-0 bg-transparent font-medium"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-6 pt-4">
              <DialogClose asChild>
                <Button variant="ghost" className="font-bold">Hủy</Button>
              </DialogClose>
              <Button disabled={isPending} type="submit" variant="ghost" className="font-bold">
                {isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : (
                  "Lưu"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditFlashcardDialog;
