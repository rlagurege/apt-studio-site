"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function TestLoginPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function testLogin() {
    setLoading(true);
    setResult(null);
    try {
      const res = await signIn("credentials", {
        slug: "big-russ",
        password: "416769",
        redirect: false,
      });
      setResult(res);
      console.log("Login result:", res);
    } catch (err) {
      setResult({ error: String(err) });
      console.error("Login error:", err);
    }
    setLoading(false);
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">Test Login</h1>
      <button
        onClick={testLogin}
        disabled={loading}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Login (big-russ / 416769)"}
      </button>
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
