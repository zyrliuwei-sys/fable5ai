import { Link } from "@/core/i18n/navigation";
import { m } from "@/paraglide/messages.js";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CTA() {
  return (
    <section className="px-4 pb-24 sm:pb-32">
      <div className="mx-auto max-w-5xl">
        <div className="relative rounded-3xl border border-purple-100 bg-gradient-to-br from-purple-50 via-background to-indigo-50 px-6 py-16 sm:px-10 sm:py-20 text-center overflow-hidden">
          {/* Background glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-purple-200/40 blur-[100px]" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm mb-6">
              <Sparkles className="size-3.5 text-purple-600" />
              <span className="text-muted-foreground">Start for free</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.1] max-w-3xl mx-auto">
              {m["landing.cta.headline"]()}
            </h2>
            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {m["landing.cta.subheadline"]()}
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/settings"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 rounded-full px-8 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-purple-500/25"
                )}
              >
                {m["landing.cta.button"]()}
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
