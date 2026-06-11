import { createFileRoute } from '@tanstack/react-router';
import { m } from "@/paraglide/messages.js";
import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api-client";
import { useSession } from "@/core/auth/client";
import { CreditCard, Key, TrendingUp, Activity, Sparkles, ImageIcon, Palette } from "lucide-react";
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

      {/* Quick actions for AI Design Tool */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="group hover:border-purple-500/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                <Sparkles className="size-4" />
              </div>
              <CardTitle className="text-base">Text to Image</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>Generate stunning visuals from text prompts using AI.</CardDescription>
            <Link
              href="/settings"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "mt-4 w-full border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              Coming Soon
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:border-indigo-500/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Palette className="size-4" />
              </div>
              <CardTitle className="text-base">Style Transfer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>Apply artistic styles to your images with one click.</CardDescription>
            <Link
              href="/settings"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "mt-4 w-full border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              Coming Soon
            </Link>
          </CardContent>
        </Card>

        <Card className="group hover:border-violet-500/30 transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="inline-flex size-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                <ImageIcon className="size-4" />
              </div>
              <CardTitle className="text-base">Batch Generate</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>Create multiple design variations in one go.</CardDescription>
            <Link
              href="/settings"
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "mt-4 w-full border-white/10 bg-white/5 hover:bg-white/10"
              )}
            >
              Coming Soon
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/settings/')({
  component: DashboardPage,
});
