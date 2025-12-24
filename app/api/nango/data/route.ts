import { NextRequest, NextResponse } from "next/server";
import { fetchFromIntegration } from "@/lib/nango/server";

// GET - Fetch data from a connected integration
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const integrationId = searchParams.get("integrationId");
  const connectionId = searchParams.get("connectionId");
  const endpoint = searchParams.get("endpoint");

  if (!integrationId || !connectionId || !endpoint) {
    return NextResponse.json(
      { error: "integrationId, connectionId, and endpoint required" },
      { status: 400 }
    );
  }

  try {
    const data = await fetchFromIntegration(integrationId, connectionId, endpoint);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

// POST - Fetch data with more complex params (for paginated/filtered requests)
export async function POST(request: NextRequest) {
  try {
    const { integrationId, connectionId, endpoint, params } = await request.json();

    if (!integrationId || !connectionId || !endpoint) {
      return NextResponse.json(
        { error: "integrationId, connectionId, and endpoint required" },
        { status: 400 }
      );
    }

    // Build endpoint with query params if provided
    let fullEndpoint = endpoint;
    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(params).toString();
      fullEndpoint = `${endpoint}?${queryString}`;
    }

    const data = await fetchFromIntegration(integrationId, connectionId, fullEndpoint);
    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch data:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }
}

