"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";
import styles from "./identity-map.module.css";

type NodeId = "vietnam" | "california" | "travels" | "ucsb" | "engineering" | "tennis" | "reading" | "cars-bikes" | "games-internet" | "content" | "making";
type Thread = "places" | "practice" | "curiosity" | "creative";
type ThreadFilter = "all" | Thread;

type IdentityNode = {
  id: NodeId;
  label: string;
  x: number;
  y: number;
  thread: Thread;
  note: string;
};

const threadLabels: Record<ThreadFilter, string> = {
  all: "All threads",
  places: "Places",
  practice: "Practices",
  curiosity: "Curiosities",
  creative: "Creative work",
};

const nodes: readonly IdentityNode[] = [
  { id: "vietnam", label: "Vietnam", x: 8, y: 28, thread: "places", note: "Ho Chi Minh City holds family, neighborhood bike rides, long school days, familiar food, and the tennis courts of childhood." },
  { id: "california", label: "California", x: 23, y: 39, thread: "places", note: "California is the present setting: a different language and environment, and the opportunity to study and compete at UC Santa Barbara." },
  { id: "travels", label: "Travels", x: 17, y: 73, thread: "places", note: "The defining journey recorded here runs from Vietnam to the United States. Future travels can join this thread when their stories are ready." },
  { id: "ucsb", label: "UCSB", x: 42, y: 18, thread: "practice", note: "UC Santa Barbara brings two demanding practices together: Electrical Engineering and collegiate tennis." },
  { id: "engineering", label: "Engineering", x: 61, y: 11, thread: "practice", note: "Electrical Engineering gives a formal direction to a longstanding curiosity about how systems work beneath the surface." },
  { id: "tennis", label: "Tennis", x: 43, y: 54, thread: "practice", note: "Tennis connects childhood courts in Ho Chi Minh City with collegiate competition at UCSB—and the discipline of repetition between them." },
  { id: "reading", label: "Reading", x: 56, y: 78, thread: "practice", note: "A living shelf tracks what is being read now, what has been finished, and what is waiting next." },
  { id: "cars-bikes", label: "Cars & bikes", x: 77, y: 30, thread: "curiosity", note: "Cars sparked questions about systems and mechanics; bikes also belong to remembered neighborhood routines in Vietnam." },
  { id: "games-internet", label: "Games & internet", x: 92, y: 16, thread: "curiosity", note: "Multiplayer games and the internet were early invitations to look behind an interface and ask how the system really worked." },
  { id: "content", label: "Content creation", x: 85, y: 67, thread: "creative", note: "Creating social-media content turns private curiosity into public communication: shape an idea, share it, and learn from the response." },
  { id: "making", label: "Making", x: 67, y: 49, thread: "creative", note: "Making is where engineering, writing, design, and experimentation become tangible—including this evolving personal archive." },
] as const;

const connections: ReadonlyArray<readonly [NodeId, NodeId]> = [
  ["vietnam", "california"], ["vietnam", "travels"], ["vietnam", "tennis"], ["vietnam", "cars-bikes"],
  ["california", "travels"], ["california", "ucsb"], ["ucsb", "engineering"], ["ucsb", "tennis"],
  ["ucsb", "reading"], ["engineering", "cars-bikes"], ["engineering", "games-internet"], ["engineering", "making"],
  ["reading", "content"], ["games-internet", "content"], ["cars-bikes", "making"], ["content", "making"],
] as const;

const nodeById = new Map(nodes.map((node) => [node.id, node]));
const tones = [styles.lavender, styles.orange, styles.red] as const;

function isConnected(candidate: NodeId, active: NodeId | null) {
  return active !== null && connections.some(([from, to]) => (from === active && to === candidate) || (to === active && from === candidate));
}

function relatedNodes(active: NodeId | null) {
  if (!active) return [];
  return connections.flatMap(([from, to]) => {
    if (from === active) return [nodeById.get(to)];
    if (to === active) return [nodeById.get(from)];
    return [];
  }).filter((node): node is IdentityNode => Boolean(node));
}

