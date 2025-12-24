"use client";

import { useState, useEffect } from "react";
import { Link2, Check, Loader2, X } from "lucide-react";
import { createNangoClient, getSessionToken, INTEGRATIONS, type IntegrationId } from "@/lib/nango/browser";

// Brand icons as inline SVGs
const IntegrationIcons: Record<string, React.ReactNode> = {
  stripe: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
    </svg>
  ),
  shopify: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.337 3.415c-.042-.03-.138-.045-.21-.015-.06.015-1.347.42-1.347.42s-.893-.87-1.167-1.11c-.285-.24-.555-.27-.78-.24-.03-.09-.06-.165-.105-.255-.285-.555-.72-.855-1.23-.855-.035 0-.075 0-.11.003-.015-.02-.03-.037-.048-.054-.285-.30-.66-.45-1.11-.42-.87.06-1.74.66-2.46 1.68-.51.72-.9 1.62-1.005 2.31-.945.285-1.605.495-1.65.51-.495.15-.51.165-.57.63-.045.345-1.32 10.2-1.32 10.2l10.5 1.83v-11.22c0-.015-.015-.03-.03-.03zm-3.15-1.665c0 .06 0 .135-.015.195-.51.15-1.065.33-1.65.51.315-1.23 1.065-1.83 1.59-1.83.03 0 .06 0 .075.015zm-.765-1.05c.06 0 .12.015.165.045-.765.375-1.59 1.32-1.93 3.21-.465.15-.93.285-1.365.42.375-1.23 1.17-3.69 3.13-3.675zm-.39 8.7c.06 0 .12.015.165.045-.765.375-1.59 1.32-1.93 3.21-.465.15-.93.285-1.365.42.375-1.23 1.17-3.69 3.13-3.675zm1.08 1.74c-.54-.27-1.17-.42-1.92-.42s-1.38.15-1.92.42c-.54.27-.99.69-1.35 1.26-.36-.57-.81-.99-1.35-1.26-.54-.27-1.17-.42-1.92-.42-.75 0-1.38.15-1.92.42-.54.27-.99.69-1.35 1.26V9.15h12v2.85c-.36-.57-.81-.99-1.35-1.26zM15.337 23.415l5.385-1.35s-2.31-15.66-2.325-15.75c-.015-.09-.09-.135-.15-.15-.06-.015-1.245-.03-1.245-.03s-.87-.855-1.2-1.14v18.42z"/>
    </svg>
  ),
};

interface ConnectionStatus {
  [key: string]: "disconnected" | "connecting" | "connected" | "error";
}

interface NangoConnectProps {
  connectionId: string; // Unique ID for this user/session
  onConnectionChange?: (integrationId: IntegrationId, connected: boolean) => void;
}

