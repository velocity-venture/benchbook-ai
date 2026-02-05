import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile data (may not exist yet for new signups)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, county, title")
    .eq("id", user.id)
    .single();

  const fullName =
    profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const initials = fullName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex h-screen bg-slate-950">
      <Sidebar
        user={{
          email: user.email || "",
          fullName,
          initials,
          county: profile?.county,
        }}
      />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
