// Path: src/lib/publicClient.ts
import { createPublicClient, http } from "viem";
import { abstractTestnet } from "viem/chains";

// Create a reusable public client for read operations
export const publicClient = createPublicClient({
  chain: abstractTestnet,
  transport: http(),
});
