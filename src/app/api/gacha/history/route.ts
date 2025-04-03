// Path: src/app/api/gacha/history/route.ts
import { NextResponse } from "next/server";

/**
 * API route to fetch user gacha history from the Gacha Game API
 * This acts as a proxy to avoid CORS issues
 */
export async function POST(request: Request) {
  try {
    // Parse the wallet address from the request body
    const body = await request.json();
    const { wallet } = body;

    if (!wallet || typeof wallet !== "string" || !wallet.startsWith("0x")) {
      return NextResponse.json(
        { error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    // Make the request to the Gacha Game API
    const response = await fetch(
      `https://api.gacha.game/api/play/my/${wallet}`,
      {
        method: "GET",
        headers: {
          Accept: "*/*",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      }
    );

    if (!response.ok) {
      console.error(`Gacha history API error: ${response.status}`);
      return NextResponse.json(
        { error: `Gacha API responded with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in Gacha history API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch gacha history" },
      { status: 500 }
    );
  }
}
