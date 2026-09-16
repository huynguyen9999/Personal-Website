import type { CSSProperties } from "react";

import { PlacedPhotos } from "@/components/placed-photos";
import type { PlacedPhoto } from "@/lib/media";

import styles from "./practice-stack.module.css";

export type PracticeCard = {
  id: string;
  number: string;
  title: string;
  body: string;
  photos: PlacedPhoto[];
};

export function PracticeStack({ practices }: { practices: PracticeCard[] }) {
  return (
    <div className={styles.stack}>
      {practices.map((practice, index) => (
        <section
          key={practice.id}
          id={practice.id}
          className={styles.card}
          style={{ "--stack-index": index } as CSSProperties}
          aria-labelledby={`${practice.id}-title`}
        >
          <p className={styles.index}>{practice.number}</p>
          <div className={styles.body}>
            <h2 className={styles.title} id={`${practice.id}-title`}>
              {practice.title}
            </h2>
            <p className={styles.copy}>{practice.body}</p>
            <PlacedPhotos photos={practice.photos} layout="figure" />
          </div>
        </section>
      ))}
    </div>
  );
}
