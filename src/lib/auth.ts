import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { artists } from "@/content/artists";
import { staff, isAdmin } from "@/lib/staff";
import { verifyPasskeyToken } from "@/lib/passkey-tokens";

/** Parse artist passwords from env. Format: JSON object { "artist-slug": "password", ... } */
function getArtistPasswords(): Record<string, string> {
  const raw = process.env.ARTIST_PASSWORDS;
  if (!raw || typeof raw !== "string") {
    console.warn("[Auth] ARTIST_PASSWORDS not set");
    return {};
  }
  try {
    // Remove surrounding quotes if present (handles '{"key":"value"}' format)
    const cleaned = raw.trim().replace(/^['"]|['"]$/g, "");
    const parsed = JSON.parse(cleaned) as Record<string, string>;
    if (typeof parsed === "object" && parsed !== null) {
      console.log(`[Auth] Loaded ${Object.keys(parsed).length} artist passwords`);
      return parsed;
    }
    return {};
  } catch (error) {
    console.error("[Auth] Failed to parse ARTIST_PASSWORDS:", error);
    return {};
  }
}

/** Parse staff passwords from env. Format: JSON object { "staff-slug": "password", ... } */
function getStaffPasswords(): Record<string, string> {
  const raw = process.env.STAFF_PASSWORDS;
  if (!raw || typeof raw !== "string") {
    console.warn("[Auth] STAFF_PASSWORDS not set");
    return {};
  }
  try {
    // Remove surrounding quotes if present (handles '{"key":"value"}' format)
    const cleaned = raw.trim().replace(/^['"]|['"]$/g, "");
    const parsed = JSON.parse(cleaned) as Record<string, string>;
    if (typeof parsed === "object" && parsed !== null) {
      console.log(`[Auth] Loaded ${Object.keys(parsed).length} staff passwords`);
      return parsed;
    }
    return {};
  } catch (error) {
    console.error("[Auth] Failed to parse STAFF_PASSWORDS:", error);
    return {};
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Artist",
      credentials: {
        slug: { label: "Artist", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[Auth] authorize() called with credentials:", {
          slug: credentials?.slug,
          passwordLength: credentials?.password?.length,
          hasSlug: !!credentials?.slug,
          hasPassword: !!credentials?.password,
        });
        
        if (!credentials?.slug) {
          console.error("[Auth] No slug provided in credentials");
          return null;
        }
        const slug = String(credentials.slug).trim();
        const password = credentials?.password ? String(credentials.password).trim() : "";
        
        // Check if this is a passkey token (starts with "passkey:")
        if (password.startsWith("passkey:")) {
          const token = password.slice(8); // Remove "passkey:" prefix
          const verification = verifyPasskeyToken(token);
          if (verification.valid && verification.slug === slug) {
            // Passkey verified - return user
            const staffMember = staff.find((s) => s.slug === slug);
            if (staffMember) {
              return {
                id: staffMember.slug,
                name: staffMember.name,
                email: staffMember.email,
                role: staffMember.role,
              };
            }
            const artist = artists.find((a) => a.slug === slug);
            if (artist) {
              return { id: artist.slug, name: artist.name, email: artist.slug, role: "artist" };
            }
          }
          return null;
        }
        
        // Regular password authentication
        if (!password) {
          console.error(`[Auth] No password provided for ${slug}`);
          return null;
        }
        
        console.log(`[Auth] Attempting login for slug: "${slug}", password length: ${password.length}`);
        
        // Check staff/admin first (e.g., Tammi)
        const staffPasswords = getStaffPasswords();
        const staffMember = staff.find((s) => s.slug === slug);
        if (staffMember) {
          const expected = staffPasswords[slug]?.trim();
          console.log(`[Auth] Checking staff login for ${slug}, expected: "${expected}", got: "${password.trim()}"`);
          if (expected && password.trim() === expected.trim()) {
            console.log(`[Auth] Staff login successful for ${slug}`);
            return { 
              id: staffMember.slug, 
              name: staffMember.name, 
              email: staffMember.email,
              role: staffMember.role,
            };
          } else {
            console.error(`[Auth] Staff password mismatch for ${slug}. Expected: "${expected}", Got: "${password.trim()}"`);
            return null; // Return null immediately for staff - don't check artists
          }
        }
        
        // Check artists - try database first, fall back to static list
        const passwords = getArtistPasswords();
        const expected = passwords[slug]?.trim();
        console.log(`[Auth] Checking artist login for ${slug}, available slugs: ${Object.keys(passwords).join(", ")}`);
        
        if (!expected) {
          console.error(`[Auth] No password found for artist slug: ${slug}`);
          return null;
        }
        
        // Trim both passwords for comparison to handle whitespace issues
        console.log(`[Auth] Comparing passwords for ${slug}, expected: "${expected}", got: "${password.trim()}"`);
        if (password.trim() !== expected.trim()) {
          console.error(`[Auth] Password mismatch for ${slug}. Expected: "${expected}", Got: "${password.trim()}"`);
          return null;
        }
        
        // Try to find artist in database first
        try {
          const { prisma } = await import("@/lib/db");
          const tenant = await prisma.tenant.findFirst({ where: { slug: "apt-studios" } });
          if (tenant) {
            const dbArtist = await prisma.user.findFirst({
              where: {
                tenantId: tenant.id,
                OR: [
                  { email: { contains: slug } },
                  { email: { equals: `${slug}@apt.com` } },
                ],
              },
            });
            
            if (dbArtist) {
              console.log(`[Auth] Artist found in database: ${dbArtist.name}`);
              return { 
                id: slug, // Use slug as ID for compatibility
                name: dbArtist.name, 
                email: dbArtist.email, 
                role: "artist" 
              };
            }
          }
        } catch (dbError: any) {
          // Database not available, fall back to static list
          if (!dbError?.message?.includes("not initialized")) {
            console.warn(`[Auth] Database check failed, using static list:`, dbError.message);
          }
        }
        
        // Fallback to static artist list
        const artist = artists.find((a) => a.slug === slug);
        if (!artist) {
          console.error(`[Auth] Artist not found for slug: ${slug}`);
          return null;
        }
        console.log(`[Auth] Artist login successful for ${slug} (using static list)`);
        return { id: artist.slug, name: artist.name, email: artist.slug, role: "artist" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        // Use user.id (which contains the slug) for both artistSlug and admin check
        token.artistSlug = user.id;
        token.role = (user as { role?: string }).role || "artist";
        token.isAdmin = isAdmin(user.id); // Fix: use slug (user.id) instead of email
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as { artistSlug?: string }).artistSlug = token.artistSlug as string;
        (session.user as { role?: string }).role = (token.role as string) || "artist";
        (session.user as { isAdmin?: boolean }).isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
    redirect({ url, baseUrl }) {
      // If redirecting to a relative URL, make it absolute
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // If redirecting to same origin, allow it
      if (new URL(url).origin === baseUrl) return url;
      // Default to base URL
      return baseUrl;
    },
  },
  pages: {
    signIn: "/artist/login",
  },
  session: { 
    strategy: "jwt", 
    maxAge: 7 * 24 * 60 * 60, // Reduced to 7 days (was 30 days)
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax", // CSRF protection
        path: "/",
        secure: process.env.NODE_ENV === "production", // HTTPS only in production
      },
    },
  },
};
