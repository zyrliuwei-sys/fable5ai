import { createFileRoute } from '@tanstack/react-router';
import { Header } from "@/blocks/header";
import { Hero } from "@/blocks/hero";
import { Features } from "@/blocks/features";
import { Pricing } from "@/blocks/pricing";
import { FAQ } from "@/blocks/faq";
import { CTA } from "@/blocks/cta";
import { Footer } from "@/blocks/footer";
import { SupportWidget } from "@/blocks/support-widget";
import { envConfigs } from "@/config";
import { m } from "@/paraglide/messages.js";
import { getLocale, locales, localizeUrl } from "@/paraglide/runtime.js";

/**
 * Fable5AI marketing landing — the site homepage (the "hero page").
 *
 * The full AI agent chat lives on its own page at `/agent` (opened from the
 * header "Agent" link); closing the chat returns here. This keeps the chat as a
 * standalone destination while the homepage stays the marketing surface with
 * its SEO copy, structured data, and the live hero console.
 *
 * Layout references the chat-console + capability-pills pattern of
 * chatlyai.app/agent (OmniAgent), on the existing dark premium theme.
 */
function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
}

// FAQ keys mirrored in src/blocks/faq.tsx — keep in sync.
const FAQ_KEYS = ["stack", "payment", "database", "customize", "license"] as const;

export const Route = createFileRoute('/')({
  loader: async () => {
    const locale = getLocale();
    return { locale };
  },
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? 'en';
    const loc = locale as any;

    // Prefer the live origin on the client so canonical/OG never fall back to
    // the localhost dev default when VITE_APP_URL wasn't inlined into the
    // client bundle. The server uses the configured app_url.
    const appUrl =
      (typeof window !== 'undefined' && window.location?.origin) ||
      envConfigs.app_url ||
      '';
    const canonicalUrl = localizeUrl(appUrl || '/', { locale: loc }).href;

    const title = m['landing.meta.title']({}, { locale: loc });
    const description = m['landing.meta.description']({}, { locale: loc });
    const ogImage = `${appUrl}/og-image.png`;

    const urlFor = (l: string) =>
      localizeUrl(appUrl || '/', { locale: l as any }).href;

    // JSON-LD structured data — helps rich results (software listing + FAQ).
    const faqEntities = FAQ_KEYS.map((k) => ({
      "@type": "Question",
      name: m[`landing.faq.${k}.question`]({}, { locale: loc }),
      acceptedAnswer: {
        "@type": "Answer",
        text: m[`landing.faq.${k}.answer`]({}, { locale: loc }),
      },
    }));

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${appUrl}/#organization`,
          name: "Fable5AI",
          alternateName: "Fable5",
          url: appUrl,
          logo: `${appUrl}/logo.svg`,
        },
        {
          "@type": "WebSite",
          "@id": `${appUrl}/#website`,
          url: appUrl,
          name: "Fable5AI",
          alternateName: "Fable5",
          description,
          inLanguage: locale,
          publisher: { "@id": `${appUrl}/#organization` },
        },
        {
          "@type": "SoftwareApplication",
          name: "Fable5AI",
          alternateName: "Fable5",
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          url: appUrl,
          description,
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
          },
        },
        {
          "@type": "FAQPage",
          mainEntity: faqEntities,
        },
      ],
    };

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Fable5AI' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:image', content: ogImage },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:locale', content: locale.replace('-', '_') },
        // Twitter / X
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: ogImage },
        // Structured data
        { "script:ld+json": jsonLd },
      ],
      links: [
        { rel: 'canonical', href: canonicalUrl },
        ...locales.map((loc2) => ({
          rel: 'alternate',
          hrefLang: loc2,
          href: urlFor(loc2),
        })),
        { rel: 'alternate', hrefLang: 'x-default', href: urlFor('en') },
      ],
    };
  },
  component: HomePage,
});
