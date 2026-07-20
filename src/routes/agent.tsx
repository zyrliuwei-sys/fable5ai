import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { m } from "@/paraglide/messages.js";
import { getLocale, locales, localizeUrl } from "@/paraglide/runtime.js";
import { envConfigs } from "@/config";
import { AgentNavbar } from "@/components/agent/agent-navbar";
import { AgentSidebar } from "@/components/agent/agent-sidebar";
import { AgentConsole } from "@/components/agent/agent-console";
import { AgentSeo, AGENT_FAQ_KEYS } from "@/components/agent/agent-seo";
import { DEFAULT_CAPABILITY, type CapabilityId } from "@/components/agent/capabilities";

/**
 * Public /agent route — Fable5AI's all-in-one AI agent console.
 * UI/interaction cloned from chatlyai.app/agent (OmniAgent), light theme,
 * branded Fable5AI. The console is viewable by everyone; sending a message
 * requires a session (the composer redirects to /sign-in otherwise).
 *
 * SEO copy is fable5ai's own (agent.meta.*); the marketing landing at "/" is
 * intentionally left untouched.
 */
function AgentPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mode, setMode] = useState<CapabilityId>(DEFAULT_CAPABILITY);
  const [newChatNonce, setNewChatNonce] = useState(0);

  return (
    <div className="agent-app flex min-h-dvh flex-col bg-background text-foreground">
      {/* Console fills the first viewport as the hero; SEO content scrolls in
          below it so the chat UX is unchanged while the page carries real
          crawlable, server-rendered text. */}
      <div className="flex h-dvh flex-col">
        <AgentNavbar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-hidden">
          <AgentConsole
            mode={mode}
            onSelectMode={setMode}
            newChatNonce={newChatNonce}
          />
        </main>
      </div>
      <AgentSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        mode={mode}
        onSelectMode={setMode}
        onNewChat={() => setNewChatNonce((n) => n + 1)}
      />
      <AgentSeo />
    </div>
  );
}

export const Route = createFileRoute("/agent")({
  loader: () => ({ locale: getLocale() }),
  head: ({ loaderData }) => {
    const locale = loaderData?.locale ?? "en";
    const loc = locale as any;

    const appUrl =
      (typeof window !== "undefined" && window.location?.origin) ||
      envConfigs.app_url ||
      "";
    const canonicalUrl = localizeUrl(`${appUrl}/agent`, { locale: loc }).href;
    const title = m["agent.meta.title"]({}, { locale: loc });
    const description = m["agent.meta.description"]({}, { locale: loc });
    const ogImage = `${appUrl}/og-image.png`;
    const urlFor = (l: string) =>
      localizeUrl(`${appUrl}/agent`, { locale: l as any }).href;

    // JSON-LD structured data — Organization + WebSite + SoftwareApplication
    // + FAQPage (mirrors the FAQ rendered in <AgentSeo/> via AGENT_FAQ_KEYS).
    const faqEntities = AGENT_FAQ_KEYS.map((k) => ({
      "@type": "Question",
      name: m[`agent.faq.${k}.q`]({}, { locale: loc }),
      acceptedAnswer: {
        "@type": "Answer",
        text: m[`agent.faq.${k}.a`]({}, { locale: loc }),
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
          url: canonicalUrl,
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
        { name: "description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: envConfigs.app_name },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonicalUrl },
        { property: "og:image", content: ogImage },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:locale", content: locale.replace("-", "_") },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: ogImage },
        { "script:ld+json": jsonLd },
      ],
      links: [
        { rel: "canonical", href: canonicalUrl },
        ...locales.map((loc2) => ({
          rel: "alternate",
          hrefLang: loc2,
          href: urlFor(loc2),
        })),
        { rel: "alternate", hrefLang: "x-default", href: urlFor("en") },
      ],
    };
  },
  component: AgentPage,
});
