"use client";

import { useRouter } from "next/navigation";
import { Loader2Icon, Trash2Icon } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@acme/ui/dialog";
import { toast } from "@acme/ui/toast";

import { api } from "~/trpc/react";
import { useTranslation } from "~/contexts/i18n-context";

interface DeleteStudySetDialogProps {
  id: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeleteStudySetDialog = ({
  id,
  open,
  onOpenChange,
}: DeleteStudySetDialogProps) => {
  const { t } = useTranslation();
  const utils = api.useUtils();
  const router = useRouter();
  const { mutate, isPending } = api.studySet.delete.useMutation({
    onSuccess() {
      void utils.studySet.invalidate();
      toast.success(t("deleteBtn"));
      router.push("/latest");
    },
    onError() {
      toast.error("Couldn't delete study set, try again");
    },
  });

  const deleteStudySet = () => {
    mutate({ id });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("deleteBtn")} {t("studySet")}?</DialogTitle>
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
            onClick={deleteStudySet}
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

export default DeleteStudySetDialog;
