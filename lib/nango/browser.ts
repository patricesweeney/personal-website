import Nango from '@nangohq/frontend';

// Create Nango client with session token (fetched from backend)
export function createNangoClient(sessionToken: string) {
  return new Nango({
    connectSessionToken: sessionToken,
  });
}

// Fetch a session token from our backend
export async function getSessionToken(connectionId: string): Promise<string> {
  const response = await fetch('/api/nango/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connectionId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to get session token');
  }
  
  const { sessionToken } = await response.json();
  return sessionToken;
}

// Supported integrations for B2B product analytics
export const INTEGRATIONS = {
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    description: 'Revenue, subscriptions, churn data',
  },
  shopify: {
    id: 'shopify',
    name: 'Shopify',
    description: 'Orders, customers, products',
  },
} as const;

export type IntegrationId = keyof typeof INTEGRATIONS;
