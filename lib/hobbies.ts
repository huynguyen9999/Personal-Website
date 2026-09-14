import type { PlacedPhoto } from "@/lib/media";

export type HobbyId =
  | "adventures"
  | "machines"
  | "rubiks-cubes"
  | "work-setup"
  | "tennis";

export type HobbyCategory = {
  id: HobbyId;
  label: string;
  photos: PlacedPhoto[];
};
