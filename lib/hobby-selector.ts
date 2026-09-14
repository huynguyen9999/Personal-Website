import type { LucideIcon } from "lucide-react";
import { Activity, Car, Monitor, Mountain, Puzzle } from "lucide-react";

import type { HobbyCategory, HobbyId } from "@/lib/hobbies";

const hobbyFallbackImages: Record<HobbyId, string> = {
  adventures: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1400&q=80",
  machines: "/images/hobbies/machines/f150-overlook.jpg",
  "rubiks-cubes": "/images/hobbies/cubes/gan-christmas.jpg",
  "work-setup": "https://images.unsplash.com/photo-1498050108023-c524d27b8845?auto=format&fit=crop&w=1400&q=80",
  tennis: "https://images.unsplash.com/photo-1622279457286-62e235f93670?auto=format&fit=crop&w=1400&q=80",
};

const hobbyIcons: Record<HobbyId, LucideIcon> = {
  adventures: Mountain,
  machines: Car,
  "rubiks-cubes": Puzzle,
  "work-setup": Monitor,
  tennis: Activity,
};

export function hobbyCoverImage(category: HobbyCategory, photoIndex: number) {
  const photo = category.photos[photoIndex] ?? category.photos[0];
  if (photo?.url) return photo.url;
  return hobbyFallbackImages[category.id];
}

export function hobbyIcon(categoryId: HobbyId) {
  return hobbyIcons[categoryId];
}
