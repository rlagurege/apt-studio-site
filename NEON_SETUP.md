# Neon Database Setup Guide

## Quick Setup (Web Interface - Recommended)

### Step 1: Create Neon Account
1. Go to https://neon.tech
2. Click "Sign Up" (free account)
3. Sign up with GitHub, Google, or email

### Step 2: Create Project
1. After signing in, click "Create a project"
2. Name it: `apt-studio` (or any name you want)
3. Select a region (closest to you)
4. Click "Create project"

### Step 3: Get Connection String
1. Once project is created, you'll see a dashboard
2. Look for "Connection string" or "Connection details"
3. Click "Copy" next to the connection string
4. It will look like:
   ```
   postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Step 4: Update .env File
1. Open your `.env` file
2. Find the line:
   ```
   DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
   ```
3. Replace it with your Neon connection string:
   ```
   DATABASE_URL="postgresql://username:password@ep-xxxx-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
   ```
4. **Important:** Keep the quotes around it!
5. Save the file

### Step 5: Run Setup
In your terminal, run:
```bash
npm run db:setup
```

This will:
- Create all database tables
- Create all artists
- Create Tammy (admin)
- Set up roles

### Step 6: Verify
```bash
npm run db:studio
```

You should see all your artists in the database browser!

---

## Alternative: Using Neon CLI

If you prefer using the command line:

### Step 1: Install and Authenticate
```bash
npx neonctl@latest auth
```

This will open your browser to authenticate.

### Step 2: Create Project
```bash
npx neonctl@latest projects create --name apt-studio
```

### Step 3: Get Connection String
```bash
npx neonctl@latest connection-string
```

Copy the output and add it to your `.env` file as `DATABASE_URL`.

### Step 4: Run Setup
```bash
npm run db:setup
```

---

## Troubleshooting

### "Connection refused" error
- Make sure you copied the ENTIRE connection string
- Check that `?sslmode=require` is at the end
- Verify your `.env` file has the correct `DATABASE_URL`

### "Database not initialized"
- Run: `npx prisma generate`
- Then: `npm run db:seed`

### Can't find connection string
- In Neon dashboard, go to your project
- Click on "Connection Details" or "Connection string"
- Make sure you're copying the "URI" format, not "JDBC"

---

## What You Get with Neon Free Tier

- ✅ 0.5 GB storage (plenty for your app)
- ✅ Automatic backups
- ✅ No credit card required
- ✅ PostgreSQL 15+
- ✅ Perfect for development and small production apps

---

## Next Steps After Setup

Once your database is connected:
1. ✅ All appointment requests save to database
2. ✅ Artists can log in
3. ✅ Tammy can manage requests
4. ✅ Data is automatically backed up

---

**Need help?** Check `SETUP_STEPS.md` for more detailed instructions.
