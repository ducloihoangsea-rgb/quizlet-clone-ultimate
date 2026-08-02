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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import {
  Form,
  FormControl,
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
      toast.success("Đã lưu thẻ ghi nhớ");
      setOpen(false);
      void utils.studySet.byId.invalidate({ id });
    },
    onError({ message }) {
      toast.error(message);
    },
  });

  useEffect(() => {
    form.reset(flashcard);
  }, [flashcard, form]);

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
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Sửa</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Textarea
                        disabled={isPending}
                        placeholder="Thuật ngữ"
                        className="resize-none min-h-[140px] text-lg font-medium border-0 border-b-2 border-foreground/20 focus-visible:ring-0 focus-visible:border-primary rounded-none px-0 py-2 shadow-none bg-transparent"
                        {...field}
                      />
                    </div>
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
                    <div className="relative">
                      <Textarea
                        disabled={isPending}
                        placeholder="Định nghĩa"
                        className="resize-none min-h-[140px] text-lg font-medium border-0 border-b-2 border-foreground/20 focus-visible:ring-0 focus-visible:border-primary rounded-none px-0 py-2 shadow-none bg-transparent"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-4 pt-4">
              <DialogClose asChild>
                <Button variant="ghost" className="font-semibold px-6">
                  Hủy
                </Button>
              </DialogClose>
              <Button disabled={isPending} type="submit" className="font-semibold px-8 bg-blue-600 hover:bg-blue-700 text-white">
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
