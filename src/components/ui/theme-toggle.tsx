"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { actualTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(actualTheme === "light" ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="h-9 w-9 p-0 hover:bg-white/10 dark:hover:bg-white/10"
      aria-label={`Switch to ${actualTheme === "light" ? "dark" : "light"} mode`}
      style={{
        transition: 'background-color 0.3s ease-in-out, border-color 0.3s ease-in-out, color 0.3s ease-in-out'
      }}
    >
      <div className="relative overflow-hidden">
        <Sun 
          className={`h-[1.2rem] w-[1.2rem] ${
            actualTheme === "dark" 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100"
          }`}
          style={{
            transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out'
          }}
        />
        <Moon 
          className={`absolute inset-0 h-[1.2rem] w-[1.2rem] ${
            actualTheme === "dark" 
              ? "rotate-0 scale-100 opacity-100" 
              : "-rotate-90 scale-0 opacity-0"
          }`}
          style={{
            transition: 'transform 0.3s ease-in-out, opacity 0.3s ease-in-out'
          }}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
} 