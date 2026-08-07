"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon, Trash2, Trash2Icon } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import { useTranslation } from "~/contexts/i18n-context";

interface DeleteFolderDialogProps {
  id: string;
  userId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

const DeleteFolderDialog = ({ 
  id, 
  userId, 
  open, 
  onOpenChange,
  children 
}: DeleteFolderDialogProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate, isPending } = api.folder.delete.useMutation({
    onSuccess() {
      toast.success(t("deleteBtn"));
      if (onOpenChange) {
        onOpenChange(false);
      }
      router.push(`/users/${userId}/folders`);
    },
    onError() {
      toast.error("Couldn't delete folder, try again");
    },
  });

  const deleteFolder = () => {
    mutate({ id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteBtn")}?</DialogTitle>
          <DialogDescription>
            {t("publicDisplayName")}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild disabled={isPending}>
            <Button variant="outline">{t("cancel")}</Button>
          </DialogClose>
          <Button
            disabled={isPending}
            onClick={deleteFolder}
            variant="destructive"
          >
            {isPending ? (
              <Loader2Icon size={16} className="animate-spin" />
            ) : (
              <>
                Delete <Trash2Icon size={16} className="ml-2" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteFolderDialog;
