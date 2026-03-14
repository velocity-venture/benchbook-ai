"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  BookOpen,
  Search,
  FileUp,
  StickyNote,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Command,
  Scale,
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  user: {
    email: string;
    fullName: string;
    initials: string;
    county?: string;
  };
  onOpenCommandPalette: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, shortcut: "D" },
  { name: "Bench Cards", href: "/bench-cards", icon: BookOpen, shortcut: "B" },
  { name: "Statute Search", href: "/statutes", icon: Search, shortcut: "S" },
  { name: "Document Analyzer", href: "/documents", icon: FileUp, shortcut: "A" },
  { name: "Case Notes", href: "/chat", icon: StickyNote, shortcut: "N" },
];

const bottomNav = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function DashboardSidebar({ user, onOpenCommandPalette }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div
      className={cn(
        "flex flex-col h-screen bg-[#0c0f1a] border-r border-white/[0.06] transition-all duration-200 ease-out",
        collapsed ? "w-[60px]" : "w-[240px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-bold text-[#0a0e1a] text-xs shrink-0">
            <Scale className="w-4 h-4" />
          </div>
          {!collapsed && (
            <span className="font-semibold text-sm tracking-tight truncate">
              BenchBook<span className="text-amber-400">.AI</span>
            </span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-6 h-6 flex items-center justify-center rounded text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Command palette trigger */}
      <div className="px-2 py-3">
        <button
          onClick={onOpenCommandPalette}
          className={cn(
            "w-full flex items-center gap-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all",
            collapsed ? "px-2 py-2 justify-center" : "px-3 py-2"
          )}
        >
          <Search className="w-4 h-4 shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search...</span>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 bg-white/5 border border-white/10 rounded">
                <Command className="w-2.5 h-2.5" />K
              </kbd>
            </>
          )}
        </button>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                collapsed ? "px-2 py-2 justify-center" : "px-3 py-2",
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", isActive && "text-amber-400")} />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.name}</span>
                  <kbd className="hidden lg:inline text-[10px] text-slate-600 font-mono">
                    {item.shortcut}
                  </kbd>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-2 py-2 border-t border-white/[0.06] space-y-0.5">
        {bottomNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-150",
                collapsed ? "px-2 py-2 justify-center" : "px-3 py-2",
                isActive
                  ? "bg-white/[0.08] text-white"
                  : "text-slate-500 hover:text-slate-200 hover:bg-white/[0.04]"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.name}</span>}
            </Link>
          );
        })}

        {/* User */}
        <div className={cn(
          "mt-2 rounded-lg bg-white/[0.03] border border-white/[0.06]",
          collapsed ? "p-2" : "p-3"
        )}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-[#0a0e1a] font-semibold text-[10px] shrink-0">
              {user.initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-200 truncate">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-slate-600 truncate">
                  {user.county || user.email}
                </p>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 mt-2.5 w-full px-2 py-1.5 rounded text-[11px] text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
            >
              <LogOut className="w-3 h-3" />
              Sign Out
            </button>
          )}
          {collapsed && (
            <button
              onClick={handleSignOut}
              className="mt-2 w-full flex justify-center text-slate-500 hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
