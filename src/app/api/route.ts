// Path: src/app/api/read/route.ts
import { NextRequest, NextResponse } from "next/server";
import { publicClient } from "@/lib/publicClient";
import { GACHAS_ABI, GACHAS_CONTRACT_ADDRESS } from "@/lib/gachasConstants";
import { HEROES_ABI, HEROES_CONTRACT_ADDRESS } from "@/lib/heroesConstants";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import { ENDGAME_ABI, ENDGAME_CONTRACT_ADDRESS } from "@/lib/endgameConstants";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contract, functionName, args } = body;

    if (!contract || !functionName) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Map contract name to actual contract address and ABI
    let contractAddress;
    let abi;

    switch (contract) {
      case "gachas":
        contractAddress = GACHAS_CONTRACT_ADDRESS;
        abi = GACHAS_ABI;
        break;
      case "heroes":
        contractAddress = HEROES_CONTRACT_ADDRESS;
        abi = HEROES_ABI;
        break;
      case "levelingGame":
        contractAddress = CONTRACT_ADDRESS;
        abi = CONTRACT_ABI;
        break;
      case "endgame":
        contractAddress = ENDGAME_CONTRACT_ADDRESS;
        abi = ENDGAME_ABI;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid contract specified" },
          { status: 400 }
        );
    }

    // Execute the read operation
    const result = await publicClient.readContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName,
      args: args || [],
    });

    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error in read API route:", error);

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
