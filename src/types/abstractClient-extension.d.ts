// Path: src/types/abstractClient-extension.d.ts
import { CONTRACT_ABI } from "@/lib/constants";

declare module "@abstract-foundation/agw-client" {
  interface AbstractClient {
    /**
     * Reads data from a smart contract.
     */
    readContract(params: {
      address: `0x${string}`;
      abi: typeof CONTRACT_ABI;
      functionName: string;
      args: unknown[];
    }): Promise<unknown>;

    /**
     * Writes data to a smart contract.
     */
    writeContract(params: {
      address: `0x${string}`;
      abi: typeof CONTRACT_ABI;
      functionName: string;
      args: unknown[];
      value?: bigint;
    }): Promise<unknown>;
  }
}
