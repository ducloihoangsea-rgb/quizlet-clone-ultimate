import React from "react";
import Link from "next/link";
import { Folder } from "lucide-react";

import type { RouterOutputs } from "@acme/api";

const FolderCard = ({
  folder,
}: {
  folder: RouterOutputs["folder"]["allByUser"][0];
}) => {
  const { name, studySetsCount, userId, slug } = folder;

  return (
    <Link href={`/users/${userId}/folders/${slug}`} className="block select-none">
      <div className="w-full border rounded-xl p-5 bg-card hover:bg-accent/40 hover:border-muted-foreground/30 active:scale-[0.99] transition-all cursor-pointer space-y-3 shadow-sm">
        {/* Study sets count text at top-left */}
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
          {studySetsCount} mục
        </span>
        
        {/* Folder Icon and Folder Name */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-muted rounded-lg text-muted-foreground shrink-0">
            <Folder size={20} className="fill-current opacity-70" />
          </div>
          <span className="font-bold text-base md:text-lg tracking-tight truncate flex-1">
            {name}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default FolderCard;
