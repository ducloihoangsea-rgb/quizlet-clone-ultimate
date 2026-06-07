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
  const router = useRouter();
  const { mutate, isPending } = api.folder.delete.useMutation({
    onSuccess() {
      toast.success("Successfully deleted folder");
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
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            folder and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild disabled={isPending}>
            <Button variant="outline">Cancel</Button>
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
