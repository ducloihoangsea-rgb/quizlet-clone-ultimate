"use client";

import type { ReactNode } from "react";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

import type { RouterOutputs } from "@acme/api";
import type { Session } from "@acme/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@acme/ui/tabs";
import AvatarPickerModal from "./avatar-picker-modal";

interface ProfileLayoutProps {
  user: RouterOutputs["user"]["byId"];
  children: ReactNode;
  session: Session | null;
}

const ProfileLayout = ({ user, children, session }: ProfileLayoutProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentTab = searchParams.get("tab");

  const { id, name } = user;
  const [currentImage, setCurrentImage] = useState<string | null>(user.image ?? null);
  const isOwner = session?.user.id === user.id;

  let tabsValue = "overview";
  if (pathname === `/users/${id}/study-sets`) {
    tabsValue = "study-sets";
  } else if (pathname === `/users/${id}/folders`) {
    tabsValue = "folders";
  } else if (currentTab) {
    tabsValue = currentTab;
  }

  return (
    <div className="max-w-6xl mx-auto py-4 select-none">
      <div className="mb-8 flex items-start gap-5">
        {isOwner ? (
          <AvatarPickerModal 
            currentImage={currentImage} 
            onAvatarChange={(newImg) => {
              setCurrentImage(newImg);
              router.refresh();
            }}
          >
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={currentImage ?? undefined} alt="user avatar" />
              <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                {name?.at(0) ?? "U"}
              </AvatarFallback>
            </Avatar>
          </AvatarPickerModal>
        ) : (
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage src={currentImage ?? undefined} alt="user avatar" />
            <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
              {name?.at(0) ?? "U"}
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{name}</h1>
          <span className="block text-sm font-semibold text-muted-foreground mt-1">
            @{name?.toLowerCase().replace(/\s+/g, "")}
          </span>
        </div>
      </div>

      <Tabs value={tabsValue} className="mb-8">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent overflow-x-auto gap-6">
          {session?.user.id === user.id && (
            <Link href={`/users/${id}`}>
              <TabsTrigger 
                value="overview" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-bold text-sm"
              >
                Hoạt động
              </TabsTrigger>
            </Link>
          )}
          
          <Link href={`/users/${id}?tab=classes`}>
            <TabsTrigger 
              value="classes"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-bold text-sm"
            >
              Lớp học
            </TabsTrigger>
          </Link>

          <Link href={`/users/${id}/study-sets`}>
            <TabsTrigger 
              value="study-sets"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-bold text-sm"
            >
              Học phần
            </TabsTrigger>
          </Link>

          <Link href={`/users/${id}?tab=mock-tests`}>
            <TabsTrigger 
              value="mock-tests"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-bold text-sm"
            >
              Bài kiểm tra thử
            </TabsTrigger>
          </Link>

          <Link href={`/users/${id}?tab=expert-solutions`}>
            <TabsTrigger 
              value="expert-solutions"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-bold text-sm"
            >
              Lời giải chuyên gia
            </TabsTrigger>
          </Link>

          <Link href={`/users/${id}/folders`}>
            <TabsTrigger 
              value="folders"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3 px-1 font-bold text-sm"
            >
              Thư mục
            </TabsTrigger>
          </Link>
        </TabsList>
      </Tabs>
      
      <div className="mt-4">
        {children}
      </div>
    </div>
  );
};

export default ProfileLayout;
