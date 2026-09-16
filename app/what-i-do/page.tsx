import type { Metadata } from "next";

import { PracticeStack } from "@/components/practice-stack";
import { SiteFooter } from "@/components/site-footer";
import { GITHUB_URL, RESUME_URL } from "@/lib/navigation";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";

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
  const photos = await getPlacedPhotos("what-i-do");

  return (
    <>
      <article className="practice-page">
        <header className="practice-header ruled-section">
          <p className="eyebrow">WHAT I DO</p>
          <h1>Three practices, running at once.</h1>
          <p>Engineering, making, and study share the same calendar.</p>
        </header>

        <PracticeStack
          practices={practices.map((practice) => ({
            ...practice,
            photos: photosForSlot(photos, practice.slot),
          }))}
        />

        <section className="practice-links" id="resume" aria-labelledby="resume-title">
          <div className="practice-links__actions">
            <a
              className="practice-action"
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
            >
              GitHub <span aria-hidden="true">↗</span>
            </a>
            <a
              className="practice-action"
              href={RESUME_URL}
              target="_blank"
              rel="noreferrer"
            >
              Resume <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div>
            <h2 id="resume-title">GitHub and resume.</h2>
          </div>
        </section>
      </article>
      <SiteFooter />
    </>
  );
}
