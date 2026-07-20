import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { m } from "@/paraglide/messages.js";
import { tDynamic } from "@/core/i18n/dynamic";
import { apiGet, apiPost } from "@/lib/api-client";
import { useSession } from "@/core/auth/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { envConfigs } from "@/config";
import { MarkdownContent } from "@/components/markdown-content";
import { AgentComposer, type Autonomy } from "./agent-composer";
import { CAPABILITIES, type CapabilityId } from "./capabilities";

type Role = "user" | "assistant";
type Message = { role: Role; content: string };

type AgentReply = { reply: string; configured: boolean; chatId: string };
type AgentHistory = { chatId: string | null; messages: Message[] };

/**
 * Agent console — the main panel of /agent. Owns the conversation state,
 * wires the composer to GET/POST/DELETE /api/agent/chat, and renders either
 * the empty greeting state or the message thread. Light themed via .agent-app.
 */
export function AgentConsole({
  mode,
  onSelectMode,
  newChatNonce,
}: {
  mode: CapabilityId;
  onSelectMode: (id: CapabilityId) => void;
  newChatNonce: number;
}) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState("");
  const [autonomy, setAutonomy] = useState<Autonomy>("auto");
  const [think, setThink] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!session?.user;

  // Load the persisted conversation once when authenticated.
  const historyQuery = useQuery({
    queryKey: ["agent-chat"],
    queryFn: () => apiGet<AgentHistory>("/api/agent/chat"),
    enabled: isAuthenticated && !loaded,
  });

  useEffect(() => {
    if (!loaded && historyQuery.data) {
      setMessages(historyQuery.data.messages ?? []);
      setChatId(historyQuery.data.chatId ?? "");
      setLoaded(true);
    }
  }, [loaded, historyQuery.data]);

  // "New Chat" from the sidebar clears the local view.
  useEffect(() => {
    if (newChatNonce > 0) {
      setMessages([]);
      setChatId("");
      setInput("");
    }
  }, [newChatNonce]);

  const mutation = useMutation({
    mutationFn: async (vars: {
      messages: Message[];
      chatId: string;
      mode: CapabilityId;
      think: boolean;
      autonomy: Autonomy;
    }) => {
      if (isAuthenticated) {
        // Signed in: full agent — persisted, credit-gated, OpenAI-config.
        return apiPost<AgentReply>("/api/agent/chat", {
          messages: vars.messages,
          chatId: vars.chatId,
          mode: vars.mode,
          think: vars.think,
          autonomy: vars.autonomy,
        });
      }
      // Anonymous: chat via the public, rate-limited Kie endpoint (ephemeral,
      // not persisted) so visitors can try the agent without signing in.
      const r = await apiPost<{ reply: string }>("/api/hero/ai", {
        messages: vars.messages,
      });
      return { reply: r.reply, configured: true, chatId: "" } as AgentReply;
    },
    onSuccess: (data) => {
      if (data.chatId) setChatId(data.chatId);
      if (!data.configured) {
        toast.error(m["settings.agent.not_configured"]());
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "…" },
      ]);
    },
    onError: (e: Error) => toast.error(e.message || m["settings.agent.error"]()),
  });

  // Auto-scroll to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, mutation.isPending]);

  function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || mutation.isPending) return;

    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    mutation.mutate({ messages: next, chatId, mode, think, autonomy });
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="relative flex h-full flex-col">
      {isEmpty ? (
        /* Empty greeting state */
        <div className="flex flex-1 flex-col items-center justify-center px-4 pb-28 pt-10">
          <h1 className="text-center text-[40px] font-normal leading-[48px] tracking-tight text-foreground">
            {m["agent.greeting"]()}
          </h1>

          <div className="mt-8 w-full max-w-3xl">
            <AgentComposer
              value={input}
              onChange={setInput}
              onSend={() => send()}
              mode={mode}
              onSelectMode={onSelectMode}
              autonomy={autonomy}
              onSelectAutonomy={setAutonomy}
              think={think}
              onToggleThink={setThink}
              sending={mutation.isPending}
            />
          </div>

          {/* Capability quick-links (chatlyai renders these as plain text links) */}
          <div className="mt-6 flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
            {CAPABILITIES.filter((c) => c.id !== "autothink").map((c) => {
              const active = c.id === mode;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onSelectMode(c.id)}
                  className={cn(
                    "text-[13px] transition-colors",
                    active
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tDynamic(c.labelKey)}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Thread */
        <>
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {mutation.isPending && (
                <MessageBubble
                  message={{ role: "assistant", content: "__thinking__" }}
                />
              )}
            </div>
          </div>
          <div className="border-t border-border bg-background/80 px-4 py-4 backdrop-blur">
            <div className="mx-auto w-full max-w-3xl">
              <AgentComposer
                value={input}
                onChange={setInput}
                onSend={() => send()}
                mode={mode}
                onSelectMode={onSelectMode}
                autonomy={autonomy}
                onSelectAutonomy={setAutonomy}
                think={think}
                onToggleThink={setThink}
                sending={mutation.isPending}
              />
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                {m["agent.disclaimer"]()}
              </p>
            </div>
          </div>
        </>
      )}

      {/* Disclaimer in empty state */}
      {isEmpty && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
          <p className="text-center text-[11px] text-muted-foreground">
            {m["agent.disclaimer"]()}
          </p>
        </div>
      )}
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const thinking = message.content === "__thinking__";

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-2.5">
        <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {message.content}
        </div>
        <div className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <User className="size-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground">
        <img
          src={envConfigs.app_logo || "/logo.svg"}
          alt=""
          width={28}
          height={28}
          className="size-full object-cover"
        />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 text-foreground">
        {thinking ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="flex gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
            </span>
            <span className="text-xs">{m["settings.agent.thinking"]()}</span>
          </span>
        ) : (
          <MarkdownContent content={message.content} className="text-sm" />
        )}
      </div>
    </div>
  );
}
