"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeControls } from "@/components/theme-controls";

export const primaryNavLinks = [
  { href: "/", label: "Home", note: "Identity map", items: [{ href: "/#identity-map", label: "Explore the identity map" }] },
  { href: "/about", label: "My Story", note: "Vietnam to California", items: [{ href: "/about", label: "The full story" }, { href: "/about#trajectory", label: "Personal timeline" }] },
  { href: "https://github.com/huynguyen9999", label: "My Projects", note: "Portfolio · planned", items: [{ href: "https://github.com/huynguyen9999", label: "GitHub projects" }] },
  { href: "/reading", label: "Life", note: "Reading and interests", items: [{ href: "/reading", label: "Reading shelf" }, { href: "/reading?shelf=currently-reading", label: "Currently reading" }, { href: "/reading?shelf=read", label: "Finished reads" }, { href: "/reading?shelf=reading-next", label: "Future reads" }] },
] as const;

export function Navigation() {
  const pathname = usePathname();
  const [focused, setFocused] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCollapsed(false);
  }, [pathname]);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      const goingDown = y > lastY + 2;
      const goingUp = y < lastY - 2;
      lastY = y;

      if (open || y < 24) {
        setCollapsed(false);
        return;
      }

      if (goingUp) {
        setCollapsed(false);
        return;
      }

      if (goingDown && y > 56) setCollapsed(true);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    if (focused) setCollapsed(false);
  }, [focused]);

  return (
    <header
      className="site-header"
      data-nav-active={focused ? "true" : "false"}
      data-collapsed={collapsed ? "true" : "false"}
    >
      <Link className="site-mark" href="/" aria-label="Huy Nguyen, home">
        <span>Huy</span>
        <span>Nguyen</span>
      </Link>

      <ThemeControls />

      <button
        className="nav-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => {
          setOpen((value) => !value);
          setCollapsed(false);
        }}
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
            event.preventDefault();
            const trigger = (event.target as HTMLElement)
              .closest(".nav-cell")
              ?.querySelector<HTMLElement>(".nav-item");
            trigger?.focus({ preventScroll: true });
            setFocused(null);
          }
        }}
      >
        {primaryNavLinks.map((link, index) => {
          const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
          const menuId = `nav-${link.label.toLowerCase().replace(/\s+/g, "-")}-menu`;
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
                aria-controls={menuId}
                data-focused={focused === link.href}
                data-muted={focused && focused !== link.href ? "true" : "false"}
                onClick={() => setOpen(false)}
              >
                <span className="nav-number">0{index + 1}</span>
                <span>{link.label}</span>
                <span className="nav-note">{link.note}</span>
              </Link>
              <div id={menuId} className="nav-dropdown" aria-label={`${link.label} menu`}>
                <p>{link.note}</p>
                {link.items.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => { setOpen(false); setFocused(null); }}
                  >
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
