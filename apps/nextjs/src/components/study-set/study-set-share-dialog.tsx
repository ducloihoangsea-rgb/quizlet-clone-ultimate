"use client";

import { Copy, Share } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import { Input } from "@acme/ui/input";
import { toast } from "@acme/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import { getAppUrl } from "~/utils/get-url";

import { useTranslation } from "~/contexts/i18n-context";

const StudySetShareDialog = ({ id }: { id: string }) => {
  const { t } = useTranslation();
  const url = `${getAppUrl()}/study-sets/${id}`;

  const onCopy = async () => {
    await navigator.clipboard.writeText(url);
    toast.success(t("save"));
  };

  return (
    <Dialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Share size={16} />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>{t("shareBtn")}</TooltipContent>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("shareLink")}</DialogTitle>
          <DialogDescription>
            {t("publicDisplayName")}
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <Input id="link" defaultValue={url} readOnly autoFocus={false} />
          <Button onClick={onCopy} type="submit" size="icon" className="px-3">
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StudySetShareDialog;
