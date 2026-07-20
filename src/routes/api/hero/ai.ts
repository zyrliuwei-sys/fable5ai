import { createFileRoute } from '@tanstack/react-router';
import { respData, respErr } from '@/lib/resp';
import { getConfig } from '@/modules/config/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';

/**
 * Hero demo endpoint — lets landing-page visitors try the agent live.
 *
 * Calls kie.ai's OpenAI-compatible Chat Completions API using the `kie_api_key`
 * + `kie_chat_model` configured in Admin → Settings → AI → Kie. Public but
 * rate-limited per IP (one call every few seconds) to bound abuse on a
 * publicly callable, credit-consuming endpoint.
 *
 * @docs https://kie.ai/gemini-3-flash
 */

// kie.ai chat completions: the model is in the URL path, e.g.
//   POST https://api.kie.ai/<model>/v1/chat/completions
// (NOT the /api/v1/* task endpoints used for image/video/music).
// `stream` defaults to true (SSE) on kie — we force false for a plain JSON reply.
const KIE_BASE_URL = 'https://api.kie.ai';
const DEFAULT_MODEL = 'gemini-3-flash';
const MAX_PROMPT = 1000;

const SYSTEM_PROMPT =
  "You are Fable5, a friendly all-in-one AI assistant giving a live demo on a marketing landing page. Keep replies short (2-4 sentences), energetic, and practical. Offer to go deeper (open the full agent) when useful. Reply in the user's language. Light Markdown only.";

async function POST({ request }: { request: Request }) {
  // Bound abuse: one call per 3s per IP+cookie.
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 3000,
    keyPrefix: 'hero-ai',
  });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => null);
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    if (!prompt) return respErr('prompt is required');
    if (prompt.length > MAX_PROMPT) return respErr('prompt too long');

    const apiKey = await getConfig('kie_api_key');
    if (!apiKey) {
      return respErr('Kie API key not configured. Add it in Admin → Settings → AI → Kie.');
    }
    const model = (await getConfig('kie_chat_model')) || DEFAULT_MODEL;

    const resp = await fetch(`${KIE_BASE_URL}/${model}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        stream: false,
        include_thoughts: false,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      return respErr(`Kie request failed (${resp.status}). ${detail.slice(0, 300)}`);
    }

    const data: any = await resp.json().catch(() => ({}));
    const reply: string = data?.choices?.[0]?.message?.content ?? '';

    return respData({ reply });
  } catch (error: any) {
    return respErr(error?.message || 'Hero AI request failed');
  }
}

export const Route = createFileRoute('/api/hero/ai')({
  server: { handlers: { POST } },
});
