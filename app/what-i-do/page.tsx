import type { Metadata } from "next";

import { CreatorSocialLinks } from "@/components/creator-social-links";
import { PracticeStack } from "@/components/practice-stack";
import { StravaSnapshot } from "@/components/strava-snapshot";
import { Testimonials } from "@/components/ui/unique-testimonial";
import { SiteFooter } from "@/components/site-footer";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { getStravaStats } from "@/lib/strava";

export const metadata: Metadata = {
  title: "What I do",
  description: "Huy Nguyen as an electrical engineering student, a maker, and a collegiate athlete.",
  alternates: { canonical: "/what-i-do" },
};

const practices = [
  {
    id: "engineer",
    number: "01",
    title: "Engineer",
    body: "Electrical engineering at UC Santa Barbara. The work is learning how systems hold together—signals, hardware, software, and the questions behind an interface.",
    slot: "doing-engineer",
  },
  {
    id: "creator",
    number: "02",
    title: "Creator",
    body: "Making in public: this archive, photographs, writing when it is ready, and social-media content that turns private curiosity into something someone else can follow.",
    slot: "doing-creator",
  },
  {
    id: "student",
    number: "03",
    title: "Student",
    body: "Electrical engineering at UC Santa Barbara, and collegiate tennis. Both ask for observation, repetition, and the willingness to adjust when the point or the problem changes.",
    slot: "doing-student",
  },
] as const;

export default async function WhatIDoPage() {
  const [photos, stravaStats] = await Promise.all([getPlacedPhotos("what-i-do"), getStravaStats()]);

  return (
    <>
      <article className="practice-page">
        <header className="practice-header ruled-section">
          <p className="eyebrow">WHAT I DO</p>
          <h1>MY BEST.</h1>
          <p>Engineering, making, and study share the same calendar.</p>
        </header>

        <PracticeStack
          practices={practices.map((practice) => ({
            ...practice,
            photos: photosForSlot(photos, practice.slot),
            supplement: practice.id === "student"
              ? <StravaSnapshot stats={stravaStats} />
              : practice.id === "creator"
                ? <CreatorSocialLinks />
                : undefined,
          }))}
        />

        <section className="practice-links" id="testimonials" aria-label="Recommendations">
          <p className="eyebrow">RECOMMENDATIONS</p>
          <Testimonials
            testimonials={[{
              id: "peter-sutherland",
              quote: "He showed meticulous attention to detail while simultaneously demonstrating the flexibility to learn and try new things. In his capstone project he presented on the core challenges of developing software for non-deterministic systems.",
              author: "Peter Sutherland",
              role: "Engineering Leader · AI Native Development & LLM Integration",
              sourceUrl: "https://www.linkedin.com/in/sutherlandpb/",
              profileUrl: "https://www.linkedin.com/in/sutherlandpb/",
              avatarSrc: "/images/peter-sutherland.png",
            }, {
              id: "harshit-sharma",
              quote: "During his internship, what stood out was his combination of technical curiosity and execution excellence – he not only asked the right questions to fully understand problems, but also reliably delivered on implementation tasks within project timelines.",
              author: "Harshit Sharma",
              role: "Senior SDE · Amazon",
              sourceUrl: "https://www.linkedin.com/in/hsharma369/",
              profileUrl: "https://www.linkedin.com/in/hsharma369/",
              avatarSrc: "/images/harshit-sharma.jpg",
            }]}
          />
        </section>
      </article>
      <SiteFooter />
    </>
  );
}
