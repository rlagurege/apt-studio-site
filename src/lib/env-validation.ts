/**
 * Environment variable validation
 * Ensures all required environment variables are set
 */

export function validateEnvVars() {
  const required = [
    "NEXTAUTH_SECRET",
    "NEXTAUTH_URL",
  ];

  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}\n` +
      `Please check your .env file or environment configuration.`
    );
  }

  // Validate NEXTAUTH_SECRET length
  if (process.env.NEXTAUTH_SECRET && process.env.NEXTAUTH_SECRET.length < 32) {
    console.warn(
      "⚠️  WARNING: NEXTAUTH_SECRET should be at least 32 characters long for security."
    );
  }

  // Validate NEXTAUTH_URL format
  if (process.env.NEXTAUTH_URL) {
    try {
      new URL(process.env.NEXTAUTH_URL);
    } catch {
      throw new Error("NEXTAUTH_URL must be a valid URL");
    }
  }
}

// Run validation in production
if (process.env.NODE_ENV === "production") {
  try {
    validateEnvVars();
  } catch (error) {
    console.error("Environment validation failed:", error);
    process.exit(1);
  }
}
