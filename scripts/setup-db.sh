#!/bin/bash

# Database Setup Script for APT Studio
# This script helps you set up your database connection

echo "🔧 APT Studio Database Setup"
echo "============================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file not found. Creating from .env.example..."
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✅ Created .env file"
  else
    echo "❌ .env.example not found. Please create .env manually."
    exit 1
  fi
fi

# Check DATABASE_URL
if grep -q "johndoe\|randompassword" .env; then
  echo "⚠️  DATABASE_URL appears to be a placeholder."
  echo ""
  echo "Please set up a PostgreSQL database:"
  echo ""
  echo "Option 1: Neon (Free) - https://neon.tech"
  echo "Option 2: Supabase (Free) - https://supabase.com"
  echo "Option 3: Railway (Free) - https://railway.app"
  echo ""
  echo "Then update DATABASE_URL in your .env file:"
  echo 'DATABASE_URL="postgresql://user:password@host:5432/dbname?schema=public"'
  echo ""
  read -p "Press Enter when you've updated DATABASE_URL, or Ctrl+C to cancel..."
fi

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" .env; then
  echo "❌ DATABASE_URL not found in .env"
  echo "Please add it to your .env file"
  exit 1
fi

echo "✅ DATABASE_URL found"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Generate Prisma Client
echo "🔨 Generating Prisma Client..."
npx prisma generate

# Run migrations
echo "📊 Running database migrations..."
npx prisma migrate dev --name init || {
  echo "⚠️  Migration failed. This might be okay if tables already exist."
}

# Seed database
echo "🌱 Seeding database..."
npm run db:seed || {
  echo "⚠️  Seed failed. Check your DATABASE_URL and database connection."
  exit 1
}

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Verify artists were created: npx prisma studio"
echo "2. Test login at: http://localhost:3000/artist/login"
echo "3. Use artist slugs and passwords from ARTIST_PASSWORDS in .env"
echo ""
