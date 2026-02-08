export type StyleTag =
  | "black_and_grey"
  | "color"
  | "traditional"
  | "neo_traditional"
  | "fine_line"
  | "realism"
  | "anime"
  | "script"
  | "coverup"
  | "laser_removal"
  | "before_after"
  | "custom"
  | "floral"
  | "stipple";

export type Artist = {
  slug: string;
  name: string;
  role: string;
  bio: string;
  avatarUrl: string;
  specialties: StyleTag[];
  facebookUrl?: string;
  instagramUrl?: string;
};

export type Tattoo = {
  id: string;
  artistSlug: string;
  title?: string;
  imageUrl: string;
  beforeImageUrl?: string; // Optional before photo
  styles: StyleTag[];
};

export type AppointmentRequest = {
  id: string;
  createdAtISO: string;
  artistSlug: string;
  name: string;
  contact: string; // email or phone
  placement: string;
  size: string;
  styleNotes: string;
  budget?: string;
  timeline?: string;
  referenceImageSavedPath?: string;
};
