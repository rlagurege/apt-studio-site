# Quick Start Guide - Database Setup

## 🚀 Get Your Database Running in 5 Minutes

### Step 1: Get a Free PostgreSQL Database

Choose one (all free):

**Option A: Neon (Recommended)**
1. Go to https://neon.tech
2. Click "Sign Up" (free)
3. Create a new project
4. Copy the connection string (looks like: `postgresql://user:pass@host.neon.tech/dbname`)

**Option B: Supabase**
1. Go to https://supabase.com
2. Sign up and create project
3. Go to Settings → Database
4. Copy connection string

**Option C: Railway**
1. Go to https://railway.app
2. Sign up and create project
3. Add PostgreSQL database
4. Copy connection string

### Step 2: Update Your .env File

Open `.env` and replace the placeholder `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"
```

**⚠️ Important:** Replace the entire connection string with the one from your database provider.

### Step 3: Run Setup Script

```bash
npm run db:setup
```

This will:
- ✅ Generate Prisma client
- ✅ Create database tables
- ✅ Create all artists in database
- ✅ Set up Tammy (admin)
- ✅ Create roles (Admin, Scheduler, Artist)

### Step 4: Verify It Works

```bash
npm run db:studio
```

This opens Prisma Studio where you can see:
- All artists
- Tammy (admin)
- Roles and permissions

### Step 5: Test Login

1. Start dev server: `npm run dev`
2. Go to: http://localhost:3000/artist/login
3. Try logging in:
   - **Artist**: `big-russ` / `416769`
   - **Admin**: `tammy-gomula` / `123456`

## ✅ What You Should See

After setup, you should have:
- ✅ Database connected
- ✅ All 9 artists created
- ✅ Tammy (admin) created
- ✅ Login working for all artists
- ✅ Appointment requests saving to database

## 🐛 Troubleshooting

### "Database not initialized"
- Check `DATABASE_URL` in `.env` is correct
- Run: `npx prisma generate`
- Run: `npm run db:seed`

### "Artist not found"
- Run: `npm run db:seed` to create artists
- Check artist slug matches exactly (case-sensitive)

### "Connection refused"
- Verify database is running (if local)
- Check connection string format
- For cloud DBs, check IP whitelist settings

### Can't log in
- Verify passwords in `.env` match:
  ```
  ARTIST_PASSWORDS={"big-russ":"416769",...}
  STAFF_PASSWORDS={"tammy-gomula":"123456"}
  ```
- Check server logs for `[Auth]` messages
- Try the test login page: `/test-login`

## 📚 More Help

See `DATABASE_SETUP.md` for detailed instructions.

## 🎉 You're Done!

Once setup is complete:
- ✅ Artists can log in
- ✅ Requests save to database
- ✅ Tammy can see all requests
- ✅ Everything is backed up automatically (cloud DBs)
