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
    slug: "tammy-gomula",
    name: "Tammy Gomula",
    role: "admin",
    email: "tammy@aptstudio.com", // Update with real email
    phone: "(518) 921-4167",
  },
];

export function getStaffBySlug(slug: string): StaffMember | undefined {
  return staff.find((s) => s.slug === slug);
}

export function isAdmin(slug: string): boolean {
  const member = getStaffBySlug(slug);
  return member?.role === "admin";
}
