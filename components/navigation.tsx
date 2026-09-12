"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ThemeControls } from "@/components/theme-controls";

const links = [
  { href: "/", label: "Index", note: "The present", items: [{ href: "/#opening-title", label: "Opening" }, { href: "/#threads-title", label: "Four threads" }] },
  { href: "/about", label: "Story", note: "Vietnam to California", items: [{ href: "/about", label: "The route" }, { href: "/about#trajectory", label: "Three moments" }] },
  { href: "/writing", label: "Writing", note: "Notes and questions", items: [{ href: "/writing", label: "Archive" }, { href: "/writing#first-note", label: "First note" }] },
  { href: "/admin", label: "Edit", note: "Owner control room", items: [{ href: "/admin", label: "Sign in" }, { href: "/admin#page-editor", label: "Page editor" }] },
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

      <ThemeControls />

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
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setFocused(null);
            (event.target as HTMLElement).blur();
          }
        }}
      >
        {links.map((link, index) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          return (
            <div
              className="nav-cell"
              key={link.label}
              onMouseEnter={() => setFocused(link.href)}
              onFocusCapture={() => setFocused(link.href)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(null);
              }}
            >
              <Link
                href={link.href}
                className="nav-item"
                aria-current={active ? "page" : undefined}
                aria-expanded={focused === link.href}
                data-focused={focused === link.href}
                data-muted={focused && focused !== link.href ? "true" : "false"}
                onClick={() => setOpen(false)}
              >
                <span className="nav-number">0{index + 1}</span>
                <span>{link.label}</span>
                <span className="nav-note">{link.note}</span>
              </Link>
              <div className="nav-dropdown" aria-label={`${link.label} menu`}>
                <p>{link.note}</p>
                {link.items.map((item) => (
                  <Link key={item.label} href={item.href} onClick={() => { setOpen(false); setFocused(null); }}>
                    {item.label}<span aria-hidden="true">↗</span>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="nav-veil" aria-hidden="true" />
    </header>
  );
}
