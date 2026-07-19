import { createFileRoute } from '@tanstack/react-router';
import { m } from "@/paraglide/messages.js";
import { tDynamic } from "@/core/i18n/dynamic";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { useSession } from "@/core/auth/client";
import { CreditCard, Key, TrendingUp, Activity, MessageSquare, Image as ImageIcon, Video, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "@/core/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Subscription = {
  status: string;
  planName?: string | null;
  productName?: string | null;
};

function DashboardPage() {
  const { data: session } = useSession();

  const { data: creditsData } = useQuery({
    queryKey: ["user-credits"],
    queryFn: () => apiGet<{ balance: number }>("/api/credits"),
  });
  const { data: apiKeysData } = useQuery({
    queryKey: ["user-apikeys"],
    queryFn: () => apiGet<unknown[]>("/api/apikeys"),
  });
  const { data: subscriptionData } = useQuery({
    queryKey: ["user-subscription-current"],
    queryFn: () =>
      apiGet<Subscription | null>("/api/user/subscriptions/current"),
  });

  const credits = creditsData?.balance ?? null;
  const apiKeys = apiKeysData?.length ?? null;
  const subscription = subscriptionData ?? null;

  const planLabel =
    subscription?.planName || subscription?.productName || m["settings.overview.plan_free"]();

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{m["settings.title"]()}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {m["settings.welcome"]({ name: session?.user?.name || session?.user?.email || "" })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{m["settings.overview.plan"]()}</CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{planLabel}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {m["settings.overview.plan_description"]()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{m["settings.credits.title"]()}</CardTitle>
            <CreditCard className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {m["settings.credits.description"]()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{m["settings.apikeys.title"]()}</CardTitle>
            <Key className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiKeys ?? "—"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {m["settings.overview.apikeys_description"]()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{m["settings.overview.usage"]()}</CardTitle>
            <Activity className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground mt-1">
              {m["settings.overview.usage_description"]()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions — funnel into the Fable5AI agent */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            key: "chat",
            icon: MessageSquare,
            tint: "bg-purple-500/10 text-purple-400",
            hover: "hover:border-purple-500/30",
          },
          {
            key: "image",
            icon: ImageIcon,
            tint: "bg-indigo-500/10 text-indigo-400",
            hover: "hover:border-indigo-500/30",
          },
          {
            key: "video",
            icon: Video,
            tint: "bg-violet-500/10 text-violet-400",
            hover: "hover:border-violet-500/30",
          },
        ].map(({ key, icon: Icon, tint, hover }) => (
          <Card key={key} className={`group ${hover} transition-colors`}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <div className={`inline-flex size-9 items-center justify-center rounded-lg ${tint}`}>
                  <Icon className="size-4" />
                </div>
                <CardTitle className="text-base">
                  {tDynamic(`settings.overview.action.${key}`)}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>
                {tDynamic(`settings.overview.action.${key}_desc`)}
              </CardDescription>
              <Link
                href="/settings/agent"
                className={cn(
                  buttonVariants({ size: "sm", variant: "outline" }),
                  "mt-4 w-full gap-1.5 border-white/10 bg-white/5 hover:bg-white/10"
                )}
              >
                {m["settings.overview.open_agent"]()}
                <ArrowRight className="size-3.5" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/settings/')({
  component: DashboardPage,
});
