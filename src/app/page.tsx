/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { useLoginWithAbstract, useAbstractClient } from "@abstract-foundation/agw-react";
import JsonParser from '@/components/JsonParser';

// 1) Define a type for your contract functions (simplified).
//    This helps avoid "any" in the function signature.
interface ContractFunctionItem {
    type: "function";
    name: string;
    stateMutability: "payable" | "view" | "nonpayable" | "pure";
    inputs?: Array<{
        name?: string;
        type: string;
    }>;
    outputs?: Array<{
        name?: string;
        type: string;
    }>;
}
const contractAbi = [
    {
        "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    { "inputs": [], "name": "AlreadyFulfilled", "type": "error" },
    { "inputs": [], "name": "AlreadyInitialized", "type": "error" },
    { "inputs": [], "name": "CallerIsNotOwnerOrDelegateWallet", "type": "error" },
    { "inputs": [], "name": "CoolDownPeriod", "type": "error" },
    { "inputs": [], "name": "InvalidLevelUpgradeType", "type": "error" },
    { "inputs": [], "name": "LevelUpgradeInProgress", "type": "error" },
    { "inputs": [], "name": "MaxLevelReached", "type": "error" },
    { "inputs": [], "name": "NewOwnerIsZeroAddress", "type": "error" },
    { "inputs": [], "name": "NoHandoverRequest", "type": "error" },
    { "inputs": [], "name": "NotActiveSeason", "type": "error" },
    { "inputs": [], "name": "NotAllowed", "type": "error" },
    { "inputs": [], "name": "NotEligible", "type": "error" },
    { "inputs": [], "name": "Paused", "type": "error" },
    { "inputs": [], "name": "RequestNotExist", "type": "error" },
    { "inputs": [], "name": "RequiresUnstakedForUpgrade", "type": "error" },
    { "inputs": [], "name": "Unauthorized", "type": "error" },
    { "inputs": [], "name": "Unpaused", "type": "error" },
    {
        "anonymous": false,
        "inputs": [{ "indexed": false, "internalType": "uint256[5]", "name": "percentags", "type": "uint256[5]" }],
        "name": "ChaosPercentageChanged",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "oldLevel", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "newLevel", "type": "uint256" }
        ],
        "name": "ChaosUpgraded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "Claimed",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "oldLevel", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "newLevel", "type": "uint256" }
        ],
        "name": "LuckyUpgraded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{ "indexed": true, "internalType": "address", "name": "pendingOwner", "type": "address" }],
        "name": "OwnershipHandoverCanceled",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [{ "indexed": true, "internalType": "address", "name": "pendingOwner", "type": "address" }],
        "name": "OwnershipHandoverRequested",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "oldOwner", "type": "address" },
            { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": false, "internalType": "address", "name": "owner", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "Staked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": false, "internalType": "address", "name": "owner", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }
        ],
        "name": "Unstaked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint8", "name": "levelUpType", "type": "uint8" }
        ],
        "name": "UpgradeRequested",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            { "indexed": true, "internalType": "address", "name": "user", "type": "address" },
            { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "oldLevel", "type": "uint256" },
            { "indexed": false, "internalType": "uint256", "name": "newLevel", "type": "uint256" }
        ],
        "name": "Upgraded",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "cancelOwnershipHandover",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256[]", "name": "ids", "type": "uint256[]" }],
        "name": "claimMany",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
        "name": "claimTime",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "pendingOwner", "type": "address" }],
        "name": "completeOwnershipHandover",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256[]", "name": "ids", "type": "uint256[]" }],
        "name": "emergencyUnstake",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "endSeasonTime",
        "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getChaosLevelPercentage",
        "outputs": [{ "internalType": "uint256[5]", "name": "result", "type": "uint256[5]" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
        "name": "getRewardsPerDay",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "isPaused",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "result", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "pendingOwner", "type": "address" }],
        "name": "ownershipHandoverExpiresAt",
        "outputs": [{ "internalType": "uint256", "name": "result", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256", "name": "requestId", "type": "uint256" },
            { "internalType": "uint256", "name": "randomNumber", "type": "uint256" }
        ],
        "name": "randomNumberCallback",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "requestOwnershipHandover",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256[5]", "name": "per", "type": "uint256[5]" }],
        "name": "setChaosLevelPercentage",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint64", "name": "flag", "type": "uint64" }],
        "name": "setFlag",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint64", "name": "startTimestamp", "type": "uint64" },
            { "internalType": "uint64", "name": "endTimestamp", "type": "uint64" }
        ],
        "name": "setParameter",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256", "name": "id", "type": "uint256" }],
        "name": "stakeI",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256[]", "name": "ids", "type": "uint256[]" }],
        "name": "stakeMany",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "startSeasonTime",
        "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "uint256[]", "name": "ids", "type": "uint256[]" }],
        "name": "unstakeMany",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            { "internalType": "uint256[]", "name": "ids", "type": "uint256[]" },
            { "internalType": "uint8", "name": "levelUpType", "type": "uint8" }
        ],
        "name": "upgradeMany",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [{ "internalType": "address", "name": "to", "type": "address" }],
        "name": "withdrawFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
] as const;

