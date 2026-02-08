import type { StyleTag } from "./types";

export function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

const STYLE_LABELS: Record<StyleTag, string> = {
  black_and_grey: "Black & Grey",
  color: "Color",
  traditional: "Traditional",
  neo_traditional: "Neo Traditional",
  fine_line: "Fine Line",
  realism: "Realism",
  anime: "Anime",
  script: "Script",
  coverup: "Cover-up",
  laser_removal: "Laser Removal",
  before_after: "Before & After",
  custom: "Custom",
  floral: "Floral",
  stipple: "Stipple",
};

export function formatStyleTag(tag: StyleTag): string {
  return STYLE_LABELS[tag];
}

export function prettyStyleTag(tag: string) {
  return tag.replaceAll("_", " ");
}

export function safeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function newId(prefix = "req") {
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}
