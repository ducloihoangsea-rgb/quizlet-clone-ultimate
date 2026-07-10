"use client";

import Link from "next/link";
import { Search } from "lucide-react";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";

import CreateOptionsDropdown from "./create-options-dropdown";
import MobileMenu from "./mobile-menu";
import SignInButton from "./sign-in-button";
import UserDropdown from "./user-dropdown";
import { useTranslation } from "~/contexts/i18n-context";

interface NavbarProps {
  session: Session | null;
  isCollapsed?: boolean;
  setIsCollapsed?: (value: boolean) => void;
}

const Navbar = ({ session }: NavbarProps) => {
  const { t } = useTranslation();

  return (
    <header className="flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6 shrink-0 z-30 select-none">
      {/* Left side: Mobile Menu Toggle / Spacer */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <MobileMenu session={session} />
        </div>
        <Link 
          href="/" 
          className="md:hidden font-sans font-bold text-xl tracking-wider text-primary flex items-center gap-1"
        >
          <span className="text-primary font-extrabold">Q</span>
          <span className="text-blue-500 font-extrabold">+</span>
        </Link>
      </div>

      {/* Middle side: Search Bar */}
      <div className="flex-1 max-w-xl mx-4 relative hidden sm:block">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full bg-secondary text-secondary-foreground pl-10 pr-4 py-2 rounded-full text-sm font-medium border border-transparent focus:border-border focus:bg-background focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Right side: Action Buttons & User Menu */}
      <div className="flex items-center gap-3">
        {/* Search icon for small screens (where full search bar is hidden) */}
        <button className="sm:hidden p-2 text-muted-foreground hover:text-foreground">
          <Search size={20} />
        </button>

        {session && (
          <>
            {/* Create Dropdown (Blue plus button) */}
            <CreateOptionsDropdown session={session} />
          </>
        )}
        
        {session ? (
          <UserDropdown user={session.user} />
        ) : (
          <SignInButton />
        )}
      </div>
    </header>
  );
};

export default Navbar;
