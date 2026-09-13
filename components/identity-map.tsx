"use client";

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import styles from "./identity-map.module.css";

type NodeId =
  | "vietnam"
  | "california"
  | "ucsb"
  | "engineering"
  | "tennis"
  | "internet"
  | "cars"
  | "games"
  | "making";

type IdentityNode = {
  id: NodeId;
  label: string;
  x: number;
  y: number;
  note: string;
};

const nodes: readonly IdentityNode[] = [
  {
    id: "vietnam",
    label: "Vietnam",
    x: 9,
    y: 38,
    note: "Grew up in Ho Chi Minh City, with family, neighborhood routines, and tennis courts in the picture.",
  },
  {
    id: "california",
    label: "California",
    x: 28,
    y: 38,
    note: "California is the present setting for studying and playing collegiate tennis at UC Santa Barbara.",
  },
  {
    id: "ucsb",
    label: "UCSB",
    x: 46,
    y: 21,
    note: "Studies and competes at the University of California, Santa Barbara.",
  },
  {
    id: "engineering",
    label: "Engineering",
    x: 67,
    y: 13,
    note: "Studies Electrical Engineering, alongside a longstanding curiosity about how systems work.",
  },
  {
    id: "internet",
    label: "Internet",
    x: 89,
    y: 19,
    note: "Childhood curiosity included how the internet works behind the scenes.",
  },
  {
    id: "tennis",
    label: "Tennis",
    x: 48,
    y: 55,
    note: "A collegiate tennis player at UCSB who also spent significant childhood time on tennis courts in Vietnam.",
  },
  {
    id: "cars",
    label: "Cars",
    x: 70,
    y: 39,
    note: "Cars were part of an early fascination with how things work behind the scenes.",
  },
  {
    id: "games",
    label: "Games",
    x: 89,
    y: 53,
    note: "Multiplayer games were part of an early curiosity about how things work.",
  },
  {
    id: "making",
    label: "Making / creating",
    x: 69,
    y: 67,
    note: "Creates social-media content and wants this website to remain a living personal archive.",
  },
] as const;

const connections: ReadonlyArray<readonly [NodeId, NodeId]> = [
  ["vietnam", "california"],
  ["vietnam", "tennis"],
  ["california", "ucsb"],
  ["ucsb", "engineering"],
  ["ucsb", "tennis"],
  ["engineering", "internet"],
  ["engineering", "cars"],
  ["engineering", "making"],
  ["internet", "games"],
  ["internet", "making"],
] as const;

const nodeById = new Map(nodes.map((node) => [node.id, node]));
const tones = [styles.lavender, styles.orange, styles.red] as const;

function isConnected(candidate: NodeId, active: NodeId | null) {
  return active !== null && connections.some(
    ([from, to]) => (from === active && to === candidate) || (to === active && from === candidate),
  );
}

export function IdentityMap() {
  const [active, setActive] = useState<NodeId | null>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const noteId = useId();
  const instructionsId = useId();
  const activeNode = active ? nodeById.get(active) : undefined;

  function moveFocus(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let nextIndex: number | undefined;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (index + 1) % nodes.length;
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (index - 1 + nodes.length) % nodes.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = nodes.length - 1;
    if (event.key === "Escape") setActive(null);

    if (nextIndex !== undefined) {
      event.preventDefault();
      buttonRefs.current[nextIndex]?.focus();
    }
  }

  return (
    <section id="identity-map" className={styles.section} aria-labelledby={headingId}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>IDENTITY MAP</p>
        <div>
          <h2 id={headingId}>One life, seen through its connections.</h2>
          <p>Hover, focus, or tap a point to follow a thread.</p>
        </div>
      </header>

      <div
        ref={mapRef}
        className={styles.map}
        onMouseLeave={() => {
          if (!mapRef.current?.contains(document.activeElement)) setActive(null);
        }}
      >
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {connections.map(([from, to], index) => {
            const start = nodeById.get(from);
            const end = nodeById.get(to);
            if (!start || !end) return null;
            const connected = active === from || active === to;

            return (
              <line
                key={`${from}-${to}`}
                className={`${styles.connection} ${tones[index % tones.length]} ${
                  connected ? styles.connectionActive : active ? styles.connectionMuted : ""
                }`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
              />
            );
          })}
        </svg>

        <ul className={styles.nodes} aria-label="Connected parts of Huy Nguyen's story">
          {nodes.map((node, index) => {
            const selected = active === node.id;
            const related = isConnected(node.id, active);
            const position = {
              "--node-x": `${node.x}%`,
              "--node-y": `${node.y}%`,
            } as CSSProperties;

            return (
              <li key={node.id} className={styles.nodePosition} style={position}>
                <button
                  ref={(element) => {
                    buttonRefs.current[index] = element;
                  }}
                  className={styles.node}
                  type="button"
                  aria-controls={noteId}
                  aria-describedby={instructionsId}
                  aria-pressed={selected}
                  data-related={related ? "true" : "false"}
                  data-muted={active && !selected && !related ? "true" : "false"}
                  onClick={() => setActive(node.id)}
                  onFocus={() => setActive(node.id)}
                  onMouseEnter={() => setActive(node.id)}
                  onKeyDown={(event) => moveFocus(event, index)}
                >
                  <span aria-hidden="true" />
                  {node.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div id={noteId} className={styles.note} aria-live="polite" aria-atomic="true">
        <p>{activeNode?.label ?? "Choose a point"}</p>
        <span>{activeNode?.note ?? "The map links place, study, sport, curiosity, and creative practice."}</span>
      </div>
      <p id={instructionsId} className={styles.screenReaderOnly}>
        Use the arrow keys to move between points. Press Escape to clear the selection.
      </p>
    </section>
  );
}
