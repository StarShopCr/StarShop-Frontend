"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

type ThemeProviderContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: "light" | "dark";
};

const ThemeProviderContext = createContext<ThemeProviderContextType | undefined>(
  undefined
);

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

const applyTheme = (theme: "light" | "dark") => {
  const root = window.document.documentElement;
  
  // Remove both classes first
  root.classList.remove("light", "dark");
  
  // Use requestAnimationFrame to ensure the removal is processed before adding the new class
  requestAnimationFrame(() => {
    root.classList.add(theme);
  });
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "starshop-theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [actualTheme, setActualTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Get theme from localStorage or use system preference
    const storedTheme = localStorage.getItem(storageKey) as Theme | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    const initialTheme = storedTheme || defaultTheme;
    setTheme(initialTheme);

    // Set the actual theme based on preference
    const resolvedTheme = initialTheme === "system" ? systemTheme : initialTheme;
    setActualTheme(resolvedTheme);
    
    // Apply theme to document
    applyTheme(resolvedTheme);
  }, [defaultTheme, storageKey]);

  const updateTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey, newTheme);
    setTheme(newTheme);

    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    const resolvedTheme = newTheme === "system" ? systemTheme : newTheme;
    setActualTheme(resolvedTheme);

    // Apply theme to document with smooth transition
    applyTheme(resolvedTheme);
  };

  // Listen for system theme changes when theme is set to "system"
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const systemTheme = e.matches ? "dark" : "light";
      setActualTheme(systemTheme);
      applyTheme(systemTheme);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  const value: ThemeProviderContextType = {
    theme,
    setTheme: updateTheme,
    actualTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}; 