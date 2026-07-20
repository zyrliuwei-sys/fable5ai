import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * `/home` is a legacy alias for the marketing landing, which now lives at the
 * site root `/` (see src/routes/index.tsx). Keep this redirect so existing
 * inbound links resolve and we don't ship a duplicate-canonical landing.
 */
export const Route = createFileRoute('/home')({
  beforeLoad: () => {
    throw redirect({ to: '/' });
  },
});
