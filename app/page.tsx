import Link from "next/link";

const threads = [
  ["01", "Origin", "Ho Chi Minh City, Vietnam", "A childhood shaped by neighborhood bike rides, long school days, family, and time around tennis courts."],
  ["02", "Study", "Electrical engineering · UCSB", "An interest in what happens behind the interface: systems, signals, hardware, software, and the internet."],
  ["03", "Practice", "Collegiate tennis", "Competition and engineering share a rhythm: observe, adjust, repeat."],
  ["04", "Public work", "Writing and creating", "A place for ideas and social-media work to become a durable archive, with context instead of metrics."],
] as const;

export default function HomePage() {
  return (
    <>
      <section className="opening ruled-section" aria-labelledby="opening-title">
        <p className="eyebrow">HO CHI MINH CITY <span aria-hidden="true">→</span> CALIFORNIA</p>
        <h1 id="opening-title">
          A life in progress,
          <span>measured in circuits and baselines.</span>
        </h1>
        <div className="opening-meta">
          <p>Electrical engineering at UC Santa Barbara. Collegiate tennis. Writing, making, and sharing what I learn.</p>
          <p className="coordinate">34.4140° N<br />119.8489° W</p>
        </div>
        <div className="court-line" aria-hidden="true"><span /></div>
      </section>

      <section className="manifesto ruled-section" aria-labelledby="manifesto-title">
        <p className="section-index">FIELD NOTE / 01</p>
        <div>
          <h2 id="manifesto-title">I’ve always wanted to see what happens behind the scenes.</h2>
          <p>As a child, that meant cars, multiplayer games, the internet, and the impulse to break—or “hack”—a system just to understand it. Electrical engineering gave that curiosity a place to become practice.</p>
        </div>
      </section>

      <section className="threads" aria-labelledby="threads-title">
        <header className="section-heading">
          <p className="eyebrow">FOUR THREADS / ONE TRAJECTORY</p>
          <h2 id="threads-title">Not separate identities.<br />One evolving system.</h2>
        </header>
        <div className="thread-list">
          {threads.map(([number, label, title, copy]) => (
            <article className="thread" key={number}>
              <p className="thread-number">{number}</p>
              <p className="thread-label">{label}</p>
              <h3>{title}</h3>
              <p>{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="route-section ruled-section" aria-labelledby="route-title">
        <p className="section-index">NEXT / STORY</p>
        <div>
          <h2 id="route-title">Two places, without reducing either to a chapter heading.</h2>
          <p>The first story pass stays close to the details already shared: language, family, routines, adaptation, and the distance between remembered places.</p>
          <Link className="text-link" href="/about">Follow the route <span aria-hidden="true">↗</span></Link>
        </div>
      </section>

      <footer className="site-footer">
        <p>This archive is being assembled.</p>
        <a href="https://github.com/huynguyen9999" target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a>
      </footer>
    </>
  );
}