export function IdentityMap() {
  const [active, setActive] = useState<NodeId | null>(null);
  const [filter, setFilter] = useState<ThreadFilter>("all");
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const mapRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const noteId = useId();
  const instructionsId = useId();
  const activeNode = active ? nodeById.get(active) : undefined;
  const related = relatedNodes(active);

  function chooseFilter(nextFilter: ThreadFilter) {
    setFilter(nextFilter);
    if (nextFilter !== "all" && activeNode?.thread !== nextFilter) setActive(null);
  }

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
        </div>
      </header>

      <div className={styles.filters} aria-label="Filter identity map">
        {(Object.keys(threadLabels) as ThreadFilter[]).map((thread) => (
          <LiquidGlassButton
            key={thread}
            className={styles.filterButton}
            size="compact"
            type="button"
            aria-pressed={filter === thread}
            onClick={() => chooseFilter(thread)}
          >
            {threadLabels[thread]}
          </LiquidGlassButton>
        ))}
      </div>

      <div ref={mapRef} className={styles.map} data-filter={filter} onMouseLeave={() => {
        if (!mapRef.current?.contains(document.activeElement)) setActive(null);
      }}>
        <div className={styles.axisLabels} aria-hidden="true">
          <span>Origin</span><span>Practice</span><span>Curiosity</span><span>Expression</span>
        </div>
        <svg className={styles.lines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {connections.map(([from, to], index) => {
            const start = nodeById.get(from);
            const end = nodeById.get(to);
            if (!start || !end) return null;
            const connected = active === from || active === to;
            const inFilter = filter === "all" || start.thread === filter || end.thread === filter;
            return (
              <line key={`${from}-${to}`} className={`${styles.connection} ${tones[index % tones.length]} ${connected ? styles.connectionActive : active || !inFilter ? styles.connectionMuted : ""}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />
            );
          })}
        </svg>

        <ul className={styles.nodes} aria-label="Connected parts of Huy Nguyen's story">
          {nodes.map((node, index) => {
            const selected = active === node.id;
            const directlyRelated = isConnected(node.id, active);
            const inFilter = filter === "all" || node.thread === filter;
            const position = { "--node-x": `${node.x}%`, "--node-y": `${node.y}%` } as CSSProperties;
            return (
              <li key={node.id} className={styles.nodePosition} style={position}>
                <button ref={(element) => { buttonRefs.current[index] = element; }} className={styles.node} type="button" aria-controls={noteId} aria-describedby={instructionsId} aria-pressed={selected} data-thread={node.thread} data-related={directlyRelated ? "true" : "false"} data-muted={active ? (!selected && !directlyRelated ? "true" : "false") : (!inFilter ? "true" : "false")} onClick={() => setActive(node.id)} onFocus={() => setActive(node.id)} onMouseEnter={() => setActive(node.id)} onKeyDown={(event) => moveFocus(event, index)}>
                  <span aria-hidden="true" />
                  {node.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div id={noteId} className={styles.note} aria-live="polite" aria-atomic="true">
        <div>
          <p>{activeNode?.label ?? threadLabels[filter]}</p>
          <small>{activeNode ? threadLabels[activeNode.thread] : "Select a signal"}</small>
        </div>
        <div className={styles.noteBody}>
          <span>{activeNode?.note ?? "The map links place, study, sport, reading, curiosity, travel, and creative practice."}</span>
          {related.length > 0 ? (
            <div className={styles.related} aria-label={`Connected to ${activeNode?.label}`}>
              <small>Continue along</small>
              {related.map((node) => <button key={node.id} type="button" onClick={() => setActive(node.id)}>{node.label} <span aria-hidden="true">↗</span></button>)}
            </div>
          ) : null}
        </div>
      </div>
      <p id={instructionsId} className={styles.screenReaderOnly}>Use the arrow keys to move between points. Press Escape to clear the selection.</p>
    </section>
  );
}
