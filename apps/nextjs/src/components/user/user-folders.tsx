"use client";

import React, { useState } from "react";
import { ChevronDown, FolderSearch } from "lucide-react";
import Empty from "@acme/ui/empty";

import { api } from "~/trpc/react";
import FolderCard from "../folder/folder-card";

const UserFolders = ({ userId }: { userId: string }) => {
  const [folders] = api.folder.allByUser.useSuspenseQuery({
    userId,
  });
  
  const [authorFilter, setAuthorFilter] = useState("bạn");

  return (
    <div className="space-y-4 select-none">
      {/* Filter bar */}
      {folders.length > 0 && (
        <div className="flex items-center justify-between py-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-secondary/80 hover:bg-secondary text-secondary-foreground font-semibold text-xs rounded-lg transition-all border">
            <span>Tác giả: {authorFilter}</span>
            <ChevronDown size={14} className="opacity-80" />
          </button>
        </div>
      )}

      {/* Folders list */}
      {folders.length > 0 ? (
        <div className="flex flex-col gap-4 max-w-4xl">
          {folders.map((folder) => (
            <FolderCard key={folder.id} folder={folder} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-card">
          <div className="mb-4 p-4 bg-muted rounded-full text-muted-foreground">
            <FolderSearch size={40} />
          </div>
          <h3 className="text-lg font-bold mb-1">Chưa có thư mục nào</h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Tạo thư mục để sắp xếp các học phần của bạn khoa học hơn.
          </p>
        </div>
      )}
    </div>
  );
};

export default UserFolders;
