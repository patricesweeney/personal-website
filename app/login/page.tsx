"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock } from "lucide-react";

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push(returnTo);
        router.refresh();
      } else {
        setError("Incorrect password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        autoFocus
        disabled={loading}
      />
      {error && <span className="error">{error}</span>}
      <button type="submit" disabled={loading}>
        {loading ? "Checking..." : "Enter"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <Lock size={24} />
        </div>
        <h1>Protected Area</h1>
        <p>Enter the password to continue</p>
        
        <Suspense fallback={<div className="loading">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
        }

        .login-card {
          width: 100%;
          max-width: 320px;
          text-align: center;
        }

        .login-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--fg);
          color: var(--bg);
          border-radius: 12px;
          margin-bottom: var(--space-4);
        }

        h1 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: var(--space-2);
        }

        p {
          color: var(--muted);
          font-size: 14px;
          margin-bottom: var(--space-6);
        }

        .loading {
          color: var(--muted);
          font-size: 14px;
        }

        :global(.login-card form) {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        :global(.login-card input) {
          width: 100%;
          padding: var(--space-3);
          border: 1px solid var(--border);
          border-radius: 8px;
          font-size: 14px;
          background: var(--bg);
          color: var(--fg);
          text-align: center;
        }

        :global(.login-card input:focus) {
          outline: none;
          border-color: var(--fg);
        }

        :global(.login-card input:disabled) {
          opacity: 0.6;
        }

        :global(.login-card .error) {
          color: #e53e3e;
          font-size: 13px;
        }

        :global(.login-card button) {
          width: 100%;
          padding: var(--space-3);
          background: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s;
        }

        :global(.login-card button:hover:not(:disabled)) {
          opacity: 0.9;
        }

        :global(.login-card button:disabled) {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