// 3) Contract address
const CONTRACT_ADDRESS = "0x06D7Ee1D50828Ca96e11890A1601f6fe61F1e584" as const;

export default function InteractPage() {
    const { login, logout } = useLoginWithAbstract();
    const { address, status } = useAccount();
    const { data: agwClient, isLoading } = useAbstractClient();

    if (!agwClient && isLoading) {
        return (
            <div className="p-4">
                <h1 className="text-2xl">Waiting for AbstractClient...</h1>
            </div>
        );
    }

    return (
        <div className="p-4 flex flex-col gap-6">
            <h1 className="text-3xl font-bold">Smart Contract Interaction</h1>

            <JsonParser />
            {/* Connect / Disconnect buttons */}
            {status === "connected" ? (
                <div className="flex items-center gap-4">
                    <div>Connected as: {address}</div>
                    <button onClick={logout} className="px-4 py-2 bg-red-500 text-white rounded">
                        Logout
                    </button>
                </div>
            ) : (
                <button onClick={login} className="px-4 py-2 bg-blue-600 text-white rounded">
                    Login with Abstract
                </button>
            )}

            {/* Render a form for each "function" in the ABI */}
            {status === "connected" && (
                <div className="flex flex-col gap-8">
                    {contractAbi
                        // Only functions
                        .filter((item) => item.type === "function")
                        // Type assertion: cast each item to `ContractFunctionItem`
                        .map((fn, idx) => {
                            // Because ABI is `readonly` objects, we do partial type-casting here:
                            const functionItem = fn as unknown as ContractFunctionItem;
                            return (
                                <FunctionForm
                                    key={idx}
                                    fn={functionItem}
                                    contractAddress={CONTRACT_ADDRESS}
                                    agwClient={agwClient}
                                />
                            );
                        })}
                </div>
            )}
        </div>
    );
}

