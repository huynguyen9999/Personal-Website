export const GITHUB_URL = "https://github.com/huynguyen9999";
export const RESUME_URL = "/files/Huy-B-Nguyen-Resume.pdf";

export const primaryNavLinks = [
  {
    href: "/",
    label: "Home",
    note: "Start here",
    items: [],
  },
  {
    href: "/about",
    label: "My Story",
    note: "Vietnam to California",
    items: [
      { href: "/#identity-map", label: "Identity map" },
      { href: "/#present-title", label: "At a glance" },
      { href: "/about#trajectory", label: "Trajectory" },
      { href: "/about", label: "The full story" },
    ],
  },
  {
    href: "/what-i-do",
    label: "What I do",
    note: "Engineer · creator · student",
    items: [
      { href: GITHUB_URL, label: "GitHub" },
      { href: RESUME_URL, label: "Resume" },
    ],
  },
  {
    href: "/who-i-am",
    label: "Who I am",
    note: "Hobbies, books, and origin",
    items: [
      { href: "/who-i-am#hobbies", label: "Hobbies" },
      { href: "/who-i-am#shelf", label: "Book shelf" },
    ],
  },
  {
    href: "/contact",
    label: "Contact",
    note: "Get in touch",
    items: [],
  },
] as const;

export function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}

export function opensInNewTab(href: string) {
  return isExternalHref(href) || /\.pdf(?:$|[?#])/i.test(href);
}
