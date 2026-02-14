import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get research patterns for the user
    const { data: patterns, error } = await supabase
      .from("research_patterns")
      .select("pattern_type, pattern_data, last_updated")
      .eq("user_id", user.id);

    if (error) {
      console.error("Research patterns query error:", error);
      return NextResponse.json(
        { error: "Failed to retrieve research patterns" },
        { status: 500 }
      );
    }

    // Transform patterns into a more usable format
    const formattedPatterns = {
      topQueries: [],
      frequentCitations: [],
      lastUpdated: null,
    };

    for (const pattern of patterns) {
      if (pattern.pattern_type === 'top_queries' && pattern.pattern_data?.queries) {
        formattedPatterns.topQueries = pattern.pattern_data.queries;
        formattedPatterns.lastUpdated = pattern.last_updated;
      } else if (pattern.pattern_type === 'frequent_citations' && pattern.pattern_data?.citations) {
        formattedPatterns.frequentCitations = pattern.pattern_data.citations;
      }
    }

    return NextResponse.json(formattedPatterns);
  } catch (error) {
    console.error("Research patterns API error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Force update research patterns
    const { error } = await supabase.rpc('update_user_research_patterns', {
      target_user_id: user.id,
    });

    if (error) {
      console.error("Failed to update research patterns:", error);
      return NextResponse.json(
        { error: "Failed to update research patterns" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Research patterns updated" });
  } catch (error) {
    console.error("Research patterns update error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}