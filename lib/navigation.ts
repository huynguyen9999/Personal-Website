export const GITHUB_URL = "https://github.com/huynguyen9999";

export const primaryNavLinks = [
  {
    href: "/",
    label: "Home",
    note: "Start here",
    items: [
      { href: "/#opening-title", label: "Opening" },
      { href: "/#identity-map", label: "Identity map" },
      { href: "/#present-title", label: "At a glance" },
      { href: "/#threads-title", label: "Trajectory" },
    ],
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
      { href: "/what-i-do#resume", label: "Resume" },
    ],
  },
  {
    href: "/who-i-am",
    label: "Who I am",
    note: "Books, machines, and setup",
    items: [
      { href: "/who-i-am#shelf", label: "Book shelf" },
      { href: "/who-i-am#drive", label: "What I drive" },
      { href: "/who-i-am#setup", label: "Work setup" },
    ],
  },
] as const;

export function isExternalHref(href: string) {
  return href.startsWith("http://") || href.startsWith("https://");
}
