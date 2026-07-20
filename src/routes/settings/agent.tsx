import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /settings/agent now redirects to the public /agent console — the
 * chatlyai.app/agent-style full-screen agent is the single home for the agent.
 * The settings dashboard nav item and "Open Agent" buttons still work; they
 * land here and bounce to /agent.
 */
export const Route = createFileRoute("/settings/agent")({
  beforeLoad: () => {
    throw redirect({ to: "/agent" });
  },
});
