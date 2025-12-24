"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// Replace with your Loop.so form ID from https://app.loops.so/forms
const LOOP_FORM_ID = "cmjjex00500nq0i06cgl0przr";

export function LoopEmailCapture() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) return;
    
    setStatus("loading");
    setErrorMessage("");

    try {
      const formBody = `email=${encodeURIComponent(email)}`;
      
      const response = await fetch(`https://app.loops.so/api/newsletter-form/${LOOP_FORM_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
      });

      if (!response.ok) {
        throw new Error("Failed to subscribe");
      }

      setStatus("success");
      setEmail("");
    } catch {
      setStatus("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="loop-capture success">
        <CheckCircle2 size={20} className="success-icon" />
        <span>You're in! Check your inbox for updates.</span>
        
        <style jsx>{`
          .loop-capture {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: var(--space-2);
            padding: var(--space-4);
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.2);
            border-radius: 10px;
            margin-top: var(--space-5);
          }
          .loop-capture :global(.success-icon) {
            color: #10b981;
          }
          .loop-capture span {
            font-size: 14px;
            color: #10b981;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="loop-capture">
      <div className="capture-header">
        <Mail size={16} />
        <span>Get notified when we ship new analyses</span>
      </div>
      
      <form onSubmit={handleSubmit} className="capture-form">
        <input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading"}
          required
        />
        <button type="submit" disabled={status === "loading" || !email.trim()}>
          {status === "loading" ? (
            <Loader2 size={16} className="spinner" />
          ) : (
            "Subscribe"
          )}
        </button>
      </form>

      {status === "error" && (
        <div className="error-message">
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      <style jsx>{`
        .loop-capture {
          margin-top: var(--space-5);
          padding: var(--space-4);
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.04) 0%, rgba(168, 85, 247, 0.04) 100%);
          border: 1px solid rgba(99, 102, 241, 0.15);
          border-radius: 10px;
        }

        .capture-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-3);
          color: var(--muted);
          font-size: 13px;
        }

        .capture-form {
          display: flex;
          gap: var(--space-2);
        }

        .capture-form input {
          flex: 1;
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 13px;
          background: var(--bg);
          color: var(--fg);
        }

        .capture-form input:focus {
          outline: none;
          border-color: #6366f1;
        }

        .capture-form input:disabled {
          opacity: 0.6;
        }

        .capture-form button {
          padding: var(--space-2) var(--space-4);
          background: #6366f1;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 90px;
        }

        .capture-form button:hover:not(:disabled) {
          opacity: 0.9;
        }

        .capture-form button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .capture-form button :global(.spinner) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          margin-top: var(--space-2);
          color: #ef4444;
          font-size: 12px;
        }

        @media (max-width: 500px) {
          .capture-form {
            flex-direction: column;
          }
          .capture-form button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

