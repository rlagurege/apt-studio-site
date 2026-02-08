"use client";

import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { signIn } from "next-auth/react";
import { useState } from "react";

type Props = {
  slug: string;
  userName: string;
  onSuccess?: () => void;
};

export function PasskeyRegister({ slug, userName, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    setLoading(true);
    setError("");

    try {
      // Get registration options
      const optionsRes = await fetch("/api/auth/passkey/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName }),
      });

      if (!optionsRes.ok) {
        throw new Error("Failed to get registration options");
      }

      const options = await optionsRes.json();

      // Start registration with browser
      const attestationResponse = await startRegistration(options);

      // Verify registration
      const verifyRes = await fetch("/api/auth/passkey/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: attestationResponse,
          challenge: options.challenge,
        }),
      });

      const result = await verifyRes.json();

      if (result.verified) {
        alert("Passkey registered successfully! You can now use biometrics to sign in.");
        onSuccess?.();
      } else {
        throw new Error(result.error || "Registration failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register passkey");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-50"
      >
        {loading ? "Registering..." : "Register Passkey (Face/Fingerprint)"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function PasskeyLogin({ slug, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");

    try {
      // Get authentication options
      const optionsRes = await fetch("/api/auth/passkey/login/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });

      if (!optionsRes.ok) {
        const err = await optionsRes.json();
        throw new Error(err.error || "No passkey registered. Please register first.");
      }

      const options = await optionsRes.json();

      // Start authentication with browser
      const assertionResponse = await startAuthentication(options);

      // Verify authentication
      const verifyRes = await fetch("/api/auth/passkey/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          response: assertionResponse,
          challenge: options.challenge,
        }),
      });

      const result = await verifyRes.json();

      if (result.verified) {
        // Get passkey token for NextAuth
        const sessionRes = await fetch("/api/auth/passkey/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });

        if (!sessionRes.ok) {
          throw new Error("Failed to create session token");
        }

        const { token } = await sessionRes.json();

        // Sign in with NextAuth using passkey token
        const signInResult = await signIn("credentials", {
          slug,
          password: `passkey:${token}`,
          redirect: false,
        });

        if (signInResult?.error) {
          throw new Error("Failed to sign in");
        }

        if (signInResult?.ok) {
          onSuccess?.();
        }
      } else {
        throw new Error(result.error || "Authentication failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to authenticate with passkey");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] disabled:opacity-50"
      >
        {loading ? "Authenticating..." : "Sign in with Passkey (Face/Fingerprint)"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
