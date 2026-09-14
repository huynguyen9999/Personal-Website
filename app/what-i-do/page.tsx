import type { Metadata } from "next";
import { GITHUB_URL } from "@/lib/navigation";
import { getPlacedPhotos, photosForSlot } from "@/lib/media";
import { PlacedPhotos } from "@/components/placed-photos";
import { MotionSection } from "@/components/motion-section";
import { SiteFooter } from "@/components/site-footer";

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
          <p>
            Engineering, making, and study share the same calendar. GitHub is public. A resume file will live here
            when it is ready to publish.
          </p>
        </header>

        {practices.map((practice) => (
          <MotionSection
            key={practice.id}
            id={practice.id}
            className="practice-band"
            aria-labelledby={`${practice.id}-title`}
          >
            <p className="section-index">{practice.number}</p>
            <div>
              <h2 id={`${practice.id}-title`}>{practice.title}</h2>
              <p>{practice.body}</p>
              <PlacedPhotos photos={photosForSlot(photos, practice.slot)} layout="figure" />
            </div>
          </MotionSection>
        ))}

        <MotionSection className="practice-links" id="resume" aria-labelledby="resume-title">
          <p className="section-index">EVIDENCE</p>
          <div>
            <h2 id="resume-title">GitHub and resume.</h2>
            <p>The public code is on GitHub. The resume file is empty until it is placed here on purpose.</p>
            <div className="continue-links">
              <a className="text-link" href={GITHUB_URL} target="_blank" rel="noreferrer">
                GitHub <span aria-hidden="true">↗</span>
              </a>
              <p className="empty-copy">Resume PDF not published yet.</p>
            </div>
          </div>
        </MotionSection>
      </article>
      <SiteFooter />
    </>
  );
}
