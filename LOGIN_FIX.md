# ✅ Fixed: Login System for Tami

## 🔧 What Was Wrong

1. **Typo in Passkey Redirect**: The passkey login success handler had a hardcoded check for `"tammy-gomula"` (with 'y'), but the actual slug is `"tami-gomula"`. This caused incorrect redirects after passkey authentication.

2. **Missing Admin Redirect Logic**: The main password login form didn't check if the user was an admin before redirecting, so admins were being sent to the artist dashboard instead of the admin dashboard.

3. **No Server-Side Redirect Callback**: NextAuth didn't have a redirect callback configured, which could cause issues with redirect handling.

## ✅ What I Fixed

### 1. Fixed Passkey Redirect Logic (`src/app/artist/login/page.tsx`)
**Before:**
```typescript
const finalUrl = slug === "tammy-gomula" ? "/admin/dashboard" : callbackUrl;
```

**After:**
```typescript
const staffMember = staff.find((s) => s.slug === slug);
const isAdmin = staffMember?.role === "admin";
const finalUrl = isAdmin ? "/admin/dashboard" : callbackUrl;
```

### 2. Fixed Main Login Redirect Logic (`src/app/artist/login/page.tsx`)
**Before:**
```typescript
if (res?.url) window.location.href = res.url;
```

**After:**
```typescript
if (res?.ok) {
  // Check if user is admin and redirect accordingly
  const staffMember = staff.find((s) => s.slug === slug);
  const isAdmin = staffMember?.role === "admin";
  const finalUrl = isAdmin ? "/admin/dashboard" : callbackUrl;
  window.location.href = finalUrl;
} else if (res?.url) {
  window.location.href = res.url;
}
```

### 3. Added Redirect Callback (`src/lib/auth.ts`)
Added a `redirect` callback to NextAuth configuration to properly handle redirect URLs:
```typescript
redirect({ url, baseUrl }) {
  // If redirecting to a relative URL, make it absolute
  if (url.startsWith("/")) return `${baseUrl}${url}`;
  // If redirecting to same origin, allow it
  if (new URL(url).origin === baseUrl) return url;
  // Default to base URL
  return baseUrl;
}
```

## 🎯 How to Test

1. **Tami Login (Password)**:
   - Go to `/artist/login`
   - Select "Tami Gomula (admin)" from the dropdown
   - Enter password: `123456`
   - Click "Sign in with Password"
   - ✅ Should redirect to `/admin/dashboard`

2. **Tami Login (Passkey)**:
   - Go to `/artist/login`
   - Select "Tami Gomula (admin)" from the dropdown
   - Click "Sign in with Passkey"
   - Complete biometric authentication
   - ✅ Should redirect to `/admin/dashboard`

3. **Artist Login**:
   - Go to `/artist/login`
   - Select any artist from the dropdown
   - Enter their password
   - Click "Sign in with Password"
   - ✅ Should redirect to `/artist/dashboard`

## 📝 Important Notes

- **Correct Slug**: Always use `"tami-gomula"` - this matches the staff configuration in `src/lib/staff.ts`
- **Environment Variable**: Make sure `STAFF_PASSWORDS` includes Tami's credentials:
  ```json
  {"tami-gomula":"123456"}
  ```
- **Role-Based Redirects**: The system now checks the user's role (`admin` vs `artist`) rather than hardcoding specific slugs, making it more maintainable.

## 🚀 Deployed

- ✅ Code fixed
- ✅ Build passes
- ✅ Pushed to GitHub
- ✅ Vercel will auto-redeploy

Tami should now be able to log in successfully and be redirected to the admin dashboard! 🎉
