"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { ThemeControls } from "@/components/theme-controls";
import { opensInNewTab, primaryNavLinks } from "@/lib/navigation";

function NavJump({
  href,
  children,
  className,
  ...props
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<"a">, "href">) {
  if (opensInNewTab(href)) {
    return (
      <a className={className} href={href} target="_blank" rel="noreferrer" {...props}>
        {children}
      </a>
    );
  }

  return (
    <Link className={className} href={href} {...props}>
      {children}
    </Link>
  );
}

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
              <NavJump
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
              </NavJump>
              <div id={menuId} className="nav-dropdown" aria-label={`${link.label} menu`}>
                <p>{link.note}</p>
                {link.items.map((item) => (
                  <NavJump
                    key={item.label}
                    href={item.href}
                    onClick={() => { setOpen(false); setFocused(null); }}
                  >
                    {item.label}<span aria-hidden="true">↗</span>
                  </NavJump>
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
