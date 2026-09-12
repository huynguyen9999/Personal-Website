import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writing",
  description: "Writing and notes, ready for the first real piece.",
  alternates: { canonical: "/writing" },
};

export default function WritingPage() {
  return (
    <section className="quiet-page">
      <p className="eyebrow">WRITING / ARCHIVE</p>
      <h1>The shelf is ready.<br />The writing is not invented.</h1>
      <p className="quiet-intro">This page will hold essays, technical explanations, observations, and honest changes of mind. It remains empty until there is real work in the owner’s voice.</p>
      <div className="empty-ledger" role="status">
        <span>000</span>
        <p>Published pieces</p>
        <small>Drafts will appear here only after the editorial system is connected.</small>
      </div>
    </section>
  );
}
