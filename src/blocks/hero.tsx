"use client";

import { Link } from "@/core/i18n/navigation";
import { m } from "@/paraglide/messages.js";
import { useState } from "react";
import { ArrowRight, Sparkles, Wand2, ImagePlus, Layers } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { envConfigs } from "@/config";

const SHOWCASE_TABS = [
  { key: "product", icon: ImagePlus, label: "Product Design" },
  { key: "brand", icon: Layers, label: "Brand Campaign" },
  { key: "social", icon: Wand2, label: "Social Content" },
];

export function Hero() {
  const [activeTab, setActiveTab] = useState("product");

  return (
    <section className="relative isolate flex flex-col items-center justify-center overflow-hidden px-4 pt-28 pb-16 sm:pt-36 sm:pb-24">
      {/* Animated gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="animate-drift-a absolute -top-1/4 left-1/4 h-[600px] w-[600px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="animate-drift-b absolute -bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/15 blur-[100px]" />
        <div className="animate-drift-c absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400/10 blur-[80px]" />
      </div>

      <div className="relative z-10 max-w-5xl w-full">
        {/* Top badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
            <Sparkles className="size-4 text-purple-400" />
            <span className="text-muted-foreground">{envConfigs.app_name}</span>
            <span className="text-purple-400 font-medium">AI Design</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center font-sans text-4xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
          <span className="text-foreground">{m["landing.hero.headline"]()}</span>
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-center text-lg text-muted-foreground sm:text-xl max-w-2xl mx-auto leading-relaxed">
          {m["landing.hero.subheadline"]()}
        </p>

        {/* CTA buttons */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <Link
            href="/settings"
            className={cn(
              buttonVariants({ size: "lg" }),
              "gap-2 rounded-full px-8 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-purple-500/25"
            )}
          >
            {m["landing.hero.cta"]()}
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/pricing"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "rounded-full px-8 h-12 border-white/10 bg-white/5 hover:bg-white/10 text-foreground"
            )}
          >
            {m["landing.hero.secondary"]()}
          </Link>
        </div>

        {/* Interactive showcase */}
        <div className="mt-16 sm:mt-20">
          {/* Tab bar */}
          <div className="flex justify-center gap-2 mb-6">
            {SHOWCASE_TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-all",
                    activeTab === tab.key
                      ? "bg-white/10 text-foreground border border-white/20 shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                  )}
                >
                  <Icon className="size-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Showcase content area */}
          <div className="relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
            {/* Fake toolbar */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/60" />
                <div className="size-3 rounded-full bg-yellow-500/60" />
                <div className="size-3 rounded-full bg-green-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="rounded-md bg-white/5 px-4 py-1 text-xs text-muted-foreground">
                  fable5.ai/studio
                </div>
              </div>
            </div>

            {/* Showcase images */}
            <div className="relative aspect-[16/9] w-full overflow-hidden">
              {activeTab === "product" && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-900/30 via-background to-indigo-900/20">
                  <div className="grid grid-cols-3 gap-4 p-8 w-full max-w-3xl">
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-white/10 flex items-center justify-center">
                      <ImagePlus className="size-12 text-purple-300/60" />
                    </div>
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-violet-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
                      <Wand2 className="size-12 text-violet-300/60" />
                    </div>
                    <div className="aspect-square rounded-xl bg-gradient-to-br from-indigo-500/30 to-blue-500/30 border border-white/10 flex items-center justify-center">
                      <Layers className="size-12 text-indigo-300/60" />
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "brand" && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-900/30 via-background to-violet-900/20">
                  <div className="grid grid-cols-2 gap-4 p-8 w-full max-w-2xl">
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Brand Kit</span>
                    </div>
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Campaign</span>
                    </div>
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-white/10 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Packaging</span>
                    </div>
                    <div className="aspect-video rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Social Assets</span>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "social" && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-900/30 via-background to-purple-900/20">
                  <div className="flex gap-4 p-8 items-end">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-white/10 flex items-center justify-center"
                        style={{
                          width: `${160 + i * 20}px`,
                          height: `${200 + (i % 2) * 60}px`,
                          background: `linear-gradient(135deg, rgba(139,92,246,${0.1 + i * 0.05}), rgba(99,102,241,${0.1 + i * 0.05}))`,
                        }}
                      >
                        <span className="text-muted-foreground text-xs">Post {i}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
