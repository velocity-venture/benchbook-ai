"use client";

import { DashboardShell } from "@/components/dashboard/shell";
import { PreferencesProvider } from "@/contexts/preferences-context";
import "@/styles/courtroom-mode.css";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState({
    email: "demo@benchbook.ai",
    fullName: "Judge Demo",
    initials: "JD",
    county: "Demo County" as string | undefined,
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const supabase = createClient();
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, county, title")
          .eq("id", authUser.id)
          .single();

        const fullName =
          profile?.full_name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split("@")[0] ||
          "User";
        const initials = fullName
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        setUser({
          email: authUser.email || "",
          fullName,
          initials,
          county: profile?.county,
        });
      }
      // In demo mode (no Supabase), keep defaults
      setLoading(false);
    };
    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0a0e1a] items-center justify-center">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <PreferencesProvider>
      <DashboardShell user={user}>
        {children}
      </DashboardShell>
    </PreferencesProvider>
  );
}
