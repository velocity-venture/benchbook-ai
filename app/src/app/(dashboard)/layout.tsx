import { redirect } from "next/navigation";
import { DashboardShell } from "@/components/dashboard/shell";
import { PreferencesProvider } from "@/contexts/preferences-context";
import "@/styles/courtroom-mode.css";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let fullName = "Judge Demo";
  let initials = "JD";
  let email = "demo@benchbook.ai";
  let county: string | undefined = "Demo County";

  if (supabaseUrl && supabaseKey) {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, county, title")
      .eq("id", user.id)
      .single();

    fullName =
      profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
    initials = fullName
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    email = user.email || "";
    county = profile?.county;
  }

  return (
    <PreferencesProvider>
      <DashboardShell
        user={{
          email,
          fullName,
          initials,
          county,
        }}
      >
        {children}
      </DashboardShell>
    </PreferencesProvider>
  );
}
