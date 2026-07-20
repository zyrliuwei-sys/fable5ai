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
const DEFAULT_MODEL = 'gemini-3-5-flash-openai';
const MAX_PROMPT = 1000;
// Caller-supplied model ids must be plain identifiers — `model` is placed in
// the kie request URL path, so this blocks `/`, `..`, `?`, `#`, spaces, etc.
const SAFE_MODEL_RE = /^[A-Za-z0-9._-]+$/;

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

    // Accept either a single `prompt` string (hero) or a `messages` array
    // (multi-turn anonymous chat from /agent). Keep only valid text turns.
    const msgsInput: { role: string; content: string }[] = Array.isArray(body?.messages)
      ? body.messages
          .filter(
            (mm: any) =>
              mm &&
              (mm.role === 'user' || mm.role === 'assistant' || mm.role === 'system') &&
              typeof mm.content === 'string'
          )
          .map((mm: any) => ({ role: mm.role, content: mm.content.trim() }))
          .filter((mm: { content: string }) => mm.content)
      : [];
    const prompt = typeof body?.prompt === 'string' ? body.prompt.trim() : '';
    if (msgsInput.length === 0 && !prompt) return respErr('prompt is required');

    const totalLen =
      msgsInput.reduce((n, mm) => n + mm.content.length, 0) + prompt.length;
    if (totalLen > MAX_PROMPT * 6) return respErr('input too long');

    const apiKey = await getConfig('kie_api_key');
    if (!apiKey) {
      return respErr('Kie API key not configured. Add it in Admin → Settings → AI → Kie.');
    }
    // Caller may override the model (e.g. to test alternatives); else use config.
    // `model` is interpolated into the kie request URL path, so only accept a
    // plain model id — reject anything with `/`, `..`, `?`, `#`, or spaces to
    // prevent path manipulation / cost abuse on our kie key.
    const reqModel =
      typeof body?.model === 'string' ? body.model.trim() : '';
    const model =
      reqModel && SAFE_MODEL_RE.test(reqModel)
        ? reqModel
        : (await getConfig('kie_chat_model')) || DEFAULT_MODEL;

    const turns =
      msgsInput.length > 0 ? msgsInput : [{ role: 'user', content: prompt }];

    const resp = await fetch(`${KIE_BASE_URL}/${model}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        stream: false,
        include_thoughts: false,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...turns],
      }),
    });

    if (!resp.ok) {
      const detail = await resp.text().catch(() => '');
      return respErr(`Kie request failed (${resp.status}). ${detail.slice(0, 300)}`);
    }

    const data: any = await resp.json().catch(() => ({}));
    // kie returns HTTP 200 with a {code, msg} envelope on logical errors
    // (e.g. "The model is not supported"); surface those instead of an empty reply.
    const reply: string = data?.choices?.[0]?.message?.content ?? '';
    if (!reply) {
      const msg =
        data?.msg || data?.error?.message || `Kie returned an empty reply (HTTP ${resp.status})`;
      return respErr(`Kie: ${msg}`);
    }

    return respData({ reply });
  } catch (error: any) {
    return respErr(error?.message || 'Hero AI request failed');
  }
}

export const Route = createFileRoute('/api/hero/ai')({
  server: { handlers: { POST } },
});
