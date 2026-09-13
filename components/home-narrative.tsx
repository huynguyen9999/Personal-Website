import Link from "next/link";
import { IdentityMap } from "@/components/identity-map";
import styles from "./home-narrative.module.css";

const worlds = [
  {
    number: "01",
    label: "Engineering",
    title: "Behind the interface",
    body: "Electrical Engineering at UC Santa Barbara gives a formal direction to an older curiosity: understanding the systems beneath the surface.",
    note: "Studying now · UCSB",
    tone: "lavender",
  },
  {
    number: "02",
    label: "Tennis",
    title: "A long-running practice",
    body: "Tennis was part of childhood in Ho Chi Minh City and remains part of the present as a collegiate player at UCSB.",
    note: "Childhood courts → collegiate competition",
    tone: "orange",
  },
  {
    number: "03",
    label: "Early systems",
    title: "Take it apart. Look underneath.",
    body: "Cars, multiplayer games, the internet, and the impulse to break—or “hack”—a system were early ways of asking the same question: how does this actually work?",
    note: "Curiosity before credentials",
    tone: "red",
  },
  {
    number: "04",
    label: "Creating",
    title: "Ideas made public",
    body: "Creating social-media content is another way to understand an idea: shape it clearly, put it in public, and notice what connects.",
    note: "A public creative practice",
    tone: "lavender",
  },
] as const;

export function HomeNarrative() {
  return (
    <div className={styles.narrative}>
      <section id="story" className={styles.trajectory} aria-labelledby="trajectory-title">
        <div className={styles.actLabel}>
          <span>ACT I</span>
          <span>ORIGIN / ADAPTATION</span>
        </div>
        <div className={styles.trajectoryLead}>
          <p className={styles.kicker}>Ho Chi Minh City → United States</p>
          <h2 id="trajectory-title">
            The move changed the language and the landscape.
            <em> It did not erase what came before.</em>
          </h2>
        </div>
        <div className={styles.contradiction}>
          <div>
            <span className={styles.placeIndex}>01 / BEFORE</span>
            <h3>A close-knit routine</h3>
            <p>
              Bike rides around the neighborhood, long school days, after-school
              lessons, tennis courts, family, familiar food, and a community that
              felt close.
            </p>
          </div>
          <div className={styles.routeMark} aria-hidden="true">
            <span />
            <b>≈ 11</b>
            <span />
          </div>
          <div>
            <span className={styles.placeIndex}>02 / AFTER</span>
            <h3>A different environment</h3>
            <p>
              Weather, food, people, language, and community all felt different.
              The language barrier was significant. Learning English, adapting,
              and finding a way forward became part of the work.
            </p>
          </div>
        </div>
        <p className={styles.trajectoryCoda}>
          Vietnam remains present through family, language, people, food, and
          remembered routines. The United States also represents opportunity—the
          possibility of turning an ambition into something real. Both belong in
          the same story.
        </p>
      </section>

      <IdentityMap />

      <section className={styles.worlds} aria-labelledby="worlds-title">
        <header className={styles.worldsHeader}>
          <div className={styles.actLabel}>
            <span>ACT II</span>
            <span>FIVE WORLDS</span>
          </div>
          <div>
            <p className={styles.kicker}>Different rooms, one person</p>
            <h2 id="worlds-title">The subjects that keep returning.</h2>
          </div>
        </header>

        <div className={styles.fragmentField}>
          {worlds.map((world) => (
            <article
              className={`${styles.fragment} ${styles[world.tone]}`}
              key={world.number}
            >
              <div className={styles.fragmentIndex}>
                <span>{world.number}</span>
                <span>{world.label}</span>
              </div>
              <h3>{world.title}</h3>
              <p>{world.body}</p>
              <small>{world.note}</small>
            </article>
          ))}

          <article className={`${styles.fragment} ${styles.readingFragment}`}>
            <div className={styles.fragmentIndex}>
              <span>05</span>
              <span>Reading</span>
            </div>
            <p className={styles.shelfMark} aria-hidden="true">A—Z</p>
            <h3>A shelf without borrowed taste.</h3>
            <p>
              The current shelf includes <em>The Richest Man in Babylon</em>,
              <em> Steve Jobs</em>, and <em>Start with Why</em>—with finished books
              and what comes next kept in the same public ledger.
            </p>
            <Link href="/reading">Open the reading shelf <span aria-hidden="true">↗</span></Link>
          </article>
        </div>
      </section>

      <section id="making" className={styles.making} aria-labelledby="making-title">
        <div className={styles.actLabel}>
          <span>ACT III</span>
          <span>MAKING</span>
        </div>
        <div className={styles.makingIntro}>
          <p className={styles.kicker}>Selected work / this archive</p>
          <h2 id="making-title">A personal site that can keep changing.</h2>
          <p>
            I designed and built this website to hold a life in motion—not a
            frozen résumé. Next.js carries the public experience; Supabase keeps
            published writing, private drafts, books, and uploaded photographs;
            Vercel delivers each reviewed version.
          </p>
        </div>
        <dl className={styles.projectProof}>
          <div>
            <dt>01</dt>
            <dd>A portfolio should be editable without changing code</dd>
          </div>
          <div>
            <dt>02</dt>
            <dd>Design, writing direction, implementation, and testing</dd>
          </div>
          <div>
            <dt>03</dt>
            <dd>Separate private drafts from public content</dd>
          </div>
          <div>
            <dt>04</dt>
            <dd>A live archive with owner-only editing and media placement</dd>
          </div>
        </dl>
      </section>

      <section id="life" className={styles.life} aria-labelledby="life-title">
        <header>
          <div className={styles.actLabel}>
            <span>ACT IV</span>
            <span>LIFE / ONE ROUTINE</span>
          </div>
          <h2 id="life-title">The ordinary sequence that became worth missing.</h2>
        </header>
        <ol className={styles.lifeSequence}>
          <li>
            <span>Afternoon</span>
            <strong>Tennis</strong>
            <p>Time on the courts in Ho Chi Minh City.</p>
          </li>
          <li>
            <span>Afterward</span>
            <strong>Dinner</strong>
            <p>A particular place with his father and sister.</p>
          </li>
          <li>
            <span>Around it</span>
            <strong>Neighborhood</strong>
            <p>Bike rides, familiar people, language, food, and family routines.</p>
          </li>
          <li>
            <span>Now</span>
            <strong>Memory</strong>
            <p>Not a grand scene—just a precise shape of home that remains.</p>
          </li>
        </ol>
      </section>

      <section id="now" className={styles.now} aria-labelledby="now-title">
        <div className={styles.nowStamp}>
          <span>NOW</span>
          <time dateTime="2026-09">SEPTEMBER 2026</time>
        </div>
        <div className={styles.nowBody}>
          <h2 id="now-title">The present, without pretending to know every detail.</h2>
          <ul>
            <li><span>Studying</span> Electrical Engineering at UC Santa Barbara</li>
            <li><span>Competing</span> Collegiate tennis at UCSB</li>
            <li><span>Creating</span> Social-media content</li>
          </ul>
          <p>
            These three practices run on different clocks, but each rewards the
            same habits: attention, repetition, and the willingness to adjust.
          </p>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <p className={styles.kicker}>The archive stays open</p>
        <h2 id="closing-title">There is more to document, and time to do it honestly.</h2>
        <p>
          For now, the clearest public trail is the work Huy chooses to share as
          it takes shape.
        </p>
        <Link href="https://github.com/huynguyen9999" target="_blank" rel="noreferrer">
          Continue on GitHub <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </div>
  );
}
