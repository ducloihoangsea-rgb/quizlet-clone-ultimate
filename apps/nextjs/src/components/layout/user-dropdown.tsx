import Link from "next/link";

import type { Session } from "@acme/auth";
import { signOut } from "@acme/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@acme/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@acme/ui/dropdown-menu";
import { useTheme } from "@acme/ui/theme";
import { useTranslation } from "~/contexts/i18n-context";

const UserDropdown = ({ user }: { user: Session["user"] }) => {
  const { id, image, name, email } = user;
  const { t, language, setLanguage } = useTranslation();
  const { theme, setTheme } = useTheme();

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
        <Link href="/settings">
          <DropdownMenuItem>{t("settings")}</DropdownMenuItem>
        </Link>

        {/* Theme switching submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>{t("theme")}</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem
              onClick={() => setTheme("light")}
              className={theme === "light" ? "font-bold text-primary" : ""}
            >
              {t("light")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dark")}
              className={theme === "dark" ? "font-bold text-primary" : ""}
            >
              {t("dark")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("dracula")}
              className={theme === "dracula" ? "font-bold text-primary" : ""}
            >
              {t("dracula")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setTheme("system")}
              className={theme === "system" ? "font-bold text-primary" : ""}
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
        <form>
          <DropdownMenuItem asChild>
            <button
              className="w-full text-left"
              formAction={async () => {
                "use server";
                await signOut();
              }}
            >
              {t("signout")}
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;
