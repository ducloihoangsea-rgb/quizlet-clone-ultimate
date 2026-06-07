"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";

import type { CreateFolderValues, EditFolderValues } from "@acme/validators";
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
import { Input } from "@acme/ui/input";
import { Textarea } from "@acme/ui/textarea";
import { toast } from "@acme/ui/toast";
import { CreateFolderSchema, EditFolderSchema } from "@acme/validators";

import { api } from "~/trpc/react";
import { useTranslation } from "~/contexts/i18n-context";

interface FolderDialogProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultValues?: EditFolderValues;
}

const FolderDialog = ({
  children,
  open,
  onOpenChange,
  defaultValues,
}: FolderDialogProps) => {
  const utils = api.useUtils();
  const { t } = useTranslation();

  const form = useForm({
    schema: defaultValues ? EditFolderSchema : CreateFolderSchema,
    defaultValues: defaultValues ?? {
      name: "",
      description: "",
    },
  });

  const create = api.folder.create.useMutation({
    async onSuccess(data) {
      await utils.folder.invalidate();
      toast.success(
        <span>
          Đã tạo thành công thư mục mới, bạn có thể xem{" "}
          <Link
            href={`/users/${data.userId}/folders/${data.slug}`}
            className="underline"
          >
            tại đây
          </Link>
        </span>,
      );
      form.reset();
      if (onOpenChange) {
        onOpenChange(false);
      }
    },
    onError() {
      toast.error("Không thể tạo thư mục, vui lòng thử lại");
    },
  });

  const edit = api.folder.edit.useMutation({
    async onSuccess(data) {
      await utils.folder.invalidate();
      toast.success("Đã lưu thư mục");
      form.reset({
        name: data.name,
        description: data.description ?? undefined,
      });
      if (onOpenChange) {
        onOpenChange(false);
      }
    },
    onError() {
      toast.error("Không thể lưu thư mục, vui lòng thử lại");
    },
  });

  function onSubmit(values: EditFolderValues | CreateFolderValues) {
    if ("id" in values) {
      edit.mutate(values);
    } else {
      create.mutate(values);
    }
  }

  const isPending = create.isPending || edit.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="max-w-md select-none">
        <DialogHeader>
          <DialogTitle>
            {defaultValues ? t("editFolder") : t("createFolder")}
          </DialogTitle>
          <DialogDescription>
            {t("manageStudySetsInFolder")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">{t("folderName")}</FormLabel>
                  <FormControl>
                    <Input
                      disabled={isPending}
                      placeholder="Ví dụ: Lịch sử, Hoá học..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {t("publicDisplayName")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    {t("descriptionOptional")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      disabled={isPending}
                      placeholder="Mô tả ngắn về thư mục của bạn..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <DialogClose asChild>
                <Button variant="outline" className="font-bold">
                  {t("close")}
                </Button>
              </DialogClose>

              <Button disabled={isPending} type="submit" className="font-bold">
                {isPending ? (
                  <Loader2Icon className="size-4 animate-spin" />
                ) : defaultValues ? (
                  t("save")
                ) : (
                  t("create")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FolderDialog;
