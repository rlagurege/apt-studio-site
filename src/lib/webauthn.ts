import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from "@simplewebauthn/server";
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/server";
import fs from "fs";
import path from "path";

// Define AuthenticatorDevice type locally
type AuthenticatorDevice = {
  credentialID: string;
  credentialPublicKey: Buffer;
  counter: number;
};

const rpName = "APT Studio";
const rpID = process.env.NEXTAUTH_URL ? new URL(process.env.NEXTAUTH_URL).hostname : "localhost";
const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Store passkeys in a simple JSON file (in production, use a database)
const passkeysFile = path.join(process.cwd(), "data", "passkeys.json");

type PasskeyData = {
  [slug: string]: {
    credentialID: string;
    credentialPublicKey: Buffer;
    counter: number;
  }[];
};

function loadPasskeys(): PasskeyData {
  if (!fs.existsSync(passkeysFile)) return {};
  try {
    const raw = fs.readFileSync(passkeysFile, "utf8");
    const data = JSON.parse(raw) as Record<string, Array<{ credentialID: string; credentialPublicKey: string; counter: number }>>;
    // Convert base64 public keys back to Buffers
    const result: PasskeyData = {};
    for (const [slug, devices] of Object.entries(data)) {
      result[slug] = devices.map((d) => ({
        credentialID: d.credentialID, // Already base64url string
        credentialPublicKey: Buffer.from(d.credentialPublicKey, "base64"),
        counter: d.counter,
      }));
    }
    return result;
  } catch {
    return {};
  }
}

function savePasskeys(data: PasskeyData): void {
  const dir = path.dirname(passkeysFile);
  fs.mkdirSync(dir, { recursive: true });
  // Convert Buffers to base64 for JSON storage
  const json: Record<string, Array<{ credentialID: string; credentialPublicKey: string; counter: number }>> = {};
  for (const [slug, devices] of Object.entries(data)) {
    json[slug] = devices.map((d) => ({
      credentialID: d.credentialID,
      credentialPublicKey: d.credentialPublicKey.toString("base64"),
      counter: d.counter,
    }));
  }
  fs.writeFileSync(passkeysFile, JSON.stringify(json, null, 2), "utf8");
}

export async function generateRegistrationOptionsForUser(slug: string, userName: string) {
  const passkeys = loadPasskeys();
  const existingDevices = passkeys[slug] || [];

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: Buffer.from(slug),
    userName: `${userName} (${slug})`,
    timeout: 60000,
    attestationType: "none",
    excludeCredentials: existingDevices.map((dev) => ({
      id: dev.credentialID, // Already base64url string
      type: "public-key" as const,
    })),
    authenticatorSelection: {
      userVerification: "preferred", // Requires biometric (face/fingerprint) or PIN
      authenticatorAttachment: "platform", // Prefer device biometrics
    },
  });

  return options;
}

export async function verifyRegistration(slug: string, response: RegistrationResponseJSON, expectedChallenge: string) {
  const passkeys = loadPasskeys();
  const existingDevices = passkeys[slug] || [];

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });
  } catch (error) {
    console.error("[WebAuthn] Verification failed:", error);
    return { verified: false, error: String(error) };
  }

  const { verified, registrationInfo } = verification;

  if (verified && registrationInfo) {
    const { credential } = registrationInfo;
    const credentialID = credential.id; // base64url string
    const credentialPublicKey = credential.publicKey; // Uint8Array

    const newDevice: AuthenticatorDevice = {
      credentialID, // Already base64url string
      credentialPublicKey: Buffer.from(credentialPublicKey),
      counter: 0, // New credentials start at 0
    };

    passkeys[slug] = [...existingDevices, newDevice];
    savePasskeys(passkeys);
  }

  return { verified, error: null };
}

export async function generateAuthenticationOptionsForUser(slug: string) {
  const passkeys = loadPasskeys();
  const devices = passkeys[slug] || [];

  if (devices.length === 0) {
    throw new Error("No passkeys registered for this user");
  }

  const options = await generateAuthenticationOptions({
    rpID,
    timeout: 60000,
    allowCredentials: devices.map((dev) => ({
      id: dev.credentialID, // Already base64url string
      type: "public-key" as const,
    })),
    userVerification: "preferred",
  });

  return options;
}

export async function verifyAuthentication(slug: string, response: AuthenticationResponseJSON, expectedChallenge: string) {
  const passkeys = loadPasskeys();
  const devices = passkeys[slug] || [];

  const device = devices.find((dev) => {
    // Compare base64url strings directly
    return dev.credentialID === response.id;
  });

  if (!device) {
    return { verified: false, error: "Device not found" };
  }

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: device.credentialID, // base64url string
        publicKey: new Uint8Array(device.credentialPublicKey),
        counter: device.counter,
      },
      requireUserVerification: true,
    });
  } catch (error) {
    console.error("[WebAuthn] Authentication failed:", error);
    return { verified: false, error: String(error) };
  }

  const { verified, authenticationInfo } = verification;

  if (verified && authenticationInfo) {
    // Update counter
    device.counter = authenticationInfo.newCounter;
    savePasskeys(passkeys);
  }

  return { verified, error: null };
}
