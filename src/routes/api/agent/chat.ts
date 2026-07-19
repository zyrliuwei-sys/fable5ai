import { createFileRoute } from '@tanstack/react-router';
import { respData, respErr } from '@/lib/resp';
import { getAuth } from '@/core/auth';
import { getConfig } from '@/modules/config/service';
import { getBalance, consume } from '@/modules/credits/service';

/**
 * Fable5AI agent chat endpoint.
 *
 * Proxies an OpenAI-compatible chat completions API (configured in
 * Admin → Settings → AI). When no provider key is set it returns
 * `{ configured: false }` so the UI can show a friendly setup hint
 * instead of an opaque error. Each successful reply consumes 1 credit.
 */

type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

const SYSTEM_PROMPT =
  'You are Fable5AI, an all-in-one AI agent. You help people write, research, design, and create — including documents, slides, images, videos, and music. Be concise, friendly, and practical. When a request needs another modality you cannot produce as text, briefly explain the plan and guide the user. Reply in the user\'s language.';

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const COST_PER_MESSAGE = 1;

async function POST({ request }: { request: Request }) {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user) return respErr('Unauthorized');

    const body = await request.json().catch(() => null);
    const messages: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
      : [];

    // Keep only the most recent ~20 turns to bound cost/context.
    const trimmed = messages.slice(-20);
    const lastUser = [...trimmed]
      .reverse()
      .find((m) => m.role === 'user' && m.content?.trim());
    if (!lastUser) return respErr('messages is required');

    const apiKey = await getConfig('openai_api_key');
    if (!apiKey) {
      // Surface a structured "not configured yet" state for the UI.
      return respData({ reply: '', configured: false });
    }

    // Gate on credits — show a clear upgrade prompt when empty.
    const balance = await getBalance(session.user.id);
    if (balance < COST_PER_MESSAGE) {
      return respErr(
        'Insufficient credits. Upgrade your plan to keep chatting with Fable5AI.'
      );
    }

    const baseUrl =
      (await getConfig('openai_base_url')) || DEFAULT_BASE_URL;
    const model = (await getConfig('openai_model')) || DEFAULT_MODEL;

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
      // Don't leak provider details; the admin can check keys in settings.
      return respErr(`AI provider error (${resp.status}). Check your AI settings.`);
    }

    const data = await resp.json();
    const reply: string = data?.choices?.[0]?.message?.content ?? '';

    // Consume only after a successful reply.
    await consume({
      userId: session.user.id,
      credits: COST_PER_MESSAGE,
      scene: 'agent_chat',
      description: 'Fable5AI agent message',
    });

    return respData({ reply, configured: true });
  } catch (error: any) {
    return respErr(error?.message || 'Agent request failed');
  }
}

export const Route = createFileRoute('/api/agent/chat')({
  server: {
    handlers: { POST },
  },
});
