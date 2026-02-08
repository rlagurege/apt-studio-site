import "next-auth";

declare module "next-auth" {
  interface User {
    artistSlug?: string;
    role?: string;
  }

  interface Session {
    user?: User & {
      artistSlug?: string;
      role?: string;
      isAdmin?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    artistSlug?: string;
    role?: string;
    isAdmin?: boolean;
  }
}
