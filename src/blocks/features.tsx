"use client";

import { m } from "@/paraglide/messages.js";
import { tDynamic } from "@/core/i18n/dynamic";
import {
  Wand2,
  Palette,
  Pencil,
  Globe,
  Layout,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const features: { key: string; icon: LucideIcon }[] = [
  { key: "auth", icon: Wand2 },
  { key: "payment", icon: Palette },
  { key: "rbac", icon: Pencil },
  { key: "i18n", icon: Globe },
  { key: "cms", icon: Layout },
  { key: "credits", icon: Zap },
];

const SHOWCASE_ITEMS = [
  {
    key: "touch",
    title: "Precision Editing",
    description: "Make targeted changes exactly where you need them. Every edit is precise and intentional.",
    gradient: "from-purple-600/20 to-indigo-600/20",
  },
  {
    key: "style",
    title: "Style Consistency",
    description: "Keep your visual signature consistent across iterations, formats, and projects.",
    gradient: "from-indigo-600/20 to-violet-600/20",
  },
  {
    key: "text",
    title: "Smart Typography",
    description: "Editable text layers let you refine copy without disturbing the composition.",
    gradient: "from-violet-600/20 to-pink-600/20",
  },
  {
    key: "insights",
    title: "Visual Insights",
    description: "AI-curated design references turned into clear creative direction for you.",
    gradient: "from-pink-600/20 to-purple-600/20",
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
                <h3 className="font-semibold text-foreground">{tDynamic(`landing.features.${key}.title`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {tDynamic(`landing.features.${key}.description`)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive showcase — like lovart.ai's feature demos */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Design, beyond generation
            </h3>
            <p className="mt-3 text-muted-foreground text-lg">
              AI output is just the starting point. You direct what comes next.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left: interactive tabs */}
            <div className="space-y-4">
              {SHOWCASE_ITEMS.map((item, index) => (
                <button
                  key={item.key}
                  onClick={() => setActiveShowcase(index)}
                  className={cn(
                    "w-full text-left rounded-xl p-5 transition-all border",
                    activeShowcase === index
                      ? "border-white/15 bg-white/[0.06] shadow-lg shadow-purple-500/5"
                      : "border-transparent hover:bg-white/[0.03] hover:border-white/10"
                  )}
                >
                  <h4 className="font-semibold text-foreground mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </button>
              ))}
            </div>

            {/* Right: visual demo */}
            <div className="relative aspect-[4/3] rounded-2xl border border-white/10 bg-white/[0.03] overflow-hidden">
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br transition-all duration-500",
                SHOWCASE_ITEMS[activeShowcase].gradient
              )} />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-3 p-8 w-full max-w-sm">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg border border-white/10 bg-white/[0.05] flex items-center justify-center"
                    >
                      <span className="text-muted-foreground/50 text-xs">Demo {i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
