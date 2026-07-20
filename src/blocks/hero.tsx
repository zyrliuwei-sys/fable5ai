"use client";

import { useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/core/i18n/navigation";
import { m } from "@/paraglide/messages.js";
import { tDynamic } from "@/core/i18n/dynamic";
import {
  ArrowRight,
  Sparkles,
  Send,
  MessageSquare,
  FileText,
  Presentation,
  Image as ImageIcon,
  Video,
  Music,
  Search,
  type LucideIcon,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { envConfigs } from "@/config";
import { apiPost } from "@/lib/api-client";
import { toast } from "sonner";
import { MarkdownContent } from "@/components/markdown-content";

/**
 * OmniAgent-style hero with a LIVE chat console.
 *
 * The prompt box calls the Kie.ai chat-completions API (model `kie_chat_model`,
 * default `gemini-3-flash-openai`) via the public /api/hero/ai endpoint and
 * renders the real reply. The CTA buttons still route into the product.
 */
const CAPABILITIES: { icon: LucideIcon; key: string; badge?: boolean }[] = [
  { icon: MessageSquare, key: "landing.chips.auth" },
  { icon: FileText, key: "landing.chips.payment" },
  { icon: Presentation, key: "landing.chips.subscription" },
  { icon: ImageIcon, key: "landing.chips.credits" },
  { icon: Video, key: "landing.chips.rbac", badge: true },
  { icon: Music, key: "landing.chips.i18n", badge: true },
  { icon: Search, key: "landing.chips.cms" },
];

type Role = "user" | "assistant";
type ChatMessage = { role: Role; content: string };

const SEED_MESSAGES: ChatMessage[] = [
  {
    role: "assistant",
    content:
      "Hi! I'm **Fable5** — your all-in-one AI agent. Ask me to write, design, research, or create right here. ✨",
  },
];

export function Hero() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Keep the latest message in view.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function send() {
    const prompt = input.trim();
    if (!prompt || loading) return;

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setInput("");
    setLoading(true);

    try {
      const data = await apiPost<{ reply: string }>("/api/hero/ai", { prompt });
      const reply = data.reply?.trim();
      if (!reply) throw new Error(m["landing.hero.ai.error"]());
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply },
      ]);
    } catch (e: any) {
      toast.error(e?.message || m["landing.hero.ai.error"]());
      // Drop the unanswered user turn so the console stays clean.
      setMessages((prev) => {
        const next = [...prev];
        if (next[next.length - 1]?.role === "user") next.pop();
        return next;
      });
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <section className="relative isolate flex flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* Animated gradient orbs */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="animate-drift-a absolute -top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="animate-drift-b absolute -bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[100px]" />
        <div className="animate-drift-c absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/10 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Top badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="size-4 text-purple-400" />
            <span className="text-muted-foreground">{envConfigs.app_name}</span>
            <span className="text-purple-400 font-medium">AI Agent</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center font-sans text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight">
          <span className="bg-gradient-to-br from-foreground via-foreground to-purple-300 bg-clip-text text-transparent">
            {m["landing.hero.headline"]()}
          </span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-center text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed">
          {m["landing.hero.subheadline"]()}
        </p>

        {/* Live chat console */}
        <div className="mt-12 mx-auto max-w-2xl">
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden shadow-2xl shadow-purple-500/5">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/60" />
                <div className="size-3 rounded-full bg-yellow-500/60" />
                <div className="size-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="inline-flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1 text-xs text-muted-foreground">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
                  </span>
                  {m["landing.hero.ai.hint"]()}
                </div>
              </div>
            </div>

            {/* Conversation (live) */}
            <div
              ref={scrollRef}
              className="max-h-[320px] min-h-[200px] space-y-4 overflow-y-auto px-5 py-6"
            >
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {loading && (
                <MessageBubble
                  message={{ role: "assistant", content: "__thinking__" }}
                />
              )}
            </div>

            {/* Capability pills */}
            <div className="flex flex-wrap gap-2 px-5 pb-3">
              {CAPABILITIES.map(({ icon: Icon, key, badge }) => (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs text-muted-foreground"
                >
                  <Icon className="size-3 text-purple-300" />
                  {tDynamic(key)}
                  {badge && (
                    <span className="rounded-full bg-purple-500/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-purple-300">
                      New
                    </span>
                  )}
                </span>
              ))}
            </div>

            {/* Input bar (functional) */}
            <div className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  aria-label="prompt"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  disabled={loading}
                  placeholder={m["landing.hero.waitlist.placeholder"]()}
                  className="h-11 flex-1 rounded-full border border-white/10 bg-white/5 px-5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/25 disabled:opacity-60"
                />
                <button
                  onClick={send}
                  disabled={loading || !input.trim()}
                  aria-label={m["landing.hero.waitlist.button"]()}
                  className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? (
                    <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <Send className="size-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA row */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => router.push("/sign-up")}
              className={cn(
                buttonVariants({ size: "lg" }),
                "gap-2 rounded-full px-7 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-purple-500/25"
              )}
            >
              {m["landing.hero.cta"]()}
              <ArrowRight className="size-4" />
            </button>
            <Link
              href="/#features"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "rounded-full px-7 h-12 border-white/15 bg-white/5 hover:bg-white/10"
              )}
            >
              {m["landing.hero.secondary"]()}
            </Link>
          </div>
          <p className="text-xs text-muted-foreground">
            {m["landing.hero.prompt_hint"]()}
          </p>
        </div>
      </div>
    </section>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const thinking = message.content === "__thinking__";

  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-gradient-to-br from-purple-600 to-indigo-600 px-4 py-2.5 text-sm text-white shadow-lg shadow-purple-500/20">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2.5">
      <div className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
        <Sparkles className="size-3.5" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-foreground">
        {thinking ? (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <span className="flex gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-purple-300 [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-purple-300 [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-purple-300" />
            </span>
            <span className="text-xs">{m["landing.hero.ai.thinking"]()}</span>
          </span>
        ) : (
          <MarkdownContent content={message.content} className="text-sm" />
        )}
      </div>
    </div>
  );
}
