# Step-by-Step Database Setup

Follow these steps in order to get your database working:

## Step 1: Get a Free Database (Choose One)

### Option A: Neon (Easiest - Recommended)
1. Open https://neon.tech in your browser
2. Click "Sign Up" (use GitHub or email - it's free)
3. Click "Create a project"
4. Name it "apt-studio" (or anything you want)
5. Click "Create project"
6. **Copy the connection string** - it will look like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
7. Keep this tab open - you'll need the connection string

### Option B: Supabase
1. Open https://supabase.com
2. Sign up and create a new project
3. Go to Settings → Database
4. Copy the connection string under "Connection string" → "URI"

### Option C: Railway
1. Open https://railway.app
2. Sign up and create a new project
3. Click "New" → "Database" → "PostgreSQL"
4. Click on the database → "Connect" tab
5. Copy the "Postgres Connection URL"

## Step 2: Update Your .env File

1. Open your project folder in your code editor
2. Open the `.env` file
3. Find this line:
   ```
   DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
   ```
4. **Replace the entire line** with your connection string from Step 1:
   ```
   DATABASE_URL="postgresql://your-actual-connection-string-here"
   ```
5. Save the file

## Step 3: Run Database Setup

Open your terminal in the project folder and run:

```bash
npm run db:setup
```

This will:
- Generate Prisma client
- Create all database tables
- Create all artists
- Create Tammy (admin)
- Set up roles

**If you see errors:**
- Make sure your `DATABASE_URL` is correct
- Check that you copied the entire connection string
- Try running: `npx prisma generate` first

## Step 4: Verify It Worked

Run this command to open a visual database browser:

```bash
npm run db:studio
```

You should see:
- ✅ A browser window opens
- ✅ Tables: Tenant, User, Role, etc.
- ✅ Click "User" - you should see all artists
- ✅ Click "Tenant" - you should see "APT Studios"

## Step 5: Test Login

1. Make sure your dev server is running:
   ```bash
   npm run dev
   ```

2. Open your browser: http://localhost:3000/artist/login

3. Try logging in:
   - **Artist**: Select "Big Russ" from dropdown, password: `416769`
   - **Admin**: Select "Tammy Gomula", password: `123456`

4. If login works → ✅ You're done!
5. If login fails → Check the terminal for `[Auth]` error messages

## Step 6: Test Request Creation

1. Go to: http://localhost:3000/appointments
2. Fill out the appointment request form
3. Submit it
4. Check your database (run `npm run db:studio` again)
5. Look in "AppointmentRequest" table - you should see your request!

## Troubleshooting

### "Database not initialized" error
```bash
npx prisma generate
npm run db:seed
```

### "Connection refused" error
- Double-check your `DATABASE_URL` in `.env`
- Make sure you copied the ENTIRE connection string
- For Neon/Supabase: Make sure you included `?sslmode=require` at the end

### "Artist not found" when logging in
```bash
npm run db:seed
```
This creates all artists in the database.

### Can't connect to database
- Verify your connection string is correct
- Check if your database provider requires IP whitelisting
- Try the connection string in a database client (like DBeaver or TablePlus)

## Need Help?

1. Check `QUICK_START.md` for a shorter guide
2. Check `DATABASE_SETUP.md` for detailed info
3. Look at terminal error messages - they usually tell you what's wrong
4. Make sure your `.env` file has the correct `DATABASE_URL`

## What Success Looks Like

When everything is working:
- ✅ `npm run db:setup` completes without errors
- ✅ `npm run db:studio` shows all artists
- ✅ You can log in at `/artist/login`
- ✅ Appointment requests save to database
- ✅ Tammy can see requests in admin dashboard

## Next Steps After Setup

Once database is working:
1. All appointment requests will save to database
2. Artists can log in and see their requests
3. Tammy can manage everything from admin dashboard
4. Data is automatically backed up (if using cloud DB)

---

**Ready? Start with Step 1 above!** 🚀
