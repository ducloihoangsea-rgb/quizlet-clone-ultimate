"use client";

import React from "react";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";

import { api } from "~/trpc/react";
import DeleteFolderDialog from "./delete-folder-dialog";
import FolderDialog from "./folder-dialog";

interface FolderCTAProps {
  slug: string;
  session: Session | null;
}

const FolderCTA = ({ slug, session }: FolderCTAProps) => {
  const [data] = api.folder.bySlug.useSuspenseQuery({ slug });
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);

  if (data.userId !== session?.user.id) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="rounded-full h-10 w-10 text-muted-foreground hover:text-foreground">
            <MoreHorizontal size={20} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 p-1">
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
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Hidden/Triggered Dialogs */}
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
  );
};

export default FolderCTA;
