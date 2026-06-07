"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

import type { Session } from "@acme/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@acme/ui/dropdown-menu";
import { useTheme } from "@acme/ui/theme";

import { signOutAction } from "~/actions/sign-out";
import { useTranslation } from "~/contexts/i18n-context";

const UserDropdown = ({ user }: { user: Session["user"] }) => {
  const { id, image, name, email } = user;
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <Avatar>
          {image && (
            <AvatarImage
              src={image}
              alt={name ?? "user avatar"}
              width={32}
              height={32}
            />
          )}
          <AvatarFallback>{name?.at(0) ?? "U"}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap">
          {email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <Link href={`/users/${id}`}>
          <DropdownMenuItem>{t("profile")}</DropdownMenuItem>
        </Link>
        <Link href="/achievements">
          <DropdownMenuItem>{t("achievements")}</DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
        </Link>

        {/* Theme switching submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("theme")}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={
                mounted && theme === "light" ? "font-bold text-primary" : ""
              }
            >
              {t("light")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={
                mounted && theme === "dark" ? "font-bold text-primary" : ""
              }
            >
              {t("dark")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dracula")}
              className={
                mounted && theme === "dracula" ? "font-bold text-primary" : ""
              }
            >
              {t("dracula")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className={
                mounted && theme === "system" ? "font-bold text-primary" : ""
              }
            >
              {t("system")}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Language switching submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("language")}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => setLanguage("vi")}
              className={language === "vi" ? "font-bold text-primary" : ""}
            >
              🇻🇳 {t("vietnamese")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage("en")}
              className={language === "en" ? "font-bold text-primary" : ""}
            >
              🇬🇧 {t("english")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setLanguage("zh")}
              className={language === "zh" ? "font-bold text-primary" : ""}
            >
              🇨🇳 {t("chinese")}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOutAction()}>
          {t("signout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
