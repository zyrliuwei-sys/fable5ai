import { SiteHeader } from "@/components/site-header";
import { m } from "@/paraglide/messages.js";

export function Header() {
  const navLinks = [
    { href: "/agent", label: m["landing.nav.agent"]() },
    { href: "/#features", label: m["landing.nav.features"]() },
    { href: "/pricing", label: m["landing.nav.pricing"]() },
  ];

  return <SiteHeader navLinks={navLinks} />;
}
