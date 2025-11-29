"use client";

import {
  LaptopMinimalIcon,
  type LucideIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

type Theme = "light" | "system" | "dark";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options: { value: Theme; icon: LucideIcon }[] = [
    { icon: SunIcon, value: "light" },
    { icon: LaptopMinimalIcon, value: "system" },
    { icon: MoonIcon, value: "dark" },
  ];

  return (
    <div className="bg-secondary inline-flex items-center gap-1 rounded-full">
      {options.map(({ value, icon: Icon }) => (
        <button
          aria-label={`Switch to ${value} theme`}
          className={cn(
            "flex items-center justify-center rounded-full border border-transparent px-2 py-1.5 transition-all focus:outline-none focus-visible:outline-none",
            theme === value
              ? "bg-background text-foreground border-border shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          key={value}
          onMouseDown={() => setTheme(value)}
          type="button"
        >
          <Icon
            className={cn(
              "size-4.5 md:size-4",
              theme === value ? "stroke-2.5" : "stroke-2",
            )}
          />
        </button>
      ))}
    </div>
  );
}
