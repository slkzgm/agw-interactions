/* eslint-disable @typescript-eslint/no-explicit-any */
// Path: src/app/actions.ts
"use server";

import { publicClient } from "@/lib/publicClient";
import { GACHAS_ABI, GACHAS_CONTRACT_ADDRESS } from "@/lib/gachasConstants";
import { HEROES_ABI, HEROES_CONTRACT_ADDRESS } from "@/lib/heroesConstants";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/lib/constants";
import { ENDGAME_ABI, ENDGAME_CONTRACT_ADDRESS } from "@/lib/endgameConstants";

type ReadContractResult = {
  success: boolean;
  result?: unknown;
  error?: string;
};

type ReadDynamicContractResult = {
  success: boolean;
  data?: unknown;
  error?: string;
};

/**
 * Server action to read data from predefined contracts.
 * Replaces the API route functionality.
 */
export async function readContract(
  contract: string,
  functionName: string,
  args: unknown[] = [] // Using unknown[] instead of any[]
): Promise<ReadContractResult> {
  try {
    // Map contract name to the actual contract address and ABI.
    let contractAddress: string;
    let abi: unknown[];

    switch (contract) {
      case "gachas":
        contractAddress = GACHAS_CONTRACT_ADDRESS;
        abi = [...GACHAS_ABI]; // Convert readonly ABI to mutable array
        break;
      case "heroes":
        contractAddress = HEROES_CONTRACT_ADDRESS;
        abi = [...HEROES_ABI];
        break;
      case "levelingGame":
        contractAddress = CONTRACT_ADDRESS;
        abi = [...CONTRACT_ABI];
        break;
      case "endgame":
        contractAddress = ENDGAME_CONTRACT_ADDRESS;
        abi = [...ENDGAME_ABI];
        break;
      default:
        throw new Error("Invalid contract specified");
    }

    // Process BigInt strings back to BigInt if needed.
    const processedArgs = args.map((arg) => {
      // Handle BigInt serialized as a string with an 'n' suffix.
      if (typeof arg === "string" && /^\d+n$/.test(arg)) {
        return BigInt(arg.slice(0, -1));
      }
      // Handle numeric strings that should be converted to BigInt.
      if (typeof arg === "string" && /^\d+$/.test(arg) && arg.length > 15) {
        return BigInt(arg);
      }
      return arg;
    });

    // Bypass ABI-specific type-checking by casting the parameter to any.
    const result = await (publicClient as any).readContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName, // Passed as string
      args: processedArgs,
    } as any);

    // Convert BigInt values to strings for serialization.
    const serializedResult = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return { success: true, result: serializedResult };
  } catch (error) {
    console.error("Error in read contract action:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server action for the dynamic contract explorer.
 * Allows reading from any contract with its ABI.
 */
export async function readDynamicContract(
  contractAddress: string,
  abi: unknown[], // Using unknown[] instead of any[]
  functionName: string,
  args: unknown[] = [] // Using unknown[] instead of any[]
): Promise<ReadDynamicContractResult> {
  try {
    // Validate inputs.
    if (!contractAddress || !contractAddress.startsWith("0x")) {
      throw new Error("Invalid contract address");
    }
    if (!functionName) {
      throw new Error("Function name is required");
    }
    if (!Array.isArray(abi) || abi.length === 0) {
      throw new Error("Valid ABI array is required");
    }

    // Process BigInt strings back to BigInt if needed.
    const processedArgs = args.map((arg) => {
      if (Array.isArray(arg)) {
        return arg.map((item) => {
          if (typeof item === "string" && /^\d+n$/.test(item)) {
            return BigInt(item.slice(0, -1));
          }
          if (
            typeof item === "string" &&
            /^\d+$/.test(item) &&
            item.length > 15
          ) {
            return BigInt(item);
          }
          return item;
        });
      }
      if (typeof arg === "string" && /^\d+n$/.test(arg)) {
        return BigInt(arg.slice(0, -1));
      }
      if (typeof arg === "string" && /^\d+$/.test(arg) && arg.length > 15) {
        return BigInt(arg);
      }
      return arg;
    });

    // Bypass ABI-specific type-checking by casting the parameter to any.
    const result = await (publicClient as any).readContract({
      address: contractAddress as `0x${string}`,
      abi,
      functionName,
      args: processedArgs,
    } as any);

    const serializedResult = JSON.parse(
      JSON.stringify(result, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    );

    return { success: true, data: serializedResult };
  } catch (error) {
    console.error(`Error reading dynamic contract ${functionName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
