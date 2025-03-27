import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const maker = searchParams.get("maker");
  const status = searchParams.get("status") || "active";

  if (!maker) {
    return NextResponse.json(
      { error: "Missing 'maker' param" },
      { status: 400 }
    );
  }

  const url = new URL(
    "https://api-mainnet.magiceden.dev/v3/rtp/abstract/orders/asks/v5"
  );
  url.searchParams.set("maker", maker);
  url.searchParams.set("status", status);
  // optionally, exclude EOA
  // url.searchParams.set("excludeEOA", "true");

  console.log(
    "[asksRoute] Proxying GET to official ME dev API:",
    url.toString()
  );

  // server-to-server fetch
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      accept: "application/json, text/plain, */*",
      // possibly user-agent, x-rkc-version, etc. if needed
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
        "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
    },
  });
  if (!resp.ok) {
    return NextResponse.json(
      { error: `Magic Eden responded with status ${resp.status}` },
      { status: 500 }
    );
  }

  const data = await resp.json();
  return NextResponse.json(data);
}
