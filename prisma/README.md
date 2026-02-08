# Database Setup Guide

This project uses Prisma with PostgreSQL for multi-tenant data management.

## Initial Setup

1. **Install PostgreSQL** (if not already installed)
   - macOS: `brew install postgresql@14`
   - Linux: `sudo apt-get install postgresql`
   - Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

2. **Create a database**
   ```bash
   createdb apt_studio
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your PostgreSQL connection string:
     ```
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/apt_studio?schema=public"
     ```

4. **Run migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

## Development Workflow

### Creating a new migration
```bash
npx prisma migrate dev --name your_migration_name
```

### Viewing the database
```bash
npx prisma studio
```

### Resetting the database (⚠️ deletes all data)
```bash
npx prisma migrate reset
```

## Schema Overview

The schema includes:

- **Tenancy**: Multi-tenant support with `Tenant` model
- **Auth/RBAC**: Users, roles, and permissions
- **Customers**: Customer management
- **Appointment Requests**: Tammy's inbox pipeline
- **Scheduling**: Appointments, availability blocks, locations, services
- **Files**: File uploads (S3, GCS, or local)
- **Payments**: Payment intents for deposits
- **Communication**: Conversations, messages, reminders

## Using Prisma Client

Import the Prisma client in your code:

```typescript
import { prisma } from "@/lib/db";

// Example: Get all appointments for a tenant
const appointments = await prisma.appointment.findMany({
  where: { tenantId: "your-tenant-id" },
  include: { artist: true, customer: true },
});
```

## Production Deployment

1. Set up a managed PostgreSQL database (Vercel Postgres, Supabase, Railway, etc.)
2. Update `DATABASE_URL` in your production environment
3. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```
4. Generate Prisma Client:
   ```bash
   npx prisma generate
   ```
