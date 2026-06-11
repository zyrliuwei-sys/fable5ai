import { createFileRoute } from '@tanstack/react-router';
import { respData, respErr } from '@/lib/resp';
import { subscribeToWaitlist } from '@/modules/waitlist/service';
import { enforceMinIntervalRateLimit } from '@/lib/rate-limit';

async function POST({ request }: { request: Request }) {
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 2000,
    keyPrefix: 'waitlist-subscribe',
  });
  if (limited) return limited;

  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body?.email || '').trim();
    const locale = String(body?.locale || '').trim();

    if (!email) return respErr('Email is required');

    const result = await subscribeToWaitlist({ email, locale });

    if (!result.ok) {
      return respErr(result.error || 'Subscription failed');
    }

    return respData({ subscribed: true, duplicate: result.duplicate || false });
  } catch (e: any) {
    console.log('waitlist subscribe failed:', e);
    return respErr(e?.message || 'Subscription failed');
  }
}

export const Route = createFileRoute('/api/waitlist/subscribe')({
  server: {
    handlers: { POST },
  },
});
