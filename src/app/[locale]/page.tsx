import { Link } from "@/core/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter, type FooterColumn } from "@/components/landing-footer";
import { PricingSection } from "./pricing-section";
import { cn } from "@/lib/utils";
import { envConfigs } from "@/config";

/**
 * Default landing page — manus.im-inspired minimal style.
 *
 * Replace or customize with:
 *   /quick-start <your product description>
 */
export default async function HomePage() {
  const t = await getTranslations("landing");

  const navLinks = [
    { href: "#features", label: t("nav.features") },
    { href: "#pricing", label: t("nav.pricing") },
  ];

  const capabilities = [
    t("chips.auth"),
    t("chips.payment"),
    t("chips.subscription"),
    t("chips.credits"),
    t("chips.rbac"),
    t("chips.i18n"),
    t("chips.cms"),
    t("chips.api_keys"),
  ];

  const features = [
    { title: t("features.auth.title"), description: t("features.auth.description") },
    { title: t("features.payment.title"), description: t("features.payment.description") },
    { title: t("features.rbac.title"), description: t("features.rbac.description") },
    { title: t("features.i18n.title"), description: t("features.i18n.description") },
    { title: t("features.cms.title"), description: t("features.cms.description") },
    { title: t("features.credits.title"), description: t("features.credits.description") },
  ];

  const footerColumns: FooterColumn[] = [
    {
      title: t("footer.product"),
      links: [
        { label: t("nav.features"), href: "#features" },
        { label: t("nav.pricing"), href: "#pricing" },
        { label: t("footer.dashboard"), href: "/dashboard" },
        { label: t("footer.admin"), href: "/admin" },
      ],
    },
    {
      title: t("footer.resources"),
      links: [
        { label: t("footer.docs"), href: "#", external: true },
        { label: t("footer.github"), href: "#", external: true },
      ],
    },
    {
      title: t("footer.legal"),
      links: [
        { label: t("footer.privacy"), href: "/privacy-policy" },
        { label: t("footer.terms"), href: "/terms-of-service" },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <LandingHeader navLinks={navLinks} />

      {/* Hero — manus-style: centered, conversational, action chips */}
      <section className="flex flex-col items-center justify-center px-4 pt-24 pb-16 sm:pt-36 sm:pb-24">
        <div className="max-w-3xl text-center space-y-8">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl leading-[1.1]">
            {t("hero.headline")}
          </h1>
          <p className="text-lg text-muted-foreground sm:text-xl max-w-xl mx-auto">
            {t("hero.subheadline")}
          </p>

          {/* Action chips */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {capabilities.map((cap) => (
              <span
                key={cap}
                className="inline-flex items-center rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-default"
              >
                {cap}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 rounded-full px-8")}
            >
              {t("hero.cta")}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features — clean grid, no icons, generous spacing */}
      <section id="features" className="px-4 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("features.title")}
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              {t("features.description")}
            </p>
          </div>
          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="space-y-2">
                <h3 className="font-medium">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing — clean, minimal */}
      <section id="pricing" className="px-4 py-20 sm:py-28 border-t border-border">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {t("pricing.title")}
            </h2>
            <p className="mt-4 text-muted-foreground">
              {t("pricing.description")}
            </p>
          </div>
          <PricingSection />
        </div>
      </section>

      <LandingFooter columns={footerColumns} />
    </div>
  );
}
