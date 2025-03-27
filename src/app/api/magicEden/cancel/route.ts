import { NextResponse } from "next/server";

/**
 * POST /api/magicEden/cancel
 * Step: "cancel-v3", "cancel-signature", etc.
 * We call the official aggregator domain: "api-mainnet.magiceden.dev/v3/rtp/ethereum"
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const step = body.step as string | undefined;
  if (!step) {
    return NextResponse.json({ error: "Missing step" }, { status: 400 });
  }

  if (step === "cancel-v3") {
    // user passes { orderIds: [...] }
    const { orderIds } = body;
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid orderIds" },
        { status: 400 }
      );
    }

    // Official aggregator route:
    const url =
      "https://api-mainnet.magiceden.dev/v3/rtp/ethereum/execute/cancel/v3";
    console.log(
      "[cancelRoute] calling aggregator cancel/v3 with orderIds:",
      orderIds
    );

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ orderIds }),
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `ME aggregator responded with status ${resp.status}` },
        { status: 500 }
      );
    }
    const data = await resp.json();
    return NextResponse.json(data);
  }

  if (step === "cancel-signature") {
    // user passes { signature, endpoint, postBody }
    const { signature, endpoint, postBody } = body;
    if (!signature || !endpoint || !postBody) {
      return NextResponse.json(
        { error: "Missing 'signature', 'endpoint', or 'postBody'" },
        { status: 400 }
      );
    }

    // aggregator route for signature, e.g. "/execute/cancel-signature/v1?signature=..."
    const baseUrl = "https://api-mainnet.magiceden.dev/v3/rtp/ethereum";
    const finalUrl = `${baseUrl}${endpoint}?signature=${encodeURIComponent(signature)}`;

    console.log(
      "[cancelRoute] calling aggregator signature endpoint:",
      finalUrl
    );

    const resp = await fetch(finalUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
      },
      body: JSON.stringify(postBody),
    });

    if (!resp.ok) {
      return NextResponse.json(
        { error: `ME aggregator signature responded ${resp.status}` },
        { status: 500 }
      );
    }
    const data = await resp.json();
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: `Unknown step: ${step}` }, { status: 400 });
}
