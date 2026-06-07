"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  FolderHeart, 
  Bell, 
  Plus, 
  Folder, 
  Activity, 
  Menu, 
  Users
} from "lucide-react";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";
import { Separator } from "@acme/ui/separator";
import { cn } from "@acme/ui";

import { api } from "~/trpc/react";
import { useTranslation } from "~/contexts/i18n-context";
import { useFolderDialogContext } from "~/contexts/folder-dialog-context";
import { useClassDialogContext } from "~/contexts/class-dialog-context";

interface SidebarProps {
  session: Session | null;
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Sidebar = ({ session, isCollapsed, setIsCollapsed }: SidebarProps) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [, dispatchFolder] = useFolderDialogContext();
  const [, dispatchClass] = useClassDialogContext();

  // Load user folders & classes if logged in
  const { data: folders } = api.folder.allByUser.useQuery(
    { userId: session?.user.id ?? "" },
    { enabled: !!session?.user.id }
  );

  const { data: classes } = api.class.allByUser.useQuery(
    { userId: session?.user.id ?? "" },
    { enabled: !!session?.user.id }
  );

  const navItems = [
    {
      label: t("home"),
      icon: Home,
      href: session ? "/latest" : "/",
    },
    {
      label: "Thư viện của bạn",
      icon: FolderHeart,
      href: session ? `/users/${session.user.id}` : "#",
      authRequired: true,
    },
    {
      label: "Thông báo",
      icon: Bell,
      href: "#",
    }
  ];

  const handleCreateFolder = () => {
    if (session) {
      dispatchFolder({ type: "open" });
    }
  };

  const handleCreateClass = () => {
    if (session) {
      dispatchClass({ type: "open" });
    }
  };

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r bg-card text-card-foreground transition-all duration-300 ease-in-out select-none",
        isCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 items-center px-4 justify-between border-b">
        <div className="flex items-center gap-2 overflow-hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Menu size={20} />
          </Button>
          {!isCollapsed && (
            <Link href="/" className="font-sans font-bold text-2xl tracking-wider text-primary flex items-center gap-1 shrink-0">
              <span className="text-primary font-extrabold">Q</span>
              <span className="text-blue-500 font-extrabold">+</span>
            </Link>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex-1 py-4 overflow-y-auto px-2 space-y-4">
        <div className="space-y-1">
          {navItems.map((item, index) => {
            if (item.authRequired && !session) return null;
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link key={index} href={item.href}>
                <span
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors group relative",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                  )}
                >
                  <Icon size={20} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                  
                  {isCollapsed && (
                    <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-popover text-popover-foreground text-xs font-semibold invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-md">
                      {item.label}
                    </div>
                  )}
                </span>
              </Link>
            );
          })}
        </div>

        {session && (
          <>
            {/* User Classes Section */}
            <Separator className="my-2" />
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-2 text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  Lớp học của bạn
                </div>
              )}
              
              <div className="space-y-0.5">
                {classes && classes.map((cls) => {
                  const classUrl = `/classes/${cls.id}`;
                  const isActive = pathname === classUrl;

                  return (
                    <Link key={cls.id} href={classUrl}>
                      <span
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                          isActive
                            ? "bg-secondary text-secondary-foreground font-bold"
                            : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                        )}
                      >
                        <Users size={18} className="shrink-0 text-muted-foreground" />
                        {!isCollapsed && <span className="truncate">{cls.name}</span>}
                        
                        {isCollapsed && (
                          <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-popover text-popover-foreground text-xs font-semibold invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-md">
                            {cls.name}
                          </div>
                        )}
                      </span>
                    </Link>
                  );
                })}

                <button
                  onClick={handleCreateClass}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors group relative"
                >
                  <Plus size={18} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">+ Lớp mới</span>}
                  
                  {isCollapsed && (
                    <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-popover text-popover-foreground text-xs font-semibold invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-md">
                      Tạo lớp học mới
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* User Folders Section */}
            <Separator className="my-2" />
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-2 text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  Thư mục của bạn
                </div>
              )}
              
              <div className="space-y-0.5">
                {folders && folders.map((folder) => {
                  const folderUrl = `/users/${session.user.id}/folders/${folder.slug}`;
                  const isActive = pathname === folderUrl;

                  return (
                    <Link key={folder.id} href={folderUrl}>
                      <span
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors group relative",
                          isActive
                            ? "bg-secondary text-secondary-foreground"
                            : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                        )}
                      >
                        <Folder size={18} className="shrink-0 text-muted-foreground" />
                        {!isCollapsed && <span className="truncate">{folder.name}</span>}
                        
                        {isCollapsed && (
                          <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-popover text-popover-foreground text-xs font-semibold invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-md">
                            {folder.name}
                          </div>
                        )}
                      </span>
                    </Link>
                  );
                })}

                <button
                  onClick={handleCreateFolder}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors group relative"
                >
                  <Plus size={18} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">Tạo thư mục mới</span>}
                  
                  {isCollapsed && (
                    <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-popover text-popover-foreground text-xs font-semibold invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-md">
                      Tạo thư mục mới
                    </div>
                  )}
                </button>
              </div>
            </div>

            <Separator className="my-2" />

            {/* Teacher Tools */}
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 py-2 text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  Công cụ của giáo viên
                </div>
              )}
              
              <Link href="#">
                <span
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors group relative"
                  )}
                >
                  <Activity size={18} className="shrink-0" />
                  {!isCollapsed && <span className="truncate">Giao hoạt động</span>}
                  
                  {isCollapsed && (
                    <div className="absolute left-full rounded-md px-2 py-1 ml-6 bg-popover text-popover-foreground text-xs font-semibold invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-50 whitespace-nowrap shadow-md">
                      Giao hoạt động
                    </div>
                  )}
                </span>
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t text-xs text-muted-foreground flex justify-between items-center">
          <span>Quizlet Ultimate © 2026</span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
