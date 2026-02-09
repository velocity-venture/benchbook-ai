"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Sparkles,
  BookOpen,
  Scale,
  FileText,
  Clock,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  Plus,
  MessageSquare,
  Trash2,
  ChevronLeft,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: Date;
  feedback?: Set<string>;
}

interface Source {
  title: string;
  citation: string;
  type: "TCA" | "DCS" | "TRJPP" | "LOCAL" | "CASELAW";
  snippet: string;
}

interface ChatSession {
  id: string;
  title: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

const suggestedQueries = [
  "What are the grounds for detention under T.C.A. § 37-1-114?",
  "When is a child entitled to appointed counsel?",
  "What is the standard for transfer to criminal court?",
  "DCS policy on home removal investigations",
  "FERPA requirements for juvenile records",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabaseRef = useRef(null as ReturnType<typeof createClient> | null);

  function getSupabase() {
    if (!supabaseRef.current) {
      supabaseRef.current = createClient();
    }
    return supabaseRef.current;
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const { data } = await getSupabase()
      .from("chat_sessions")
      .select("id, title, message_count, created_at, updated_at")
      .order("updated_at", { ascending: false });
    if (data) setSessions(data);
  }

  const loadSession = useCallback(async (sessionId: string) => {
    setActiveSessionId(sessionId);
    setShowSidebar(false);

    const { data } = await getSupabase()
      .from("chat_messages")
      .select("id, role, content, sources, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (data) {
      // Load feedback for all messages in this session
      const messageIds = data.map((m) => m.id);
      const { data: feedbackData } = await getSupabase()
        .from("chat_feedback")
        .select("message_id, feedback_type")
        .in("message_id", messageIds);

      const feedbackMap = new Map<string, Set<string>>();
      feedbackData?.forEach((f) => {
        if (!feedbackMap.has(f.message_id)) {
          feedbackMap.set(f.message_id, new Set());
        }
        feedbackMap.get(f.message_id)!.add(f.feedback_type);
      });

      setMessages(
        data.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          sources: m.sources || [],
          timestamp: new Date(m.created_at),
          feedback: feedbackMap.get(m.id) || new Set(),
        }))
      );
    }
  }, []);

  async function createSession(firstMessage: string): Promise<string> {
    const title =
      firstMessage.length > 60
        ? firstMessage.substring(0, 57) + "..."
        : firstMessage;

    const { data, error } = await getSupabase()
      .from("chat_sessions")
      .insert({ title })
      .select("id")
      .single();

    if (error || !data) {
      throw new Error("Failed to create chat session");
    }

    return data.id;
  }

  async function saveMessage(
    sessionId: string,
    role: "user" | "assistant",
    content: string,
    sources: Source[] = []
  ): Promise<string> {
    const { data, error } = await getSupabase()
      .from("chat_messages")
      .insert({
        session_id: sessionId,
        role,
        content,
        sources: sources.length > 0 ? sources : [],
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Failed to save message:", error);
      throw new Error("Failed to save message");
    }

    return data.id;
  }

  async function toggleFeedback(messageId: string, feedbackType: string) {
    const message = messages.find((m) => m.id === messageId);
    if (!message) return;

    const hasFeedback = message.feedback?.has(feedbackType);

    if (hasFeedback) {
      await getSupabase()
        .from("chat_feedback")
        .delete()
        .eq("message_id", messageId)
        .eq("feedback_type", feedbackType);
    } else {
      await getSupabase().from("chat_feedback").insert({
        message_id: messageId,
        feedback_type: feedbackType,
      });
    }

    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const newFeedback = new Set(m.feedback || []);
        if (hasFeedback) {
          newFeedback.delete(feedbackType);
        } else {
          newFeedback.add(feedbackType);
        }
        return { ...m, feedback: newFeedback };
      })
    );
  }

  async function deleteSession(sessionId: string) {
    await getSupabase().from("chat_sessions").delete().eq("id", sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setActiveSessionId(null);
      setMessages([]);
    }
  }

  function startNewChat() {
    setActiveSessionId(null);
    setMessages([]);
    setShowSidebar(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const query = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Create session if needed
      let sessionId = activeSessionId;
      if (!sessionId) {
        sessionId = await createSession(query);
        setActiveSessionId(sessionId);
      }

      // Save and display user message
      const userMsgId = await saveMessage(sessionId, "user", query);
      const userMessage: Message = {
        id: userMsgId,
        role: "user",
        content: query,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);

      // Call chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          session_id: sessionId,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const assistantContent =
        data.response || "I apologize, but I couldn't generate a response.";
      const sources: Source[] = data.sources || [];

      // Save assistant message
      const assistantMsgId = await saveMessage(
        sessionId,
        "assistant",
        assistantContent,
        sources
      );

      const assistantMessage: Message = {
        id: assistantMsgId,
        role: "assistant",
        content: assistantContent,
        sources,
        timestamp: new Date(),
        feedback: new Set(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Refresh session list
      loadSessions();
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "I apologize, but there was an error processing your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (query: string) => {
    setInput(query);
    textareaRef.current?.focus();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-screen">
      {/* Session Sidebar */}
      <div
        className={cn(
          "w-72 border-r border-slate-800 bg-slate-950 flex flex-col flex-shrink-0 transition-all",
          showSidebar ? "translate-x-0" : "-translate-x-full absolute z-30 h-full lg:translate-x-0 lg:relative"
        )}
      >
        <div className="p-3 border-b border-slate-800">
          <Button
            onClick={startNewChat}
            className="w-full justify-start gap-2"
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4" />
            New Research
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm",
                activeSessionId === session.id
                  ? "bg-amber-500/10 text-amber-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
              onClick={() => loadSession(session.id)}
            >
              <MessageSquare className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 truncate">{session.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSession(session.id);
                }}
                className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-xs text-slate-600 text-center py-4">
              No research sessions yet
            </p>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="lg:hidden text-slate-400 hover:text-white p-1"
              >
                <ChevronLeft
                  className={cn(
                    "w-5 h-5 transition-transform",
                    showSidebar && "rotate-180"
                  )}
                />
              </button>
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">
                  AI Legal Research
                </h1>
                <p className="text-sm text-slate-400">
                  T.C.A., DCS Policy, Case Law, TRJPP
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Scale className="w-3 h-3" />
                TN Juvenile Law
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Scale className="w-8 h-8 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Ask anything about Tennessee Juvenile Law
                </h2>
                <p className="text-slate-400 max-w-lg mx-auto">
                  I can help you research T.C.A. Title 37, DCS policies, TRJPP
                  rules, local court rules, and relevant case law. Just ask a
                  question.
                </p>
              </div>

              {/* Suggested Queries */}
              <div className="space-y-3">
                <p className="text-sm text-slate-500 text-center">
                  Try asking:
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {suggestedQueries.map((query, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(query)}
                      className="p-4 text-left bg-slate-900 border border-slate-800 rounded-lg hover:border-amber-500/50 hover:bg-slate-800 transition-colors"
                    >
                      <p className="text-sm text-slate-300">{query}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Indicators */}
              <div className="mt-12 flex flex-wrap justify-center gap-3">
                {[
                  {
                    icon: BookOpen,
                    label: "T.C.A. Title 36 & 37",
                    color: "text-blue-400",
                  },
                  {
                    icon: FileText,
                    label: "DCS Policies",
                    color: "text-green-400",
                  },
                  {
                    icon: Scale,
                    label: "Case Law",
                    color: "text-purple-400",
                  },
                  {
                    icon: FileText,
                    label: "TRJPP Rules",
                    color: "text-orange-400",
                  },
                ].map((source, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-full"
                  >
                    <source.icon className={cn("w-4 h-4", source.color)} />
                    <span className="text-xs text-slate-400">
                      {source.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Message Thread */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((message) => (
                <div key={message.id}>
                  {message.role === "user" ? (
                    /* User Message */
                    <div className="flex justify-end">
                      <div className="max-w-[80%] bg-amber-500 text-slate-950 rounded-2xl rounded-tr-sm px-4 py-3">
                        <p className="text-sm font-medium">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Assistant Message */
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Scale className="w-4 h-4 text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4">
                            <div className="prose prose-invert prose-sm max-w-none text-slate-200">
                              <ReactMarkdown>
                                {message.content}
                              </ReactMarkdown>
                            </div>

                            {/* Sources */}
                            {message.sources &&
                              message.sources.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-800">
                                  <p className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                                    <BookOpen className="w-3 h-3" />
                                    Sources
                                  </p>
                                  <div className="space-y-2">
                                    {message.sources.map((source, i) => (
                                      <div
                                        key={i}
                                        className="flex items-start gap-2 p-2 bg-slate-800/50 rounded-lg"
                                      >
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "text-xs flex-shrink-0",
                                            source.type === "TCA" &&
                                              "border-blue-500 text-blue-400",
                                            source.type === "DCS" &&
                                              "border-green-500 text-green-400",
                                            source.type === "CASELAW" &&
                                              "border-purple-500 text-purple-400",
                                            source.type === "TRJPP" &&
                                              "border-orange-500 text-orange-400",
                                            source.type === "LOCAL" &&
                                              "border-cyan-500 text-cyan-400"
                                          )}
                                        >
                                          {source.type}
                                        </Badge>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs font-medium text-white">
                                            {source.citation}
                                          </p>
                                          <p className="text-xs text-slate-500 truncate">
                                            {source.snippet}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 mt-2 px-2">
                            <button
                              onClick={() => copyToClipboard(message.content)}
                              className="text-slate-500 hover:text-white p-1"
                              title="Copy"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                toggleFeedback(message.id, "bookmark")
                              }
                              className={cn(
                                "p-1",
                                message.feedback?.has("bookmark")
                                  ? "text-amber-400"
                                  : "text-slate-500 hover:text-white"
                              )}
                              title="Bookmark"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                toggleFeedback(message.id, "thumbs_up")
                              }
                              className={cn(
                                "p-1",
                                message.feedback?.has("thumbs_up")
                                  ? "text-green-400"
                                  : "text-slate-500 hover:text-green-400"
                              )}
                              title="Helpful"
                            >
                              <ThumbsUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() =>
                                toggleFeedback(message.id, "thumbs_down")
                              }
                              className={cn(
                                "p-1",
                                message.feedback?.has("thumbs_down")
                                  ? "text-red-400"
                                  : "text-slate-500 hover:text-red-400"
                              )}
                              title="Not helpful"
                            >
                              <ThumbsDown className="w-4 h-4" />
                            </button>
                            <span className="text-xs text-slate-600 ml-auto">
                              <Clock className="w-3 h-3 inline mr-1" />
                              {message.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Scale className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-sm p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-amber-400 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                      <span className="text-sm text-slate-400">
                        Researching Tennessee law...
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-800 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Ask a question about Tennessee juvenile law..."
                className="min-h-[56px] max-h-[200px] pr-14 resize-none"
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 bottom-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              AI can make mistakes. Always verify legal citations.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
