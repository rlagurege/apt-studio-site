import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute for general routes
const RATE_LIMIT_AUTH_MAX = 5; // 5 requests per minute for auth routes
const RATE_LIMIT_UPLOAD_MAX = 10; // 10 requests per minute for upload routes

function getRateLimitKey(req: NextRequest): string {
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  const path = req.nextUrl.pathname;
  return `${ip}:${path}`;
}

function checkRateLimit(req: NextRequest, maxRequests: number): boolean {
  const key = getRateLimitKey(req);
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Clean every 5 minutes

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apply rate limiting
  let maxRequests = RATE_LIMIT_MAX_REQUESTS;
  if (pathname.startsWith("/api/auth/") || pathname.startsWith("/artist/login")) {
    maxRequests = RATE_LIMIT_AUTH_MAX;
  } else if (pathname.startsWith("/api/artist/upload") || pathname.startsWith("/api/appointment-request")) {
    maxRequests = RATE_LIMIT_UPLOAD_MAX;
  }

  if (!checkRateLimit(request, maxRequests)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // Security headers
  const response = NextResponse.next();
  
  // Content Security Policy - More permissive in development
  const isDev = process.env.NODE_ENV === "development";
  const cspHeader = isDev
    ? [
        "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
        "script-src * 'unsafe-inline' 'unsafe-eval'",
        "style-src * 'unsafe-inline'",
        "img-src * data: blob:",
        "font-src * data:",
        "connect-src *",
        "frame-src *",
      ].join("; ")
    : [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://api.stripe.com https://*.twilio.com",
        "frame-src 'self' https://js.stripe.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ].join("; ");

  // Security headers
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Content-Security-Policy", cspHeader);

  // CORS headers for API routes (if needed)
  if (pathname.startsWith("/api/")) {
    const origin = request.headers.get("origin");
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
    
    if (origin && (allowedOrigins.includes(origin) || process.env.NODE_ENV === "development")) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - fonts folder
     */
    "/((?!_next/static|_next/image|favicon.ico|fonts/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)).*)",
  ],
};
