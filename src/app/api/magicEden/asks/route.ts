// Path: src/app/api/magicEeden/asks/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maker = searchParams.get("maker");
  const status = searchParams.get("status") || "active";

  // The collectionsSetId is pinned, or you could also get it from query
  const collectionsSetId =
    "d63e7e7a6f484b6bec8ffb0e67409a849e295b76e6eb257abe8cb58f10122da2";

  if (!maker) {
    return NextResponse.json(
      { error: "Missing 'maker' query param" },
      { status: 400 }
    );
  }

  // Construct the Magic Eden asks/v5 URL
  const url = new URL(
    "https://api-mainnet.magiceden.io/v3/rtp/abstract/orders/asks/v5"
  );
  url.searchParams.set("status", status);
  url.searchParams.set("maker", maker);
  url.searchParams.set("collectionsSetId", collectionsSetId);

  console.log("[asksRoute] Proxying GET to Magic Eden:", url.toString());

  // Server-to-server fetch => no CORS block
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json, text/plain, */*",
      "cache-control": "no-cache",
      pragma: "no-cache",
    },
  });

  if (!resp.ok) {
    return NextResponse.json(
      { error: `Magic Eden responded with status ${resp.status}` },
      { status: 500 }
    );
  }

  // Return JSON to the client
  const data = await resp.json();
  return NextResponse.json(data);
}
