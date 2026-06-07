import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Folder, Play, Plus, BookOpen } from "lucide-react";

import { auth } from "@acme/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Button } from "@acme/ui/button";

import FolderCTA from "~/components/folder/folder-cta";
import FolderStudySets from "~/components/folder/folder-study-sets";
import FolderStudySetsDialog from "~/components/folder/folder-study-sets-dialog";
import { api, HydrateClient } from "~/trpc/server";

interface FolderProps {
  params: { slug: string; id: string };
}

export async function generateMetadata({
  params: { slug },
}: FolderProps): Promise<Metadata> {
  try {
    const { name } = await api.folder.bySlug({ slug });

    return {
      title: name,
    };
  } catch {
    return {};
  }
}

export default async function FolderPage({ params: { slug, id } }: FolderProps) {
  let folder;
  try {
    folder = await api.folder.bySlug({ slug });
  } catch {
    notFound();
  }

  const session = await auth();

  if (session) {
    await api.studySet.allByUser.prefetch({ userId: session.user.id });
  }

  const isOwner = session?.user.id === folder.userId;
  const firstStudySetId = folder.studySets[0]?.id;

  return (
    <HydrateClient>
      <div className="max-w-4xl mx-auto pb-24 relative select-none">
        
        {/* Header Section */}
        <div className="flex flex-col items-start gap-4 mb-8">
          {/* Big Folder Icon */}
          <div className="p-3 bg-muted rounded-2xl text-muted-foreground border shadow-sm">
            <Folder size={38} className="fill-current opacity-80" />
          </div>

          {/* Folder Title and Action Dropdown */}
          <div className="flex items-center gap-3 w-full justify-between">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight truncate flex-1">
              {folder.name}
            </h1>
            <FolderCTA session={session} slug={slug} />
          </div>

          {/* Description */}
          {folder.description && (
            <p className="text-muted-foreground text-sm max-w-2xl bg-muted/30 p-3 rounded-lg border w-full">
              {folder.description}
            </p>
          )}

          {/* Metadata & Author Info */}
          <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground flex-wrap">
            <span className="bg-secondary px-2.5 py-1 rounded-md text-secondary-foreground">
              {folder.studySets.length} học phần
            </span>
            
            <div className="flex items-center gap-1.5">
              <span>tạo bởi</span>
              <Link href={`/users/${folder.user.id}`} className="hover:underline flex items-center gap-1.5 font-bold text-foreground">
                <Avatar className="h-5 w-5 border">
                  <AvatarImage src={folder.user.image ?? undefined} />
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                    {folder.user.name?.at(0) ?? "U"}
                  </AvatarFallback>
                </Avatar>
                {folder.user.name}
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="flex items-center justify-between border-b pb-2 mb-6">
          <div className="flex gap-4">
            <button className="border-b-2 border-primary pb-2 font-bold text-sm text-foreground">
              Tất cả
            </button>
            <button className="pb-2 font-bold text-sm text-muted-foreground hover:text-foreground transition-colors opacity-70">
              Thư mục con
            </button>
          </div>
        </div>

        {/* Study Sets List */}
        <div className="space-y-4">
          <FolderStudySets />
        </div>

        {/* Floating Action Bar (Fixed at bottom) */}
        {isOwner && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-background/95 dark:bg-slate-900/95 backdrop-blur-md border shadow-2xl rounded-full p-2 flex items-center gap-3 z-40 select-none animate-in fade-in slide-in-from-bottom-4 duration-300">
            {firstStudySetId ? (
              <Link href={`/study-sets/${firstStudySetId}`}>
                <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-bold px-6 py-2.5 rounded-full text-xs transition-all active:scale-95 border">
                  <Play size={12} className="fill-current" />
                  <span>Học thư mục</span>
                </button>
              </Link>
            ) : (
              <button 
                disabled
                className="flex items-center gap-2 bg-muted text-muted-foreground font-bold px-6 py-2.5 rounded-full text-xs opacity-60 cursor-not-allowed border"
              >
                <Play size={12} />
                <span>Không có học phần</span>
              </button>
            )}

            <FolderStudySetsDialog userId={folder.userId}>
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all active:scale-95 shadow-md">
                <Plus size={14} className="stroke-[3px]" />
                <span>Thêm học phần</span>
              </button>
            </FolderStudySetsDialog>
          </div>
        )}
      </div>
    </HydrateClient>
  );
}
