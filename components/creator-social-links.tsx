import { Instagram, Music2 } from "lucide-react";

import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";

const socialProfiles = [
  {
    href: "https://www.instagram.com/huy.engineer/",
    label: "@huy.engineer on Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.tiktok.com/@huy_engineer",
    label: "@huy_engineer on TikTok",
    Icon: Music2,
  },
] as const;

export function CreatorSocialLinks() {
  return (
    <nav className="creator-social-links" aria-label="Huy Nguyen creator profiles">
      {socialProfiles.map(({ href, label, Icon }) => (
        <LiquidGlassButton key={href} asChild size="compact">
          <a href={href} target="_blank" rel="noopener noreferrer">
            <Icon aria-hidden="true" size={16} strokeWidth={1.6} />
            <span>{label}</span>
            <span aria-hidden="true">↗</span>
          </a>
        </LiquidGlassButton>
      ))}
    </nav>
  );
}
