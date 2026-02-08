import crypto from "crypto";

const TOKEN_SECRET = process.env.PASSKEY_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "default-secret-change-me";
const TOKEN_EXPIRY = 5 * 60 * 1000; // 5 minutes

export function generatePasskeyToken(slug: string): string {
  const timestamp = Date.now();
  const data = `${slug}:${timestamp}`;
  const hmac = crypto.createHmac("sha256", TOKEN_SECRET);
  hmac.update(data);
  const token = Buffer.from(`${data}:${hmac.digest("hex")}`).toString("base64url");
  return token;
}

export function verifyPasskeyToken(token: string): { valid: boolean; slug?: string; error?: string } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [slug, timestampStr, expectedHmac] = decoded.split(":");

    if (!slug || !timestampStr || !expectedHmac) {
      return { valid: false, error: "Invalid token format" };
    }

    const timestamp = parseInt(timestampStr, 10);
    const now = Date.now();

    // Check expiry
    if (now - timestamp > TOKEN_EXPIRY) {
      return { valid: false, error: "Token expired" };
    }

    // Verify HMAC
    const data = `${slug}:${timestampStr}`;
    const hmac = crypto.createHmac("sha256", TOKEN_SECRET);
    hmac.update(data);
    const computedHmac = hmac.digest("hex");

    if (computedHmac !== expectedHmac) {
      return { valid: false, error: "Invalid token signature" };
    }

    return { valid: true, slug };
  } catch (error) {
    return { valid: false, error: "Token verification failed" };
  }
}
