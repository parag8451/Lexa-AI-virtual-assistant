import { PRICING_FAQS } from "@/data/faq";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function FAQSection() {
  return (
    <section className="py-24 bg-background px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about billing, limits, and plans.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {PRICING_FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-border/30">
              <AccordionTrigger className="text-left text-lg font-medium hover:text-indigo-400 transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