// 4) Separate component to handle a single function's inputs/calls
function FunctionForm({
                          fn,
                          contractAddress,
                          agwClient,
                      }: {
    fn: ContractFunctionItem;             // Avoid using `any`
    contractAddress: `0x${string}`;       // Ensures a 0x... string
    agwClient: any;            // Imported from @abstract-foundation/agw-react
}) {
    const [inputValues, setInputValues] = useState<string[]>([]);
    const [valueEth, setValueEth] = useState<string>("0");
    // Store result in "unknown" to avoid the ESLint "any" complaint
    const [result, setResult] = useState<unknown>(null);

    const functionName = fn.name;
    const isReadOnly =
        fn.stateMutability === "view" || fn.stateMutability === "pure";
    const isPayable = fn.stateMutability === "payable";

    function handleInputChange(index: number, val: string) {
        const newInputs = [...inputValues];
        newInputs[index] = val;
        setInputValues(newInputs);
    }

    async function handleCall() {
        try {
            let parsedArgs: unknown[] = [];

            if (fn.inputs) {
                parsedArgs = fn.inputs.map((input, i) => {
                    const rawValue = inputValues[i] || "";

                    // If this is an array type (e.g. "uint256[]"), parse JSON
                    if (input.type.endsWith("[]")) {
                        const arr = JSON.parse(rawValue); // must be valid JSON array
                        if (!Array.isArray(arr)) {
                            throw new Error(
                                `Argument #${i}: Expected a JSON array string like [1,2,3].`
                            );
                        }
                        // If it's a numeric array, convert each item to BigInt
                        if (input.type.includes("uint") || input.type.includes("int")) {
                            return arr.map((x: number | string) => BigInt(x));
                        }
                        return arr;
                    }

                    // If this is a numeric type, parse as BigInt
                    if (input.type.includes("uint") || input.type.includes("int")) {
                        return BigInt(rawValue);
                    }

                    // Fallback: treat as string (e.g. address, bytes, etc.)
                    return rawValue;
                });
            }

            if (isReadOnly) {
                // readContract
                const response = await agwClient.readContract({
                    address: contractAddress,
                    abi: contractAbi,
                    functionName,
                    args: parsedArgs,
                });
                setResult(response);
                console.log("[READ] Function:", functionName, "args:", parsedArgs, "=>", response);
            } else {
                // writeContract
                let valueBigInt: bigint | undefined = undefined;
                if (isPayable && valueEth && valueEth !== "0") {
                    const floatVal = parseFloat(valueEth);
                    if (Number.isNaN(floatVal)) {
                        throw new Error(`Invalid ETH value: ${valueEth}`);
                    }
                    // Convert to wei
                    valueBigInt = BigInt(Math.floor(floatVal * 1e18));
                }

                const txHash = await agwClient.writeContract({
                    address: contractAddress,
                    abi: contractAbi,
                    functionName,
                    args: parsedArgs,
                    value: valueBigInt,
                });
                setResult(txHash);
                console.log("[WRITE] Function:", functionName, "args:", parsedArgs, "TxHash:", txHash);
            }
        } catch (error) {
            console.error("Error calling function:", error);
            setResult(String(error));
        }
    }

    return (
        <div className="border p-4 rounded">
            <h2 className="font-semibold mb-2">
                {functionName} ({isReadOnly ? "Read" : "Write"})
            </h2>

            {/* Render inputs */}
            {fn.inputs && fn.inputs.length > 0 && (
                <div className="flex flex-col gap-2">
                    {fn.inputs.map((input, i) => (
                        <div key={i} className="flex flex-col">
                            <label className="text-sm font-medium">
                                {input.name || `arg${i}`} ({input.type})
                            </label>
                            <input
                                className="border px-2 py-1"
                                placeholder={
                                    input.type.endsWith("[]")
                                        ? "Enter JSON array, e.g. [22,33]"
                                        : `Enter ${input.type}`
                                }
                                value={inputValues[i] || ""}
                                onChange={(e) => handleInputChange(i, e.target.value)}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* If payable, show an ETH value input */}
            {isPayable && (
                <div className="flex flex-col mt-2">
                    <label className="text-sm font-medium">Value (ETH)</label>
                    <input
                        className="border px-2 py-1"
                        placeholder="0.01"
                        value={valueEth}
                        onChange={(e) => setValueEth(e.target.value)}
                    />
                </div>
            )}

            <button
                onClick={handleCall}
                className="mt-3 px-4 py-2 bg-green-600 text-white rounded"
            >
                {isReadOnly ? "Read" : "Write"}
            </button>

            {/* Display the result (unknown) */}
            {result !== null && (
                <div className="mt-2 bg-gray-100 p-2 rounded text-sm break-words">
                    <strong>Result:</strong>{" "}
                    {typeof result === "object"
                        ? JSON.stringify(result)
                        : String(result)}
                </div>
            )}
        </div>
    );
}
