"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
  { href: "/", label: "Index", note: "The present" },
  { href: "/about", label: "Story", note: "Vietnam to California" },
  { href: "/writing", label: "Writing", note: "Notes and questions" },
  { href: "/admin", label: "Edit", note: "Owner control room" },
];

export function Navigation() {
  const pathname = usePathname();
  const [focused, setFocused] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header" data-nav-active={focused ? "true" : "false"}>
      <Link className="site-mark" href="/" aria-label="Personal archive, home">
        <span aria-hidden="true">01</span>
        <span>PERSONAL ARCHIVE</span>
      </Link>

      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "Close" : "Explore"}
      </button>

      <nav
        id="primary-navigation"
        className="primary-nav"
        data-open={open}
        aria-label="Primary navigation"
        onMouseLeave={() => setFocused(null)}
      >
        {links.map((link, index) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className="nav-item"
              aria-current={active ? "page" : undefined}
              data-focused={focused === link.href}
              data-muted={focused && focused !== link.href ? "true" : "false"}
              onMouseEnter={() => setFocused(link.href)}
              onFocus={() => setFocused(link.href)}
              onBlur={() => setFocused(null)}
              onClick={() => setOpen(false)}
            >
              <span className="nav-number">0{index + 1}</span>
              <span>{link.label}</span>
              <span className="nav-note">{link.note}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
