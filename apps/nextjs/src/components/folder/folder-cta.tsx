"use client";

import React from "react";
import { MoreHorizontal, Edit, Trash2, Share2, DownloadCloud, Copy } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@acme/ui/dropdown-menu";

import { api } from "~/trpc/react";
import DeleteFolderDialog from "./delete-folder-dialog";
import FolderDialog from "./folder-dialog";

interface FolderCTAProps {
  slug: string;
  session: Session | null;
}

const FolderCTA = ({ slug, session }: FolderCTAProps) => {
  const router = useRouter();
  const [data] = api.folder.bySlug.useSuspenseQuery({ slug });
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const saveSharedFolder = api.folder.saveSharedFolder.useMutation({
    onSuccess: (newFolder) => {
      toast.success("Đã lưu thư mục thành công");
      router.push(`/users/${session?.user?.id}/folders/${newFolder.slug}`);
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi lưu thư mục");
    },
    onSettled: () => setIsProcessing(false),
  });

  const cloneSharedFolder = api.folder.cloneSharedFolder.useMutation({
    onSuccess: (newFolder) => {
      toast.success("Đã nhân bản thư mục thành công");
      router.push(`/users/${session?.user?.id}/folders/${newFolder.slug}`);
    },
    onError: () => {
      toast.error("Có lỗi xảy ra khi nhân bản thư mục");
    },
    onSettled: () => setIsProcessing(false),
  });

  const isOwner = data.userId === session?.user?.id;

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Đã copy link thư mục");
    }
  };

  const handleSave = () => {
    if (!session) {
      toast.error("Vui lòng đăng nhập để lưu thư mục");
      return;
    }
    setIsProcessing(true);
    toast.loading("Đang lưu thư mục...", { id: "save-folder" });
    saveSharedFolder.mutate({ id: data.id }, {
      onSettled: () => toast.dismiss("save-folder"),
    });
  };

  const handleClone = () => {
    if (!session) {
      toast.error("Vui lòng đăng nhập để nhân bản thư mục");
      return;
    }
    setIsProcessing(true);
    toast.loading("Đang nhân bản thư mục... (Có thể mất vài giây)", { id: "clone-folder" });
    cloneSharedFolder.mutate({ id: data.id }, {
      onSettled: () => toast.dismiss("clone-folder"),
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground" disabled={isProcessing}>
            <MoreHorizontal size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 p-1">
          <DropdownMenuItem 
            onClick={handleShare}
            className="flex items-center gap-2 cursor-pointer py-2"
          >
            <Share2 size={16} className="text-muted-foreground" />
            <span>Chia sẻ (Copy link)</span>
          </DropdownMenuItem>
          
          {isOwner && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 cursor-pointer py-2"
              >
                <Edit size={16} className="text-muted-foreground" />
                <span>Sửa thư mục</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setDeleteOpen(true)}
                className="flex items-center gap-2 cursor-pointer py-2 text-destructive focus:text-destructive"
              >
                <Trash2 size={16} className="text-destructive" />
                <span>Xóa thư mục</span>
              </DropdownMenuItem>
            </>
          )}

          {!isOwner && session && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSave}
                disabled={isProcessing}
                className="flex items-center gap-2 cursor-pointer py-2"
              >
                <DownloadCloud size={16} className="text-muted-foreground" />
                <div className="flex flex-col">
                  <span>Lưu thư mục</span>
                  <span className="text-[10px] text-muted-foreground">Chỉ lấy liên kết học phần</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={handleClone}
                disabled={isProcessing}
                className="flex items-center gap-2 cursor-pointer py-2"
              >
                <Copy size={16} className="text-muted-foreground" />
                <div className="flex flex-col">
                  <span>Nhân bản thư mục</span>
                  <span className="text-[10px] text-muted-foreground">Sở hữu học phần độc lập</span>
                </div>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden/Triggered Dialogs */}
      {isOwner && session && (
        <>
          <FolderDialog
            open={editOpen}
            onOpenChange={setEditOpen}
            defaultValues={{
              id: data.id,
              name: data.name,
              description: data.description ?? undefined,
            }}
          />
          <DeleteFolderDialog 
            id={data.id} 
            userId={session.user.id} 
            open={deleteOpen}
            onOpenChange={setDeleteOpen}
          />
        </>
      )}
    </>
  );
};

export default FolderCTA;
