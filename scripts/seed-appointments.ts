import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";
import { addDays, addHours, setHours, setMinutes, isSameDay } from "date-fns";

const connectionString = process.env.DATABASE_URL;

if (!connectionString || connectionString.includes("johndoe") || connectionString.includes("randompassword")) {
  console.error("❌ DATABASE_URL is not configured.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter, log: ["error", "warn"] });

async function main() {
  console.log("🌱 Seeding fake appointments...");

  const tenant = await prisma.tenant.findFirst({ where: { slug: "apt-studios" } });
  if (!tenant) {
    console.error("❌ Tenant not found. Run db:seed first.");
    process.exit(1);
  }

  // Get all artists
  const artists = await prisma.user.findMany({
    where: {
      tenantId: tenant.id,
      roles: {
        some: {
          role: {
            name: "Artist",
          },
        },
      },
    },
  });

  if (artists.length === 0) {
    console.error("❌ No artists found. Run db:seed first.");
    process.exit(1);
  }

  // Get or create a location
  let location = await prisma.location.findFirst({
    where: { tenantId: tenant.id, name: "Main Studio" },
  });
  if (!location) {
    location = await prisma.location.create({
      data: {
        tenantId: tenant.id,
        name: "Main Studio",
        address: "123 Main St, Gloversville, NY",
      },
    });
  }

  // Get or create a service
  let service = await prisma.service.findFirst({
    where: { tenantId: tenant.id, name: "Custom Tattoo" },
  });
  if (!service) {
    service = await prisma.service.create({
      data: {
        tenantId: tenant.id,
        name: "Custom Tattoo",
        defaultDurationMins: 120,
        depositRequired: true,
        depositAmountCents: 5000, // $50
      },
    });
  }

  // Sample customer names
  const customers = [
    { name: "Sarah Johnson", email: "sarah.j@email.com", phone: "518-555-0101" },
    { name: "Mike Chen", email: "mike.chen@email.com", phone: "518-555-0102" },
    { name: "Emma Williams", email: "emma.w@email.com", phone: "518-555-0103" },
    { name: "James Rodriguez", email: "james.r@email.com", phone: "518-555-0104" },
    { name: "Lisa Anderson", email: "lisa.a@email.com", phone: "518-555-0105" },
    { name: "David Kim", email: "david.k@email.com", phone: "518-555-0106" },
    { name: "Jessica Martinez", email: "jessica.m@email.com", phone: "518-555-0107" },
    { name: "Chris Thompson", email: "chris.t@email.com", phone: "518-555-0108" },
  ];

  // Create or get customers
  const customerRecords = await Promise.all(
    customers.map(async (c) => {
      const existing = await prisma.customer.findFirst({
        where: { tenantId: tenant.id, email: c.email },
      });
      if (existing) return existing;
      return prisma.customer.create({
        data: {
          tenantId: tenant.id,
          name: c.name,
          email: c.email,
          phone: c.phone,
        },
      });
    })
  );

  // Generate appointments for the next 2 weeks
  const today = new Date();
  const appointments = [];

  // First, create a special day with multiple artists (today or tomorrow)
  const testDate = addDays(today, 0); // Use today
  const testDayOfWeek = testDate.getDay();
  
  // If today is Sunday, use tomorrow instead
  const targetDate = testDayOfWeek === 0 ? addDays(today, 1) : testDate;
  
  // Create appointments from multiple artists on the same day
  const timesForSameDay = [10, 11, 12, 13, 14, 15, 16, 17]; // Multiple time slots
  const artistsForSameDay = artists.slice(0, Math.min(artists.length, 5)); // Use up to 5 artists
  
  console.log(`📅 Creating test appointments for ${targetDate.toLocaleDateString()} with ${artistsForSameDay.length} artists...`);
  
  // Create appointments from different artists on the same day
  for (let i = 0; i < Math.min(timesForSameDay.length, artistsForSameDay.length * 2); i++) {
    const artist = artistsForSameDay[i % artistsForSameDay.length];
    const customer = customerRecords[i % customerRecords.length];
    const startHour = timesForSameDay[i];
    const startTime = setMinutes(setHours(targetDate, startHour), 0);
    const endTime = addHours(startTime, 2); // 2 hour appointments

    // Mix of statuses
    const statuses = ["confirmed", "confirmed", "tentative", "confirmed"] as const;
    const status = statuses[i % statuses.length];

    const titles = [
      "Custom Sleeve Design",
      "Portrait Tattoo",
      "Traditional Piece",
      "Cover-up Work",
      "Fine Line Design",
      "Color Realism",
      "Black & Grey",
      "Japanese Style",
      "Geometric Design",
      "Watercolor Tattoo",
    ];
    const title = titles[i % titles.length];

    appointments.push({
      tenantId: tenant.id,
      artistId: artist.id,
      customerId: customer.id,
      locationId: location.id,
      serviceId: service.id,
      title: `${title} - ${customer.name}`,
      startAt: startTime,
      endAt: endTime,
      status,
      notesCustomer: `Customer requested ${title.toLowerCase()}. Please confirm design before appointment.`,
      timezone: "America/New_York",
    });
  }

  // Then generate appointments for the rest of the 2 weeks
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const date = addDays(today, dayOffset);
    const dayOfWeek = date.getDay();

    // Skip Sundays (day 0) and skip the test day we already created
    if (dayOfWeek === 0 || isSameDay(date, targetDate)) continue;

    // Generate 2-4 appointments per day
    const numAppointments = Math.floor(Math.random() * 3) + 2;
    const times = [10, 12, 14, 16]; // 10am, 12pm, 2pm, 4pm

    for (let i = 0; i < numAppointments && i < times.length; i++) {
      const artist = artists[Math.floor(Math.random() * artists.length)];
      const customer = customerRecords[Math.floor(Math.random() * customerRecords.length)];
      const startHour = times[i];
      const startTime = setMinutes(setHours(date, startHour), 0);
      const endTime = addHours(startTime, 2); // 2 hour appointments

      // Random status (mostly confirmed, some tentative)
      const statuses = ["confirmed", "confirmed", "confirmed", "tentative"] as const;
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const titles = [
        "Custom Sleeve Design",
        "Portrait Tattoo",
        "Traditional Piece",
        "Cover-up Work",
        "Fine Line Design",
        "Color Realism",
        "Black & Grey",
      ];
      const title = titles[Math.floor(Math.random() * titles.length)];

      appointments.push({
        tenantId: tenant.id,
        artistId: artist.id,
        customerId: customer.id,
        locationId: location.id,
        serviceId: service.id,
        title,
        startAt: startTime,
        endAt: endTime,
        status,
        notesCustomer: `Customer requested ${title.toLowerCase()}. Please confirm design before appointment.`,
        timezone: "America/New_York",
      });
    }
  }

  // Create appointments
  console.log(`📅 Creating ${appointments.length} appointments...`);
  for (const apt of appointments) {
    await prisma.appointment.create({ data: apt });
  }

  console.log("✅ Fake appointments created successfully!");
  console.log(`   - ${appointments.length} appointments`);
  console.log(`   - ${customerRecords.length} customers`);
  console.log(`   - ${artists.length} artists`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
