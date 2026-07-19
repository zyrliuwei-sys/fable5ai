"use client";

import { m } from "@/paraglide/messages.js";
import { tDynamic } from "@/core/i18n/dynamic";
import {
  MessageSquare,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Search,
  Brain,
  Wrench,
  Layers,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const features: { key: string; icon: LucideIcon }[] = [
  { key: "auth", icon: MessageSquare },
  { key: "payment", icon: FileText },
  { key: "rbac", icon: ImageIcon },
  { key: "i18n", icon: Video },
  { key: "cms", icon: Music },
  { key: "credits", icon: Search },
];

const SHOWCASE_ITEMS: { key: string; icon: LucideIcon; gradient: string }[] = [
  {
    key: "memory",
    icon: Brain,
    gradient: "from-purple-600/25 to-indigo-600/25",
  },
  {
    key: "tools",
    icon: Wrench,
    gradient: "from-indigo-600/25 to-violet-600/25",
  },
  {
    key: "multimodal",
    icon: Layers,
    gradient: "from-violet-600/25 to-pink-600/25",
  },
  {
    key: "fast",
    icon: Zap,
    gradient: "from-pink-600/25 to-purple-600/25",
  },
];

export function Features() {
  const [activeShowcase, setActiveShowcase] = useState(0);

  return (
    <section id="features" className="px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="text-center mb-20">
          <p className="text-sm font-medium text-purple-400 tracking-wide uppercase mb-4">
            Features
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {m["landing.features.title"]()}
          </h2>
          <p className="mt-5 text-muted-foreground max-w-lg mx-auto text-lg">
            {m["landing.features.description"]()}
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ key, icon: Icon }, index) => (
            <div
              key={key}
              className="group relative flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all hover:border-white/20 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-purple-500/5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 text-purple-300 transition-all group-hover:from-purple-500/30 group-hover:to-indigo-500/30">
                <Icon className="size-5" strokeWidth={1.75} />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">
                  {tDynamic(`landing.features.${key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tDynamic(`landing.features.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive showcase — agent reasoning capabilities */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
              {m["landing.features.showcase.title"]()}
            </h3>
            <p className="mt-3 text-muted-foreground text-lg">
              {m["landing.features.showcase.description"]()}
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: interactive tabs */}
            <div className="space-y-4">
              {SHOWCASE_ITEMS.map(({ key, icon: Icon }, index) => (
                <button
                  key={key}
                  onClick={() => setActiveShowcase(index)}
                  className={cn(
                    "w-full text-left rounded-xl p-5 transition-all border",
                    activeShowcase === index
                      ? "border-white/15 bg-white/[0.06] shadow-lg shadow-purple-500/5"
                      : "border-transparent hover:bg-white/[0.03] hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span
                      className={cn(
                        "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
                        activeShowcase === index
                          ? "bg-gradient-to-br from-purple-500/30 to-indigo-500/30 text-purple-200"
                          : "bg-white/5 text-muted-foreground"
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <h4 className="font-semibold text-foreground">
                      {tDynamic(`landing.features.showcase.${key}.title`)}
                    </h4>
                  </div>
                  <p className="text-sm text-muted-foreground pl-11">
                    {tDynamic(`landing.features.showcase.${key}.description`)}
                  </p>
                </button>
              ))}
            </div>

            {/* Right: visual demo */}
            <div className="relative aspect-[4/3] rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-br transition-all duration-500",
                  SHOWCASE_ITEMS[activeShowcase].gradient
                )}
              />
              <div className="absolute inset-0 flex items-center justify-center p-8">
                {(() => {
                  const Icon = SHOWCASE_ITEMS[activeShowcase].icon;
                  return (
                    <div className="flex flex-col items-center gap-4 text-center">
                      <div className="inline-flex size-20 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-purple-200 backdrop-blur-sm">
                        <Icon className="size-9" strokeWidth={1.5} />
                      </div>
                      <div className="space-y-2 w-full max-w-xs">
                        <div className="h-2.5 rounded-full bg-white/15" />
                        <div className="h-2.5 w-4/5 rounded-full bg-white/10" />
                        <div className="h-2.5 w-3/5 rounded-full bg-white/10" />
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
