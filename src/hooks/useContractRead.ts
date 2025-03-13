// Path: src/hooks/useContractRead.ts
import { useState, useCallback } from "react";

type ContractType = "gachas" | "heroes" | "levelingGame" | "endgame";

interface UseContractReadOptions {
  contract: ContractType;
  functionName: string;
  enabled?: boolean;
}

export function useContractRead<T = unknown>({
  contract,
  functionName,
  enabled = true,
}: UseContractReadOptions) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(
    async (args?: unknown[]) => {
      if (!enabled) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contract,
            functionName,
            args,
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.error || "Failed to read from contract");
        }

        setData(responseData.result as T);
        return responseData.result as T;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        console.error(`Error reading ${functionName} from ${contract}:`, err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [contract, functionName, enabled]
  );

  return {
    data,
    isLoading,
    error,
    execute,
  };
}
