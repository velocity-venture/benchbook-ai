import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("waitlist")
      .insert({ email: email.toLowerCase().trim(), source: "landing_page" });

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({ message: "You're already on the waitlist!" });
      }
      console.error("Waitlist insert error:", error);
      return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
    }

    return NextResponse.json({ message: "Welcome to the waitlist!" });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
