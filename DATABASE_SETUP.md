# Database Setup Guide

This guide will help you set up a PostgreSQL database for APT Studio to store appointment requests, artist profiles, and customer data.

## Quick Start (Free Options)

### Option 1: Neon (Recommended - Free Tier)
1. Go to https://neon.tech
2. Sign up for a free account
3. Create a new project
4. Copy the connection string (it will look like: `postgresql://user:password@host.neon.tech/dbname`)
5. Add it to your `.env` file as `DATABASE_URL`

### Option 2: Supabase (Free Tier)
1. Go to https://supabase.com
2. Sign up and create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Add it to your `.env` file as `DATABASE_URL`

### Option 3: Railway (Free Tier)
1. Go to https://railway.app
2. Sign up and create a new project
3. Add a PostgreSQL database
4. Copy the connection string
5. Add it to your `.env` file as `DATABASE_URL`

## Local PostgreSQL Setup

If you prefer to run PostgreSQL locally:

1. **Install PostgreSQL:**
   - macOS: `brew install postgresql@14`
   - Windows: Download from https://www.postgresql.org/download/
   - Linux: `sudo apt-get install postgresql`

2. **Create database:**
   ```bash
   createdb apt_studio
   ```

3. **Update `.env`:**
   ```
   DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/apt_studio?schema=public"
   ```

## Setup Steps

Once you have your `DATABASE_URL`:

1. **Add to `.env` file:**
   ```bash
   DATABASE_URL="your-connection-string-here"
   ```

2. **Run database migrations:**
   ```bash
   npx prisma migrate dev --name init
   ```

3. **Seed the database (creates artists and roles):**
   ```bash
   npm run db:seed
   ```

4. **Verify it worked:**
   ```bash
   npx prisma studio
   ```
   This opens a visual database browser where you can see all your data.

## What Gets Created

The seed script creates:
- ✅ Tenant: "APT Studios"
- ✅ Roles: Admin, Scheduler, Artist
- ✅ Tammy Gomula (Admin/Scheduler)
- ✅ All artists from `src/content/artists.ts`:
  - Big Russ
  - Kenny Briggs
  - Kade Zapp
  - Chris Cross
  - Marisa K Millington
  - Brian Langer
  - Tom-Bone
  - Ron Holt
  - Gavin Gomula

## Login Credentials

Artists log in using:
- **Username/Slug**: Their artist slug (e.g., `big-russ`, `kenny-briggs`)
- **Password**: From `ARTIST_PASSWORDS` in `.env`

Example:
```
ARTIST_PASSWORDS={"big-russ":"416769","kenny-briggs":"changeme","gavin-gomula":"000123","tom-bone":"110244","ron-holt":"666666"}
```

Tammy logs in with:
- **Username/Slug**: `tammy-gomula`
- **Password**: From `STAFF_PASSWORDS` in `.env` (default: `123456`)

## Troubleshooting

### "Database not initialized" error
- Make sure `DATABASE_URL` is set correctly in `.env`
- Run `npx prisma generate` to regenerate Prisma client
- Run `npx prisma migrate dev` to create tables

### "Artist not found" error
- Run `npm run db:seed` to create artist users in database
- Check that the artist slug matches exactly (case-sensitive)

### Connection refused
- Verify your database is running (if local)
- Check that the connection string is correct
- For cloud databases, ensure your IP is whitelisted (if required)

## Backup Your Database

### Automated Backups (Recommended)
Most cloud providers (Neon, Supabase, Railway) offer automatic backups.

### Manual Backup
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

### Restore Backup
```bash
psql $DATABASE_URL < backup_20240201.sql
```

## Production Deployment

When deploying to Vercel:

1. Add `DATABASE_URL` to Vercel environment variables
2. Run migrations in production:
   ```bash
   npx prisma migrate deploy
   ```
3. Seed production database (one time):
   ```bash
   npm run db:seed
   ```

## Need Help?

- Check Prisma docs: https://www.prisma.io/docs
- Check your database provider's documentation
- Verify `.env` file has correct `DATABASE_URL` format
