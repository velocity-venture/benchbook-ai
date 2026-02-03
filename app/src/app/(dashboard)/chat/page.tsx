"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  RefreshCw,
  Bookmark,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: Date;
}

interface Source {
  title: string;
  citation: string;
  type: "TCA" | "DCS" | "TRJPP" | "LOCAL" | "CASELAW";
  snippet: string;
}

const suggestedQueries = [
  "What are the grounds for detention under T.C.A. § 37-1-114?",
  "When is a child entitled to appointed counsel?",
  "What is the standard for transfer to criminal court?",
  "DCS policy on home removal investigations",
  "FERPA requirements for juvenile records",
];

const exampleResponse: Message = {
  id: "1",
  role: "assistant",
  content: `Under **T.C.A. § 37-1-114(a)**, a child may be detained only if:

1. **Immediate endangerment** — Detention is necessary to protect the child or others from immediate harm
2. **Flight risk** — There is reason to believe the child may flee the jurisdiction
3. **No parent/guardian available** — The child has no parent, guardian, or custodian able to provide supervision
4. **Serious offense** — The child is charged with an offense that would be a felony if committed by an adult

**Key Procedural Requirements:**
- A detention hearing must be held within **48 hours** (excluding weekends and holidays) of the child being taken into custody
- The court must consider **less restrictive alternatives** before ordering detention
- Written findings are required explaining why detention is necessary

**Relevant Case Law:**
*In re D.W.*, 2019 WL 1234567 (Tenn. Ct. App. 2019) — Court held that mere convenience to parents does not justify detention when suitable alternatives exist.

**DCS Policy 14.12** also requires caseworkers to document reasonable efforts to prevent removal before requesting court-ordered detention.`,
  sources: [
    {
      title: "Grounds for Detention",
      citation: "T.C.A. § 37-1-114",
      type: "TCA",
      snippet: "A child may be detained in a secure facility only if...",
    },
    {
      title: "DCS Investigation Policy",
      citation: "DCS Policy 14.12",
      type: "DCS",
      snippet: "Prior to any home removal, the investigator shall...",
    },
    {
      title: "In re D.W.",
      citation: "2019 WL 1234567 (Tenn. Ct. App.)",
      type: "CASELAW",
      snippet: "The juvenile court erred in ordering detention...",
    },
  ],
  timestamp: new Date(),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const query = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          messages: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "I apologize, but I couldn't generate a response.",
        sources: data.sources || [],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but there was an error processing your request. Please try again.",
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
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">AI Legal Research</h1>
              <p className="text-sm text-slate-400">T.C.A., DCS Policy, Case Law, TRJPP</p>
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
                I can help you research T.C.A. Title 37, DCS policies, TRJPP rules,
                local court rules, and relevant case law. Just ask a question.
              </p>
            </div>

            {/* Suggested Queries */}
            <div className="space-y-3">
              <p className="text-sm text-slate-500 text-center">Try asking:</p>
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
                { icon: BookOpen, label: "T.C.A. Title 36 & 37", color: "text-blue-400" },
                { icon: FileText, label: "DCS Policies", color: "text-green-400" },
                { icon: Scale, label: "Case Law", color: "text-purple-400" },
                { icon: FileText, label: "TRJPP Rules", color: "text-orange-400" },
              ].map((source, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 rounded-full"
                >
                  <source.icon className={cn("w-4 h-4", source.color)} />
                  <span className="text-xs text-slate-400">{source.label}</span>
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
                      <p className="text-sm font-medium">{message.content}</p>
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
                          <div className="prose prose-invert prose-sm max-w-none">
                            <div
                              className="text-slate-200"
                              dangerouslySetInnerHTML={{
                                __html: message.content
                                  .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                  .replace(/\*(.*?)\*/g, "<em>$1</em>")
                                  .replace(/\n/g, "<br />"),
                              }}
                            />
                          </div>

                          {/* Sources */}
                          {message.sources && message.sources.length > 0 && (
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
                                        source.type === "TCA" && "border-blue-500 text-blue-400",
                                        source.type === "DCS" && "border-green-500 text-green-400",
                                        source.type === "CASELAW" && "border-purple-500 text-purple-400",
                                        source.type === "TRJPP" && "border-orange-500 text-orange-400"
                                      )}
                                    >
                                      {source.type}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-medium text-white">{source.citation}</p>
                                      <p className="text-xs text-slate-500 truncate">{source.snippet}</p>
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
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="text-slate-500 hover:text-white p-1">
                            <Bookmark className="w-4 h-4" />
                          </button>
                          <button className="text-slate-500 hover:text-green-400 p-1">
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button className="text-slate-500 hover:text-red-400 p-1">
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
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                    <span className="text-sm text-slate-400">Researching Tennessee law...</span>
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
  );
}
