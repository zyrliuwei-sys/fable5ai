import { createFileRoute } from '@tanstack/react-router';
import { eq, and, desc, asc } from 'drizzle-orm';
import { respData, respErr } from '@/lib/resp';
import { getAuth } from '@/core/auth';
import { db } from '@/core/db';
import { chat, chatMessage, type ChatMessage } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';
import { getConfig } from '@/modules/config/service';
import { getBalance, consume } from '@/modules/credits/service';

/**
 * Fable5AI agent chat endpoint.
 *
 * - GET    loads the user's latest active conversation.
 * - POST   appends a user turn, calls an OpenAI-compatible completions
 *          API (configured in Admin → Settings → AI), appends the reply,
 *          and consumes 1 credit on success. When no key is set it still
 *          persists the user turn and returns `{ configured: false }`.
 * - DELETE archives the current conversation so "Clear" is permanent.
 *
 * Provider/model come from admin config (`openai_*`). The API key is
 * never returned to the client.
 */

type ClientMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const SYSTEM_PROMPT =
  'You are Fable5AI, an all-in-one AI agent. You help people write, research, design, and create — including documents, slides, images, videos, and music. Be concise, friendly, and practical. When a request needs another modality you cannot produce as text, briefly explain the plan and guide the user. Reply in the user\'s language. Use Markdown for formatting.';

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const PROVIDER = 'openai';
const COST_PER_MESSAGE = 1;

async function getSessionUser(request: Request) {
  const auth = getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  return session?.user;
}

/** GET — latest active chat + its messages (oldest first). */
async function GET({ request }: { request: Request }) {
  try {
    const user = await getSessionUser(request);
    if (!user) return respErr('Unauthorized');

    const [latest] = await db()
      .select()
      .from(chat)
      .where(and(eq(chat.userId, user.id), eq(chat.status, 'active')))
      .orderBy(desc(chat.updatedAt))
      .limit(1);

    if (!latest) return respData({ chatId: null, messages: [] });

    const rows = await db()
      .select()
      .from(chatMessage)
      .where(eq(chatMessage.chatId, latest.id))
      .orderBy(asc(chatMessage.createdAt));

    const messages = rows
      .filter((m: ChatMessage) => m.role === 'user' || m.role === 'assistant')
      .map((m: ChatMessage) => ({
        role: m.role as 'user' | 'assistant',
        content: m.parts,
      }));

    return respData({ chatId: latest.id, messages });
  } catch (error: any) {
    return respErr(error?.message || 'Failed to load conversation');
  }
}

/** POST — append user turn, generate reply, persist both. */
async function POST({ request }: { request: Request }) {
  try {
    const user = await getSessionUser(request);
    if (!user) return respErr('Unauthorized');

    const body = await request.json().catch(() => null);
    const messages: ClientMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    // Bound context to the most recent ~20 turns.
    const trimmed = messages.slice(-20);
    const lastUser = [...trimmed]
      .reverse()
      .find((m) => m.role === 'user' && m.content?.trim());
    if (!lastUser) return respErr('messages is required');

    const apiKey = await getConfig('openai_api_key');
    const model = (await getConfig('openai_model')) || DEFAULT_MODEL;
    const baseUrl = (await getConfig('openai_base_url')) || DEFAULT_BASE_URL;

    // Resolve or create the conversation (verify ownership if provided).
    let chatId: string = typeof body?.chatId === 'string' ? body.chatId : '';
    if (chatId) {
      const [owned] = await db()
        .select()
        .from(chat)
        .where(and(eq(chat.id, chatId), eq(chat.userId, user.id)))
        .limit(1);
      if (!owned) chatId = '';
    }
    if (!chatId) {
      chatId = getUuid();
      await db().insert(chat).values({
        id: chatId,
        userId: user.id,
        status: 'active',
        model,
        provider: PROVIDER,
        title: lastUser.content.slice(0, 60),
        parts: lastUser.content,
      });
    }

    // Always persist the user turn (even if no provider is configured yet).
    await db().insert(chatMessage).values({
      id: getUuid(),
      userId: user.id,
      chatId,
      status: 'active',
      role: 'user',
      parts: lastUser.content,
      model,
      provider: PROVIDER,
    });

    if (!apiKey) {
      return respData({ reply: '', configured: false, chatId });
    }

    // Gate on credits.
    const balance = await getBalance(user.id);
    if (balance < COST_PER_MESSAGE) {
      return respErr(
        'Insufficient credits. Upgrade your plan to keep chatting with Fable5AI.'
      );
    }

    const resp = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...trimmed],
      }),
    });

    if (!resp.ok) {
      return respErr(`AI provider error (${resp.status}). Check your AI settings.`);
    }

    const data = await resp.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? '';

    // Consume only after a successful reply.
    await consume({
      userId: user.id,
      credits: COST_PER_MESSAGE,
      scene: 'agent_chat',
      description: 'Fable5AI agent message',
    });

    // Persist the assistant turn.
    await db().insert(chatMessage).values({
      id: getUuid(),
      userId: user.id,
      chatId,
      status: 'active',
      role: 'assistant',
      parts: reply,
      model,
      provider: PROVIDER,
    });
    await db()
      .update(chat)
      .set({ updatedAt: new Date() })
      .where(eq(chat.id, chatId));

    return respData({ reply, configured: true, chatId });
  } catch (error: any) {
    return respErr(error?.message || 'Agent request failed');
  }
}

/** DELETE — archive the current conversation (Clear). */
async function DELETE({ request }: { request: Request }) {
  try {
    const user = await getSessionUser(request);
    if (!user) return respErr('Unauthorized');

    const url = new URL(request.url);
    const chatId = url.searchParams.get('chatId');
    if (chatId) {
      await db()
        .update(chat)
        .set({ status: 'archived' })
        .where(and(eq(chat.id, chatId), eq(chat.userId, user.id)));
    } else {
      // No id → archive all of the user's active chats.
      await db()
        .update(chat)
        .set({ status: 'archived' })
        .where(and(eq(chat.userId, user.id), eq(chat.status, 'active')));
    }
    return respData({ ok: true });
  } catch (error: any) {
    return respErr(error?.message || 'Failed to clear conversation');
  }
}

export const Route = createFileRoute('/api/agent/chat')({
  server: {
    handlers: { GET, POST, DELETE },
  },
});
