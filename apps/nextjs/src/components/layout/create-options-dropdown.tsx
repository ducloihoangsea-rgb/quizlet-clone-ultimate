"use client";

import { useRouter } from "next/navigation";
import { Plus, Users, Activity, FolderOpen, FileSpreadsheet } from "lucide-react";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { toast } from "@acme/ui/toast";

import { useFolderDialogContext } from "~/contexts/folder-dialog-context";
import { useSignInDialogContext } from "~/contexts/sign-in-dialog-context";

const CreateOptionsDropdown = ({ session }: { session: Session | null }) => {
  const [, dispatch] = useFolderDialogContext();
  const { onOpenChange } = useSignInDialogContext();
  const router = useRouter();

  const openFolderDialog = () => {
    dispatch({ type: "open" });
  };

  const openSignInDialog = () => {
    onOpenChange(true);
  };

  const handleAction = (type: "folder" | "studyset" | "class" | "activity") => {
    if (!session) {
      openSignInDialog();
      return;
    }

    switch (type) {
      case "folder":
        openFolderDialog();
        break;
      case "studyset":
        router.push("/create-set");
        break;
      case "class":
        toast.info("Tính năng Lớp học sẽ được phát triển sớm!");
        break;
      case "activity":
        toast.info("Tính năng Giao hoạt động sẽ được phát triển sớm!");
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-9 w-9 rounded-full bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center shrink-0 shadow-md outline-none">
          <Plus size={20} className="stroke-[3px]" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-1">
        <DropdownMenuItem onClick={() => handleAction("class")} className="flex items-center gap-2 cursor-pointer py-2 font-medium">
          <Users size={16} className="text-muted-foreground" />
          <span>Lớp</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("activity")} className="flex items-center gap-2 cursor-pointer py-2 font-medium">
          <Activity size={16} className="text-muted-foreground" />
          <span>Hoạt động</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("studyset")} className="flex items-center gap-2 cursor-pointer py-2 font-medium">
          <FileSpreadsheet size={16} className="text-muted-foreground" />
          <span>Học phần</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleAction("folder")} className="flex items-center gap-2 cursor-pointer py-2 font-medium">
          <FolderOpen size={16} className="text-muted-foreground" />
          <span>Thư mục</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CreateOptionsDropdown;
