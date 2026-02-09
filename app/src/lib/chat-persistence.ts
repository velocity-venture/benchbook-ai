import { createClient } from "@/lib/supabase/server";

export async function createSession(title: string = "New Chat") {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({ user_id: user.id, title })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSessions() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSessionMessages(sessionId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function saveMessage(
  sessionId: string,
  role: "user" | "assistant",
  content: string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("chat_messages")
    .insert({ session_id: sessionId, role, content });

  if (error) throw error;

  await supabase
    .from("chat_sessions")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", sessionId);
}

export async function deleteSession(sessionId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) throw error;
}

export async function toggleFeedback(
  messageId: string,
  feedbackType: "thumbs_up" | "thumbs_down" | "bookmark"
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: existing } = await supabase
    .from("chat_feedback")
    .select("id")
    .eq("message_id", messageId)
    .eq("feedback_type", feedbackType)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("chat_feedback").delete().eq("id", existing.id);
    return { action: "removed" as const };
  } else {
    await supabase.from("chat_feedback").insert({
      user_id: user.id,
      message_id: messageId,
      feedback_type: feedbackType,
    });
    return { action: "added" as const };
  }
}
