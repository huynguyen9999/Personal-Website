import FAQ2 from "@/components/ui/8bit-faq2";
import type { FAQItem } from "@/lib/faq";

export function HomeFaqSection({ items }: { items: FAQItem[] }) {
  return (
    <section
      className="home-faq ruled-section"
      aria-labelledby="home-faq-title"
    >
      <p className="section-index home-faq-index">FAQ</p>
      <FAQ2
        titleId="home-faq-title"
        title="Quick answers"
        description="Open a question when you want the longer version."
        items={items}
        className="home-faq-panel px-0 py-0"
      />
    </section>
  );
}
