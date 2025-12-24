import { Nango } from '@nangohq/node';

let nangoInstance: Nango | null = null;

export function getNangoServer() {
  if (!nangoInstance) {
    nangoInstance = new Nango({
      secretKey: process.env.NANGO_SECRET_KEY!,
    });
  }
  return nangoInstance;
}

// Helper to fetch data from a connected integration
export async function fetchFromIntegration(
  integrationId: string,
  connectionId: string,
  endpoint: string
) {
  const nango = getNangoServer();
  
  const response = await nango.proxy({
    providerConfigKey: integrationId,
    connectionId,
    method: 'GET',
    endpoint,
  });
  
  return response.data;
}

// Get connection status for a user
export async function getConnection(integrationId: string, connectionId: string) {
  const nango = getNangoServer();
  
  try {
    const connection = await nango.getConnection(integrationId, connectionId);
    return connection;
  } catch {
    return null;
  }
}

// List all connections for a user
export async function listConnections(connectionId: string) {
  const nango = getNangoServer();
  
  try {
    const { connections } = await nango.listConnections();
    return connections.filter(c => c.connection_id === connectionId);
  } catch {
    return [];
  }
}

