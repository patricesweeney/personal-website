import Nango from '@nangohq/frontend';

let nangoInstance: Nango | null = null;

export function getNangoClient() {
  if (!nangoInstance) {
    nangoInstance = new Nango({
      publicKey: process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY!,
    });
  }
  return nangoInstance;
}

// Supported integrations for B2B product analytics
export const INTEGRATIONS = {
  stripe: {
    id: 'stripe',
    name: 'Stripe',
    description: 'Revenue, subscriptions, churn data',
    icon: '💳',
  },
  hubspot: {
    id: 'hubspot',
    name: 'HubSpot',
    description: 'CRM, leads, deals, pipeline',
    icon: '🧲',
  },
  segment: {
    id: 'segment',
    name: 'Segment',
    description: 'Product usage events',
    icon: '📊',
  },
} as const;

export type IntegrationId = keyof typeof INTEGRATIONS;

