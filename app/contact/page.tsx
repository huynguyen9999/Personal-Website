import Image from "next/image";
import type { Metadata } from "next";
import { Github, Linkedin, Mail } from "lucide-react";
import { getPublishedSection } from "@/lib/content";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach Huy Nguyen.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [opening, photos] = await Promise.all([
    getPublishedSection("contact-opening"),
    getPlacedPhotos("contact"),
  ]);
  const contactPhoto = photosForSlot(photos, "contact")[0];

  return (
    <>
      <article className="quiet-page contact-page">
        <div className="contact-page__copy">
          <p className="eyebrow">{opening.eyebrow}</p>
          <h1>{opening.title}</h1>
          {opening.body ? <p className="quiet-intro">{opening.body}</p> : null}
          <nav className="contact-channels" aria-label="Contact links">
            <a href="mailto:dominichuyn@gmail.com">
              <Mail aria-hidden="true" size={19} strokeWidth={1.5} />
              <span>dominichuyn@gmail.com</span>
            </a>
            <a href="https://www.linkedin.com/in/huynguyen06" target="_blank" rel="noopener noreferrer">
              <Linkedin aria-hidden="true" size={19} strokeWidth={1.5} />
              <span>LinkedIn</span>
            </a>
            <a href="https://github.com/huynguyen9999" target="_blank" rel="noopener noreferrer">
              <Github aria-hidden="true" size={19} strokeWidth={1.5} />
              <span>GitHub</span>
            </a>
          </nav>
        </div>
        <figure className="contact-page__visual">
          <Image
            src={contactPhoto?.url || "/images/contact-sunset.jpg"}
            alt={contactPhoto?.alt || "Sunset over a rocky beach."}
            fill
            sizes="(max-width: 980px) 100vw, 48vw"
            priority
          />
          <blockquote>
            <p>“What you’re thinking is what you’re becoming.”</p>
            <cite>— Muhammad Ali</cite>
          </blockquote>
        </figure>
      </article>
      <SiteFooter />
    </>
  );
}
