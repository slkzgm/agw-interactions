// frontend/app/page.tsx
/**
 * full-path: frontend/app/page.tsx
 * Description: Default homepage route for Next.js (App Router)
 */
"use client";

import React from "react";
import { useLoginWithAbstract, useAbstractClient, useCreateSession } from "@abstract-foundation/agw-react";
import { useAccount } from "wagmi";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { parseEther, toFunctionSelector } from "viem";
import {LimitType, SessionConfig} from "@abstract-foundation/agw-client/sessions";
import {abstract} from 'viem/chains';

// The contract ABI
const contractAbi = [
    {
        type: "function",
        name: "publicMint",
        stateMutability: "payable",
        inputs: [
            { type: "address", name: "to" },
            { type: "uint64", name: "quantity" },
        ],
        outputs: [],
    },
] as const;

export default function HomePage() {
    // 1) Wagmi / Abstract Wallet
    const { login, logout } = useLoginWithAbstract();
    const { address, status } = useAccount();

    // 2) Retrieve AbstractClient (the SC wallet client)
    const { data: agwClient } = useAbstractClient(); // typed as AbstractClient | undefined

    // 3) Hook to create a session
    const { createSessionAsync, isPending: isSessionCreating } = useCreateSession();

    // 4) Store session config and private key in local React state
    const [sessionPrivateKey, setSessionPrivateKey] = React.useState<string | null>(null);
    const [sessionConfig, setSessionConfig] = React.useState<SessionConfig | null>(null);

    // ---- HANDLERS ----

    // A) Create the session
    async function handleCreateSession() {
        if (!agwClient) {
            alert("AGW Client is not connected.");
            return;
        }

        try {
            // Create a private key for the signer
            const privateKey = generatePrivateKey();
            const signerAccount = privateKeyToAccount(privateKey);

            // Create session
            const { session, transactionHash } = await createSessionAsync({
                session: {
                    signer: signerAccount.address,
                    // Expires in 24h
                    expiresAt: BigInt(Math.floor(Date.now() / 1000) + 60 * 60 * 24),
                    // Gas (fee) limit
                    feeLimit: {
                        limitType: LimitType.Lifetime,
                        limit: parseEther("0.05"),
                        period: BigInt(0),
                    },
                    // Allowed calls
                    callPolicies: [
                        {
                            target: "0xbB7086D31cFDdd26a1572a21114181e658503aEf",
                            selector: toFunctionSelector("publicMint(address,uint64)"),
                            valueLimit: {
                                limitType: LimitType.Lifetime,
                                limit: parseEther("0.05"),
                                period: BigInt(0),
                            },
                            maxValuePerUse: parseEther("0.05"),
                            constraints: [],
                        },
                    ],
                    // No direct transfers allowed
                    transferPolicies: [],
                },
            });

            console.log("Session created successfully:", session, "TxHash:", transactionHash);
            // Store them
            setSessionPrivateKey(privateKey);
            setSessionConfig(session);

            alert("Session created! Check console for details.");
        } catch (err: unknown) {
            console.error("Error creating session:", err);
            alert("Failed to create session.");
        }
    }

    // B) Use the session
    async function handleUseSession() {
        if (!agwClient || !sessionConfig || !sessionPrivateKey) {
            alert("No session key available. Please create the session first.");
            return;
        }

        try {
            // 1. Get a SessionClient from agwClient
            const sessionSigner = privateKeyToAccount(sessionPrivateKey as `0x${string}`);
            const sessionClient = agwClient.toSessionClient(sessionSigner, sessionConfig as SessionConfig);

            // 2. Use writeContract with the session key
            const txHash = await sessionClient.writeContract({
                account: address as `0x${string}`, // for eslint purpose
                chain: abstract, // for eslint purpose
                address: "0xbB7086D31cFDdd26a1572a21114181e658503aEf",
                abi: contractAbi,
                functionName: "publicMint",
                args: [address as `0x${string}`, 1n],
                value: parseEther("0.001"),
            });

            console.log("TX Sent via session key => ", txHash);
            alert(`TX Sent! Hash: ${txHash}`);
        } catch (err: unknown) {
            console.error("Error using session:", err);
            alert("Failed to use session key.");
        }
    }

    // ---- RENDER ----
    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
            <h1 className="text-3xl font-bold">Hello from Next.js + Tailwind!</h1>

            {/* Connect / Disconnect */}
            {status === "connected" ? (
                <>
                    <div>Connected with EOA: {address}</div>
                    <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded-lg">
                        Logout
                    </button>
                </>
            ) : (
                <button onClick={login} className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                    Login with Abstract
                </button>
            )}

            {/* Create Session button - only if connected */}
            {status === "connected" && (
                <button
                    onClick={handleCreateSession}
                    disabled={isSessionCreating}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                >
                    {isSessionCreating ? "Creating Session..." : "Create Session"}
                </button>
            )}

            {/* Use Session button - only if we have a session */}
            {sessionPrivateKey && sessionConfig && (
                <button
                    onClick={handleUseSession}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg"
                >
                    Use Session Key
                </button>
            )}
        </div>
    );
}