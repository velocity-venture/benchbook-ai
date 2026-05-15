type SupabaseEnv = {
  url: string;
  anonKey: string;
};

export function getSupabaseEnv(): SupabaseEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const missing: string[] = [];

  if (!supabaseUrl) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!supabaseAnonKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }

  try {
    const parsedUrl = new URL(supabaseUrl);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new Error("invalid protocol");
    }
  } catch {
    throw new Error("Invalid environment variable: NEXT_PUBLIC_SUPABASE_URL");
  }

  return { url: supabaseUrl, anonKey: supabaseAnonKey };
}
