import { eq } from 'drizzle-orm';

import { db } from '@/core/db';
import { waitlist } from '@/config/db/schema';
import { getUuid } from '@/lib/hash';
import { getAllConfigs } from '@/modules/config/service';
import { ResendProvider } from '@/core/email/resend';
import { WaitlistConfirmEmail } from '@/core/email/templates/waitlist-confirm';
import { envConfigs } from '@/config';

/**
 * Subscribe an email to the waitlist.
 * - Returns { ok: true } on success.
 * - Returns { ok: true, duplicate: true } if already subscribed (idempotent).
 * - Fires confirmation email asynchronously (does not block the response).
 */
export async function subscribeToWaitlist(params: {
  email: string;
  locale?: string;
}): Promise<{ ok: boolean; duplicate?: boolean; error?: string }> {
  const email = params.email.trim().toLowerCase();
  if (!email) return { ok: false, error: 'Email is required' };

  // Basic format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { ok: false, error: 'Invalid email format' };
  }

  // Check for existing subscriber
  const [existing] = await db()
    .select()
    .from(waitlist)
    .where(eq(waitlist.email, email))
    .limit(1);

  if (existing) {
    return { ok: true, duplicate: true };
  }

  // Insert new subscriber
  await db().insert(waitlist).values({
    id: getUuid(),
    email,
    status: 'active',
    locale: params.locale || '',
  });

  // Send confirmation email (fire-and-forget)
  sendConfirmationEmail(email).catch((e) => {
    console.error('[waitlist] confirmation email failed:', e);
  });

  return { ok: true };
}

async function sendConfirmationEmail(email: string): Promise<void> {
  const all = await getAllConfigs();
  const apiKey = all.resend_api_key;
  const from = all.resend_sender_email;

  if (!apiKey || !from) {
    console.error(
      '[waitlist] Resend not configured (resend_api_key / resend_sender_email)'
    );
    return;
  }

  const appName = all.app_name || envConfigs.app_name;
  const provider = new ResendProvider({ apiKey, defaultFrom: from });

  const result = await provider.sendEmail({
    to: email,
    subject: `You're on the list! - ${appName}`,
    react: WaitlistConfirmEmail({ appName }),
  });

  if (!result.success) {
    console.error('[waitlist] confirmation email failed:', result.error);
  }
}
