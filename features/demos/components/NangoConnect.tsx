"use client";

import { useState, useEffect } from "react";
import { Link2, Check, Loader2, X } from "lucide-react";
import { createNangoClient, getSessionToken, INTEGRATIONS, type IntegrationId } from "@/lib/nango/browser";

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
                <span className="integration-icon">{integration.icon}</span>
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
          font-size: 20px;
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

