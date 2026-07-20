import { useEffect } from "react";
import { Plus, X, Lock, ArrowRight } from "lucide-react";
import { m } from "@/paraglide/messages.js";
import { tDynamic } from "@/core/i18n/dynamic";
import { useSession } from "@/core/auth/client";
import { Link } from "@/core/i18n/navigation";
import { cn } from "@/lib/utils";
import { envConfigs } from "@/config";
import { CAPABILITIES, type CapabilityId } from "./capabilities";

/**
 * Agent sidebar — overlay drawer (closed by default), cloned from
 * chatlyai.app/agent. Contains New Chat, the capability list (selecting a
 * mode updates the composer + closes the drawer), and a login CTA when the
 * user is signed out.
 */
export function AgentSidebar({
  open,
  onClose,
  mode,
  onSelectMode,
  onNewChat,
}: {
  open: boolean;
  onClose: () => void;
  mode: CapabilityId;
  onSelectMode: (id: CapabilityId) => void;
  onNewChat: () => void;
}) {
  const { data: session } = useSession();
  const user = session?.user;

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      aria-hidden={!open}
      className={cn(
        "fixed inset-0 z-50 transition-opacity duration-200",
        open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-label="Sidebar"
        className={cn(
          "absolute left-0 top-0 flex h-dvh w-[300px] max-w-[86vw] flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-xl transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex h-12 items-center justify-between px-4">
          <span className="text-sm font-medium">{envConfigs.app_name}</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="flex size-8 items-center justify-center rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* New chat */}
        <div className="px-3">
          <button
            type="button"
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent"
          >
            <Plus className="size-4" />
            {m["agent.new_chat"]()}
          </button>
        </div>

        {/* Capability list */}
        <div className="mt-2 flex-1 overflow-y-auto px-3 pb-4">
          <div className="px-3 pb-1 pt-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {m["agent.sidebar.tools"]()}
          </div>
          <nav className="space-y-0.5">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              const active = cap.id === mode;
              return (
                <button
                  key={cap.id}
                  type="button"
                  onClick={() => {
                    onSelectMode(cap.id);
                    onClose();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" strokeWidth={1.75} />
                  {tDynamic(cap.labelKey)}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer: login CTA when signed out, else nothing */}
        {!user && (
          <div className="border-t border-sidebar-border p-3">
            <div className="rounded-xl bg-sidebar-accent p-3.5">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lock className="size-4" />
                {m["agent.sidebar.unlock_title"]()}
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {m["agent.sidebar.unlock_desc"]()}
              </p>
              <Link
                href="/sign-in?callbackUrl=/agent"
                className="mt-3 flex items-center justify-center gap-1.5 rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                {m["agent.login"]()}
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
