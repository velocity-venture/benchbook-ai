"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardSidebar } from "./sidebar";
import { CommandPalette } from "./command-palette";

interface DashboardShellProps {
  user: {
    email: string;
    fullName: string;
    initials: string;
    county?: string;
  };
  children: React.ReactNode;
}

export function DashboardShell({ user, children }: DashboardShellProps) {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setCommandPaletteOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex h-screen bg-[#0a0e1a]">
      <DashboardSidebar
        user={user}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <CommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />
    </div>
  );
}
