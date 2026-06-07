"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, 
  Home, 
  FolderHeart, 
  Bell, 
  Plus, 
  Folder, 
  Activity,
  Users
} from "lucide-react";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@acme/ui/sheet";
import { Separator } from "@acme/ui/separator";

import { useFolderDialogContext } from "~/contexts/folder-dialog-context";
import { useClassDialogContext } from "~/contexts/class-dialog-context";
import { useTranslation } from "~/contexts/i18n-context";
import { api } from "~/trpc/react";
import { cn } from "@acme/ui";

const MobileMenu = ({ session }: { session: Session | null }) => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const [, dispatchFolder] = useFolderDialogContext();
  const [, dispatchClass] = useClassDialogContext();
  const [open, setOpen] = React.useState(false);

  // Load user folders & classes if logged in
  const { data: folders } = api.folder.allByUser.useQuery(
    { userId: session?.user.id ?? "" },
    { enabled: !!session?.user.id }
  );

  const { data: classes } = api.class.allByUser.useQuery(
    { userId: session?.user.id ?? "" },
    { enabled: !!session?.user.id }
  );

  const openFolderDialog = () => {
    setOpen(false);
    dispatchFolder({ type: "open" });
  };

  const openClassDialog = () => {
    setOpen(false);
    dispatchClass({ type: "open" });
  };

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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="md:hidden" size="icon">
          <Menu size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-0 flex flex-col h-full bg-card">
        {/* Header */}
        <SheetHeader className="h-16 border-b flex items-center justify-between px-4 flex-row">
          <Link 
            href="/" 
            className="font-sans font-bold text-2xl tracking-wider text-primary flex items-center gap-1"
            onClick={() => setOpen(false)}
          >
            <span className="text-primary font-extrabold">Q</span>
            <span className="text-blue-500 font-extrabold">+</span>
          </Link>
        </SheetHeader>

        {/* Content Link List */}
        <div className="flex-1 py-4 overflow-y-auto px-3 space-y-4">
          <div className="space-y-1">
            {navItems.map((item, index) => {
              if (item.authRequired && !session) return null;
              const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
              const Icon = item.icon;

              return (
                <Link key={index} href={item.href} onClick={() => setOpen(false)}>
                  <span
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors w-full",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    )}
                  >
                    <Icon size={20} className="shrink-0" />
                    <span>{item.label}</span>
                  </span>
                </Link>
              );
            })}
          </div>

          {session && (
            <>
              <Separator />

              {/* User Classes Section */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  Lớp học của bạn
                </div>
                
                <div className="space-y-0.5">
                  {classes && classes.map((cls) => {
                    const classUrl = `/classes/${cls.id}`;
                    const isActive = pathname === classUrl;

                    return (
                      <Link key={cls.id} href={classUrl} onClick={() => setOpen(false)}>
                        <span
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                            isActive
                              ? "bg-secondary text-secondary-foreground font-bold"
                              : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                          )}
                        >
                          <Users size={18} className="shrink-0 text-muted-foreground" />
                          <span className="truncate">{cls.name}</span>
                        </span>
                      </Link>
                    );
                  })}

                  <button
                    onClick={openClassDialog}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
                  >
                    <Plus size={18} className="shrink-0" />
                    <span className="truncate">+ Lớp mới</span>
                  </button>
                </div>
              </div>

              <Separator />

              {/* User Folders Section */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  Thư mục của bạn
                </div>
                
                <div className="space-y-0.5">
                  {folders && folders.map((folder) => {
                    const folderUrl = `/users/${session.user.id}/folders/${folder.slug}`;
                    const isActive = pathname === folderUrl;

                    return (
                      <Link key={folder.id} href={folderUrl} onClick={() => setOpen(false)}>
                        <span
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors w-full",
                            isActive
                              ? "bg-secondary text-secondary-foreground"
                              : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                          )}
                        >
                          <Folder size={18} className="shrink-0 text-muted-foreground" />
                          <span className="truncate">{folder.name}</span>
                        </span>
                      </Link>
                    );
                  })}

                  <button
                    onClick={openFolderDialog}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-semibold hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors"
                  >
                    <Plus size={18} className="shrink-0" />
                    <span className="truncate">Tạo thư mục mới</span>
                  </button>
                </div>
              </div>

              <Separator />

              {/* Teacher Tools */}
              <div className="space-y-1">
                <div className="px-3 py-2 text-xs font-bold text-muted-foreground tracking-wider uppercase">
                  Công cụ của giáo viên
                </div>
                
                <Link href="#" onClick={() => setOpen(false)}>
                  <span className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground text-muted-foreground transition-colors w-full">
                    <Activity size={18} className="shrink-0" />
                    <span>Giao hoạt động</span>
                  </span>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t text-xs text-muted-foreground text-center">
          Quizlet Ultimate © 2026
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
