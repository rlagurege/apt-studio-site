export const SITE = {
  name: "Addictive Pain Tattoo",
  /** Logo from the site — save as public/logo.png (or .svg/.webp) and set logoPath accordingly */
  logoPath: "/logo.jpg",
  tagline: "Here To Serve Your Addiction",
  phone: "(518) 921-4167",
  address: {
    line1: "189 Fifth Ave",
    city: "Gloversville",
    state: "NY",
    zip: "12078",
  },
  addressSingleLine: "189 Fifth Ave, Gloversville, NY 12078",
  hours: [
    { days: "Sunday", hours: "Appointment Only" },
    { days: "Monday", hours: "12–8" },
    { days: "Tuesday", hours: "12–8" },
    { days: "Wednesday", hours: "12–8" },
    { days: "Thursday", hours: "12–8" },
    { days: "Friday", hours: "12–8" },
    { days: "Saturday", hours: "12–8" },
  ],
  mapsQuery: "189+Fifth+Ave+Gloversville+NY+12078",
  mapsUrl: "https://www.google.com/maps/search/?api=1&query=189+Fifth+Ave+Gloversville+NY+12078",
} as const;
