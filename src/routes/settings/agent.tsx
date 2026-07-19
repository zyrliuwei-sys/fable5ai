import { createFileRoute } from '@tanstack/react-router';
import { useRef, useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { m } from '@/paraglide/messages.js';
import { apiPost, apiGet, apiDelete } from '@/lib/api-client';
import { useSession } from '@/core/auth/client';
import { toast } from 'sonner';
import { Sparkles, Send, Trash2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { MarkdownContent } from '@/components/markdown-content';

type Role = 'user' | 'assistant';
type Message = { role: Role; content: string };

type AgentReply = {
  reply: string;
  configured: boolean;
  chatId: string;
};

type AgentHistory = {
  chatId: string | null;
  messages: Message[];
};

const SUGGESTIONS = [
  'Write a launch tweet for my AI startup',
  'Summarize the latest trends in generative AI',
  'Outline a 10-slide pitch deck',
  'Draft a cold email to a potential partner',
];

function AgentPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState('');
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load the persisted conversation once on mount.
  const historyQuery = useQuery({
    queryKey: ['agent-chat'],
    queryFn: () => apiGet<AgentHistory>('/api/agent/chat'),
    enabled: !loaded,
  });

  useEffect(() => {
    if (!loaded && historyQuery.data) {
      setMessages(historyQuery.data.messages ?? []);
      setChatId(historyQuery.data.chatId ?? '');
      setLoaded(true);
    }
  }, [loaded, historyQuery.data]);

  const mutation = useMutation({
    mutationFn: (vars: { messages: Message[]; chatId: string }) =>
      apiPost<AgentReply>('/api/agent/chat', {
        messages: vars.messages,
        chatId: vars.chatId,
      }),
    onSuccess: (data) => {
      if (data.chatId) setChatId(data.chatId);
      if (!data.configured) {
        toast.error(m['settings.agent.not_configured']());
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || '…' },
      ]);
    },
    onError: (e: Error) => toast.error(e.message || m['settings.agent.error']()),
  });

  // Auto-scroll to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages, mutation.isPending]);

  function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || mutation.isPending) return;

    const next: Message[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    mutation.mutate({ messages: next, chatId });
  }

  async function handleClear() {
    if (chatId) {
      try {
        await apiDelete(`/api/agent/chat?chatId=${chatId}`);
      } catch {
        // Non-fatal: still reset the local view.
      }
    }
    setMessages([]);
    setChatId('');
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {m['settings.agent.title']()}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {m['settings.agent.subtitle']()}
          </p>
        </div>
        {!isEmpty && (
          <button
            onClick={handleClear}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'sm' }),
              'gap-2 border-white/10 bg-white/5 hover:bg-white/10'
            )}
          >
            <Trash2 className="size-4" />
            {m['settings.agent.clear']()}
          </button>
        )}
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:p-6"
      >
        {isEmpty ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
              <Sparkles className="size-7" />
            </div>
            <p className="max-w-md text-muted-foreground">
              {m['settings.agent.welcome']()}
            </p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              {m['settings.agent.empty']()}
            </p>
            <div className="mt-6 grid w-full max-w-lg gap-2 sm:grid-cols-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm text-foreground transition-colors hover:border-purple-500/30 hover:bg-white/[0.05]"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} name={session?.user?.name} />
            ))}
            {mutation.isPending && (
              <MessageBubble
                message={{ role: 'assistant', content: '__thinking__' }}
              />
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="mt-4 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={m['settings.agent.placeholder']()}
          className="h-12 flex-1 rounded-full border border-white/10 bg-white/5 px-5 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/25"
        />
        <button
          type="submit"
          disabled={!input.trim() || mutation.isPending}
          aria-label={m['settings.agent.send']()}
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:pointer-events-none"
        >
          {mutation.isPending ? (
            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </button>
      </form>
    </div>
  );
}

function MessageBubble({
  message,
  name,
}: {
  message: Message;
  name?: string | null;
}) {
  const isUser = message.role === 'user';
  const thinking = message.content === '__thinking__';

  if (isUser) {
    return (
      <div className="flex items-start justify-end gap-2.5">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-purple-600 to-indigo-600 px-4 py-2.5 text-sm text-white shadow-lg shadow-purple-500/10">
          {message.content}
        </div>
        <div className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-muted-foreground">
          <User className="size-3.5" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-start gap-2.5">
      <div className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white">
        <Sparkles className="size-3.5" />
      </div>
      <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-2.5 text-foreground">
        {thinking ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="flex gap-1">
              <span className="size-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.3s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-purple-400 [animation-delay:-0.15s]" />
              <span className="size-1.5 animate-bounce rounded-full bg-purple-400" />
            </span>
          </span>
        ) : (
          <MarkdownContent content={message.content} className="text-sm" />
        )}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/settings/agent')({
  component: AgentPage,
});
