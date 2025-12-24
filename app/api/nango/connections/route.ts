import { NextRequest, NextResponse } from "next/server";
import { getNangoServer } from "@/lib/nango/server";
import { INTEGRATIONS } from "@/lib/nango/browser";

// GET - List connected integrations for a connection ID
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const connectionId = searchParams.get("connectionId");

  if (!connectionId) {
    return NextResponse.json({ error: "connectionId required" }, { status: 400 });
  }

  try {
    const nango = getNangoServer();
    const connectedIntegrations: string[] = [];

    // Check each integration
    for (const integrationId of Object.keys(INTEGRATIONS)) {
      try {
        await nango.getConnection(integrationId, connectionId);
        connectedIntegrations.push(integrationId);
      } catch {
        // Not connected - skip
      }
    }

    return NextResponse.json({ connections: connectedIntegrations });
  } catch (error) {
    console.error("Failed to list connections:", error);
    return NextResponse.json({ error: "Failed to list connections" }, { status: 500 });
  }
}

// DELETE - Disconnect an integration
export async function DELETE(request: NextRequest) {
  try {
    const { integrationId, connectionId } = await request.json();

    if (!integrationId || !connectionId) {
      return NextResponse.json(
        { error: "integrationId and connectionId required" },
        { status: 400 }
      );
    }

    const nango = getNangoServer();
    await nango.deleteConnection(integrationId, connectionId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete connection:", error);
    return NextResponse.json({ error: "Failed to delete connection" }, { status: 500 });
  }
}

