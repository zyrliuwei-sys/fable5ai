import { createFileRoute, redirect } from '@tanstack/react-router';

/**
 * Site root `/` redirects to the /agent console — mirroring chatlyai.app,
 * whose homepage is the agent app itself. The previous marketing landing is
 * preserved at `/home` (see src/routes/home.tsx) so its SEO copy and content
 * stay reachable.
 */
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/agent' });
  },
});
