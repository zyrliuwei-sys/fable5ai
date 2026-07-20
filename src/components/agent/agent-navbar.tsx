import { Menu } from "lucide-react";
import { m } from "@/paraglide/messages.js";
import { envConfigs } from "@/config";
import { useSession } from "@/core/auth/client";
import { Link } from "@/core/i18n/navigation";
import { cn } from "@/lib/utils";
import { SiteUserMenu } from "@/components/site-user-menu";

/**
 * Agent top navbar — cloned from chatlyai.app/agent.
 * Sticky 48px bar: [sidebar toggle] [Fable5AI brand] …… [Login | user menu].
 * Light themed via the scoped `.agent-app` tokens.
 */
export function AgentNavbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <nav className="sticky top-0 z-40 flex h-[var(--navbar-height)] items-center justify-between border-b border-border bg-background px-4 sm:px-5">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Toggle sidebar"
          className="flex size-9 items-center justify-center rounded-[10px] text-foreground transition-colors hover:bg-accent active:bg-accent"
        >
          <Menu className="size-5" strokeWidth={1.75} />
        </button>
        <Link
          href="/agent"
          className="flex items-center gap-2 rounded-[10px] px-2 py-1 transition-colors hover:bg-accent"
        >
          <img
            src={envConfigs.app_logo || "/logo.svg"}
            alt={envConfigs.app_name}
            width={24}
            height={24}
            className="size-6 rounded-md"
          />
          <span className="text-[15px] font-medium tracking-tight text-foreground">
            {envConfigs.app_name}
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <SiteUserMenu
            name={user.name || "User"}
            email={user.email}
            image={user.image}
          />
        ) : (
          <Link
            href="/sign-in?callbackUrl=/agent"
            className={cn(
              "flex h-8 items-center rounded-full bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            )}
          >
            {m["agent.login"]()}
          </Link>
        )}
      </div>
    </nav>
  );
}
