"use client";

import { LanguageSwitcherWrapper } from "../LanguageSwitcherWrapper";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-30 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between px-4 h-fit max-w-screen-2xl">
        <div className="flex items-center">
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeToggle />
            <LanguageSwitcherWrapper />
        </div>
      </div>
    </header>
  );
} 