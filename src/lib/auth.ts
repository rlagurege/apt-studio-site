import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { artists } from "@/content/artists";
import { staff, isAdmin } from "@/lib/staff";
import { verifyPasskeyToken } from "@/lib/passkey-tokens";

/** Parse artist passwords from env. Format: JSON object { "artist-slug": "password", ... } */
function getArtistPasswords(): Record<string, string> {
  const raw = process.env.ARTIST_PASSWORDS;
  if (!raw || typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** Parse staff passwords from env. Format: JSON object { "staff-slug": "password", ... } */
function getStaffPasswords(): Record<string, string> {
  const raw = process.env.STAFF_PASSWORDS;
  if (!raw || typeof raw !== "string") return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
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
        if (!credentials?.slug) return null;
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
        if (!password) return null;
        
        // Check staff/admin first (e.g., Tammy)
        const staffPasswords = getStaffPasswords();
        const staffMember = staff.find((s) => s.slug === slug);
        if (staffMember) {
          const expected = staffPasswords[slug];
          if (expected && password === expected) {
            return { 
              id: staffMember.slug, 
              name: staffMember.name, 
              email: staffMember.email,
              role: staffMember.role,
            };
          }
        }
        
        // Check artists
        const passwords = getArtistPasswords();
        const expected = passwords[slug];
        if (!expected || password !== expected) return null;
        const artist = artists.find((a) => a.slug === slug);
        if (!artist) return null;
        return { id: artist.slug, name: artist.name, email: artist.slug, role: "artist" };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.email) {
        token.artistSlug = user.email;
        token.role = (user as { role?: string }).role || "artist";
        token.isAdmin = isAdmin(user.email);
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
