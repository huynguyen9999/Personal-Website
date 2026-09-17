import type { Metadata } from "next";
import { getPublishedSection } from "@/lib/content";
import { SiteFooter } from "@/components/site-footer";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Huy Nguyen.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const opening = await getPublishedSection("contact-opening");

  return (
    <>
      <article className="quiet-page contact-page">
        <p className="eyebrow">{opening.eyebrow}</p>
        <h1>{opening.title}</h1>
        {opening.body ? <p className="quiet-intro">{opening.body}</p> : null}
        <nav className="contact-channels" aria-label="Contact links">
          <LiquidGlassButton asChild>
            <a href="mailto:dominichuyn@gmail.com">dominichuyn@gmail.com</a>
          </LiquidGlassButton>
          <LiquidGlassButton asChild>
            <a href="https://github.com/huynguyen9999" target="_blank" rel="noopener noreferrer">
              GitHub <span aria-hidden="true">↗</span>
            </a>
          </LiquidGlassButton>
          <LiquidGlassButton asChild>
            <a href="https://www.linkedin.com/in/huynguyen06" target="_blank" rel="noopener noreferrer">
              LinkedIn <span aria-hidden="true">↗</span>
            </a>
          </LiquidGlassButton>
        </nav>
      </article>
      <SiteFooter />
    </>
  );
}
