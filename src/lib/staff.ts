export type StaffRole = "admin" | "artist";

export type StaffMember = {
  slug: string;
  name: string;
  role: StaffRole;
  email: string;
  phone?: string;
};

export const staff: StaffMember[] = [
  {
    slug: "tami-gomula",
    name: "Tami Gomula",
    role: "admin",
    email: "tami@aptstudio.com", // Update with real email
    phone: "(518) 921-4167",
  },
  {
    slug: "big-russ",
    name: "Big Russ",
    role: "admin",
    email: "big-russ@aptstudio.com", // Update with real email
  },
  {
    slug: "tom-bone",
    name: "Tom-Bone",
    role: "admin",
    email: "tom-bone@aptstudio.com", // Update with real email
  },
];

export function getStaffBySlug(slug: string): StaffMember | undefined {
  return staff.find((s) => s.slug === slug);
}

export function isAdmin(slug: string): boolean {
  const member = getStaffBySlug(slug);
  return member?.role === "admin";
}
