"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@acme/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@acme/ui/dialog";
import Empty from "@acme/ui/empty";

import { api } from "~/trpc/react";
import FolderStudySetCard from "./folder-study-set-card";

interface FolderStudySetsDialogProps {
  userId: string;
  children?: React.ReactNode;
}

const FolderStudySetsDialog = ({ userId, children }: FolderStudySetsDialogProps) => {
  const { slug }: { slug: string } = useParams();
  const [studySets] = api.studySet.allByUser.useSuspenseQuery({ userId });
  const [folder] = api.folder.bySlug.useSuspenseQuery({ slug });

  const allStudySets = [
    ...folder.studySets,
    ...studySets.filter(
      (set) => !folder.studySets.some((folderSet) => folderSet.id === set.id),
    ),
  ].sort((a, b) => a.title.localeCompare(b.title));

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button size="icon" variant="outline">
            <Plus size={16} />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Thêm/Xóa học phần vào thư mục</DialogTitle>
          <DialogDescription>
            Quản lý các học phần nằm trong thư mục của bạn.
          </DialogDescription>
        </DialogHeader>
        <Link href="/create-set">
          <Button className="w-full font-bold mb-4">Tạo học phần mới</Button>
        </Link>

        {allStudySets.length > 0 ? (
          <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1">
            {allStudySets.map((set) => (
              <FolderStudySetCard
                key={set.id}
                folderId={folder.id}
                isIn={folder.studySets.some(({ id }) => id === set.id)}
                studySet={set}
              />
            ))}
          </div>
        ) : (
          <Empty message="Bạn chưa tạo học phần nào" className="my-4" />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FolderStudySetsDialog;
