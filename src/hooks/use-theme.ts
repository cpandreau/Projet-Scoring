"use client";

import { useTheme as useNextTheme } from "next-themes";

export type Theme = "light" | "dark" | "system";

/**
 * Hook pour gérer le thème de l'application
 * Wrapper autour de next-themes avec types plus stricts
 */
export function useTheme() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useNextTheme();

  return {
    /** Thème actuel ('light' | 'dark' | 'system') */
    theme: (theme as Theme) || "system",
    /** Thème résolu (toujours 'light' ou 'dark') */
    resolvedTheme: resolvedTheme as "light" | "dark" | undefined,
    /** Thème système */
    systemTheme: systemTheme as "light" | "dark" | undefined,
    /** Change le thème */
    setTheme: (newTheme: Theme) => setTheme(newTheme),
    /** Bascule entre light et dark */
    toggleTheme: () => {
      const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    },
    /** Est en mode sombre */
    isDark: resolvedTheme === "dark",
    /** Est en mode clair */
    isLight: resolvedTheme === "light",
  };
}
