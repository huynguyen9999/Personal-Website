import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter, IBM_Plex_Mono } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { CursorTrail } from "@/components/cursor-trail";
import "./globals.css";

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

const sans = Inter({ subsets: ["latin"], variable: "--font-sans" });
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://thehobbiest.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Huy Nguyen",
    template: "%s — Huy Nguyen",
  },
  description:
    "An evolving archive of engineering, writing, tennis, and a life shaped between Vietnam and California.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Huy Nguyen",
    description:
      "An evolving archive of engineering, writing, tennis, and a life shaped between Vietnam and California.",
    url: siteUrl,
    siteName: "Huy Nguyen",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Huy Nguyen",
    description:
      "An evolving archive of engineering, writing, tennis, and a life shaped between Vietnam and California.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f0f5" },
    { media: "(prefers-color-scheme: dark)", color: "#121016" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('site-theme')||'system';var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.dataset.themePreference=t;document.documentElement.style.colorScheme=d?'dark':'light'}catch(e){}})()`,
          }}
        />
      </head>
      <body>
        <a className="skip-link" href="#content">Skip to content</a>
        <Navigation />
        <main id="content">{children}</main>
        <CursorTrail />
      </body>
    </html>
  );
}