export function NangoConnect({ connectionId, onConnectionChange }: NangoConnectProps) {
  const [statuses, setStatuses] = useState<ConnectionStatus>({});
  const [error, setError] = useState<string | null>(null);

  // Check existing connections on mount
  useEffect(() => {
    checkConnections();
  }, [connectionId]);

  const checkConnections = async () => {
    try {
      const response = await fetch(`/api/nango/connections?connectionId=${connectionId}`);
      if (response.ok) {
        const { connections } = await response.json();
        const newStatuses: ConnectionStatus = {};
        for (const integration of Object.keys(INTEGRATIONS)) {
          newStatuses[integration] = connections.includes(integration) ? "connected" : "disconnected";
        }
        setStatuses(newStatuses);
      }
    } catch {
      // Silently fail - connections will show as disconnected
    }
  };

  const handleConnect = async (integrationId: IntegrationId) => {
    setStatuses(prev => ({ ...prev, [integrationId]: "connecting" }));
    setError(null);

    try {
      // Get a session token from our backend
      const sessionToken = await getSessionToken(connectionId);
      
      // Create Nango client with the session token
      const nango = createNangoClient(sessionToken);
      await nango.auth(integrationId, connectionId);
      
      setStatuses(prev => ({ ...prev, [integrationId]: "connected" }));
      onConnectionChange?.(integrationId, true);
    } catch (err) {
      setStatuses(prev => ({ ...prev, [integrationId]: "error" }));
      setError(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const handleDisconnect = async (integrationId: IntegrationId) => {
    try {
      await fetch(`/api/nango/connections`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrationId, connectionId }),
      });
      
      setStatuses(prev => ({ ...prev, [integrationId]: "disconnected" }));
      onConnectionChange?.(integrationId, false);
    } catch {
      setError("Failed to disconnect");
    }
  };

  return (
    <div className="nango-connect">
      <div className="connect-header">
        <Link2 size={16} />
        <span>Connect your tools</span>
      </div>

      <div className="integrations-grid">
        {Object.values(INTEGRATIONS).map((integration) => {
          const status = statuses[integration.id] || "disconnected";
          
          return (
            <div key={integration.id} className={`integration-card ${status}`}>
              <div className="integration-info">
                <span className="integration-icon">{IntegrationIcons[integration.id]}</span>
                <div className="integration-details">
                  <span className="integration-name">{integration.name}</span>
                  <span className="integration-desc">{integration.description}</span>
                </div>
              </div>
              
              <div className="integration-action">
                {status === "disconnected" && (
                  <button 
                    className="connect-btn"
                    onClick={() => handleConnect(integration.id as IntegrationId)}
                  >
                    Connect
                  </button>
                )}
                
                {status === "connecting" && (
                  <button className="connect-btn" disabled>
                    <Loader2 size={14} className="spinner" />
                  </button>
                )}
                
                {status === "connected" && (
                  <div className="connected-state">
                    <span className="connected-badge">
                      <Check size={12} /> Connected
                    </span>
                    <button 
                      className="disconnect-btn"
                      onClick={() => handleDisconnect(integration.id as IntegrationId)}
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                
                {status === "error" && (
                  <button 
                    className="connect-btn error"
                    onClick={() => handleConnect(integration.id as IntegrationId)}
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <style jsx>{`
        .nango-connect {
          margin-top: var(--space-5);
          padding: var(--space-4);
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border);
          border-radius: 10px;
        }

        .connect-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          font-size: 14px;
          font-weight: 500;
          color: var(--fg);
        }

        .integrations-grid {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .integration-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-3);
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          transition: all 0.15s;
        }

        .integration-card.connected {
          border-color: rgba(16, 185, 129, 0.3);
          background: rgba(16, 185, 129, 0.04);
        }

        .integration-info {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .integration-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: rgba(0, 0, 0, 0.04);
          border-radius: 8px;
          color: var(--fg);
        }

        .integration-details {
          display: flex;
          flex-direction: column;
        }

        .integration-name {
          font-size: 13px;
          font-weight: 500;
        }

        .integration-desc {
          font-size: 11px;
          color: var(--muted);
        }

        .connect-btn {
          padding: var(--space-1) var(--space-3);
          background: var(--fg);
          color: var(--bg);
          border: none;
          border-radius: 5px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 70px;
          height: 28px;
        }

        .connect-btn:hover:not(:disabled) {
          opacity: 0.9;
        }

        .connect-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .connect-btn.error {
          background: #ef4444;
        }

        .connect-btn :global(.spinner) {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .connected-state {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .connected-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: var(--space-1) var(--space-2);
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .disconnect-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 4px;
          cursor: pointer;
          color: var(--muted);
          transition: all 0.15s;
        }

        .disconnect-btn:hover {
          border-color: #ef4444;
          color: #ef4444;
        }

        .error-message {
          margin-top: var(--space-3);
          padding: var(--space-2) var(--space-3);
          background: rgba(239, 68, 68, 0.1);
          border-radius: 6px;
          font-size: 12px;
          color: #ef4444;
        }

        @media (max-width: 500px) {
          .integration-card {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-3);
          }
          
          .integration-action {
            width: 100%;
          }
          
          .connect-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

