import { m } from "@/paraglide/messages.js";
import { tDynamic } from "@/core/i18n/dynamic";

/**
 * Server-rendered SEO content for the public /agent route.
 *
 * The agent console above is intentionally minimal (a chat surface), so the
 * page historically carried almost no crawlable text — which hurt topical
 * focus and word count. This block renders ~1.3k words of natural,
 * keyword-focused copy below the console: it is plain static JSX, so TanStack
 * Start's SSR emits it straight into the HTML (no client-only rendering).
 *
 * Reads i18n via `m['agent.seo.*']()` (static keys) and `tDynamic` (iterated
 * lists). FAQ keys are exported so the route's head() can mirror them into a
 * FAQPage JSON-LD graph — keep the two in sync.
 */

// Mirrored into JSON-LD FAQPage in src/routes/agent.tsx — keep in sync.
export const AGENT_FAQ_KEYS = [
  "what",
  "free",
  "create",
  "install",
  "languages",
  "privacy",
] as const;

const FEATURES = [
  "docs",
  "image",
  "slides",
  "video",
  "music",
  "research",
  "graphs",
] as const;

const STEPS = ["1", "2", "3"] as const;

const WHYS = ["tool", "context", "iterate"] as const;

export function AgentSeo() {
  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:py-20">
        {/* Intro */}
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {m["agent.seo.intro.heading"]()}
          </h2>
          <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
            {m["agent.seo.intro.p1"]()}
          </p>
          <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
            {m["agent.seo.intro.p2"]()}
          </p>
        </div>

        {/* One conversation */}
        <div className="mt-14 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {m["agent.seo.one.heading"]()}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
            {m["agent.seo.one.body"]()}
          </p>
        </div>

        {/* What you can create */}
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {m["agent.seo.create.heading"]()}
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-muted-foreground">
            {m["agent.seo.create.intro"]()}
          </p>
          <div className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {FEATURES.map((id) => (
              <div key={id}>
                <h3 className="text-base font-medium text-foreground">
                  {tDynamic(`agent.seo.create.${id}.h`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tDynamic(`agent.seo.create.${id}.p`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* How it works */}
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {m["agent.seo.how.heading"]()}
          </h2>
          <ol className="mt-6 space-y-6">
            {STEPS.map((n) => (
              <li key={n} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {n}
                </span>
                <div>
                  <h3 className="text-base font-medium text-foreground">
                    {tDynamic(`agent.seo.how.${n}.title`)}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {tDynamic(`agent.seo.how.${n}.desc`)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* Why */}
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {m["agent.seo.why.heading"]()}
          </h2>
          <div className="mt-6 grid gap-x-10 gap-y-8 sm:grid-cols-3">
            {WHYS.map((id) => (
              <div key={id}>
                <h3 className="text-base font-medium text-foreground">
                  {tDynamic(`agent.seo.why.${id}.h`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tDynamic(`agent.seo.why.${id}.p`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-14">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {m["agent.seo.faq.heading"]()}
          </h2>
          <div className="mt-6 divide-y divide-border border-y border-border">
            {AGENT_FAQ_KEYS.map((k) => (
              <div key={k} className="py-5">
                <h3 className="text-[15px] font-medium text-foreground">
                  {tDynamic(`agent.faq.${k}.q`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {tDynamic(`agent.faq.${k}.a`)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-14 max-w-2xl">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            {m["agent.seo.cta.heading"]()}
          </h2>
          <p className="mt-3 text-[15px] leading-7 text-muted-foreground">
            {m["agent.seo.cta.body"]()}
          </p>
        </div>
      </div>
    </section>
  );
}
