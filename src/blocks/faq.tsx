import { m } from "@/paraglide/messages.js";
import { tDynamic } from "@/core/i18n/dynamic";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_KEYS = ["stack", "payment", "database", "customize", "license"] as const;

export function FAQ() {
  return (
    <section id="faq" className="px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-purple-600 tracking-wide uppercase mb-4">
            FAQ
          </p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
            {m["landing.faq.title"]()}
          </h2>
          <p className="mt-5 text-muted-foreground text-lg">
            {m["landing.faq.description"]()}
          </p>
        </div>
        <Accordion className="w-full">
          {FAQ_KEYS.map((key) => (
            <AccordionItem key={key} value={key} className="border-border">
              <AccordionTrigger className="cursor-pointer py-6 text-left text-base font-medium hover:no-underline hover:text-purple-600">
                {tDynamic(`landing.faq.${key}.question`)}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-muted-foreground leading-relaxed">
                {tDynamic(`landing.faq.${key}.answer`)}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
