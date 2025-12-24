import { NextRequest, NextResponse } from "next/server";
import { getNangoServer } from "@/lib/nango/server";

// POST - Create a connect session token for frontend auth
export async function POST(request: NextRequest) {
  try {
    const { connectionId } = await request.json();

    if (!connectionId) {
      return NextResponse.json({ error: "connectionId required" }, { status: 400 });
    }

    const nango = getNangoServer();
    
    // Create a connect session for the frontend
    const session = await nango.createConnectSession({
      end_user: {
        id: connectionId,
      },
    });

    return NextResponse.json({ sessionToken: session.data.token });
  } catch (error) {
    console.error("Failed to create session:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
  }
}

