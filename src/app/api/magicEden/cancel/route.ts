// Path: src/app/api/magicEden/cancel/route.ts
import { NextResponse } from "next/server";

/**
 * POST /api/magicEden/cancel
 * Body example: { step: "cancel-v3", orderIds: [...], signature: "...", postUrl: "...", etc. }
 *
 * We handle two major scenarios:
 * 1) request "steps" from /execute/cancel/v3
 * 2) post signature to /execute/cancel-signature/v1
 * 3) Or even handle the "transaction" step from server if you want.
 *    But typically you only need to do aggregator calls from the server side.
 *
 * The client provides any needed info in the request body. This route fetches Magic Eden aggregator,
 * returns the aggregator's JSON to the client.
 *
 * Note: This is a minimal example. You can customize to handle multiple steps carefully.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const step = body.step as string | undefined;
  if (!step) {
    return NextResponse.json(
      { error: "Missing 'step' in request body" },
      { status: 400 }
    );
  }

  // Step 1: "cancel-v3" => aggregator's /v3/rtp/abstract/execute/cancel/v3
  if (step === "cancel-v3") {
    const { orderIds } = body;
    if (!Array.isArray(orderIds)) {
      return NextResponse.json(
        { error: "Invalid or missing 'orderIds'" },
        { status: 400 }
      );
    }

    const url =
      "https://api-mainnet.magiceden.io/v3/rtp/abstract/execute/cancel/v3";
    console.log("[cancelRoute] Proxying cancel-v3 with orderIds:", orderIds);

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/plain, */*",
        "x-rkc-version": "2.5.4",
        "cache-control": "no-cache",
        pragma: "no-cache",
      },
      body: JSON.stringify({ orderIds }),
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Magic Eden /cancel/v3 responded ${resp.status}` },
        { status: 500 }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  }

  // Step 2: "cancel-signature" => aggregator's /execute/cancel-signature/v1?signature=...
  if (step === "cancel-signature") {
    const { signature, postBody, endpoint } = body;
    if (!signature || !postBody || !endpoint) {
      return NextResponse.json(
        {
          error:
            "Missing 'signature', 'postBody', or 'endpoint' in request body",
        },
        { status: 400 }
      );
    }

    // e.g. endpoint = "/execute/cancel-signature/v1"
    const baseUrl = "https://api-mainnet.magiceden.io/v3/rtp/abstract";
    const queryParams = new URLSearchParams({ signature });
    const finalUrl = `${baseUrl}${endpoint}?${queryParams}`;

    console.log("[cancelRoute] Proxying cancel-signature to:", finalUrl);

    const resp = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/plain, */*",
        "x-rkc-version": "2.5.4",
      },
      body: JSON.stringify(postBody),
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `Magic Eden /cancel-signature responded ${resp.status}` },
        { status: 500 }
      );
    }

    const data = await resp.json();
    return NextResponse.json(data);
  }

  // If not recognized
  return NextResponse.json(
    { error: `Unknown step '${step}'` },
    { status: 400 }
  );
}
