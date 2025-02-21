/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

// JSON Parser Component
export default function JsonParser() {
    const [jsonInput, setJsonInput] = useState("");
    const [allIds, setAllIds] = useState<string[]>([]);
    const [stakedIds, setStakedIds] = useState<string[]>([]);
    const [unstakedIds, setUnstakedIds] = useState<string[]>([]);

    function parseJson() {
        try {
            const data = JSON.parse(jsonInput);
            const all = Array.isArray(data?.heroes?.items)
                ? data.heroes.items.map((item: any) => item.id)
                : [];
            const staked = Array.isArray(data?.stakedHeroes)
                ? data.stakedHeroes.map((item: any) => item.id)
                : [];
            const unstaked = Array.isArray(data?.unstakedHeroes)
                ? data.unstakedHeroes.map((item: any) => item.id)
                : [];
            setAllIds(all);
            setStakedIds(staked);
            setUnstakedIds(unstaked);
        } catch (error) {
            alert("Invalid JSON");
            console.log(error);
        }
    }

    return (
        <div className="p-4 border rounded mb-4">
            <h2 className="text-xl font-bold mb-2">Paste JSON Data</h2>
            <textarea
                className="w-full border p-2 mb-2"
                rows={10}
                placeholder='{"address": "...", "s1TotalClaimed": 1254, ... }'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
            />
            <button onClick={parseJson} className="px-4 py-2 bg-blue-500 text-white rounded">
                Parse JSON
            </button>
            {allIds.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold">All Token IDs:</h3>
                    <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(allIds, null, 2)}</pre>
                </div>
            )}
            {stakedIds.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold">Staked Token IDs:</h3>
                    <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(stakedIds, null, 2)}</pre>
                </div>
            )}
            {unstakedIds.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold">Unstaked Token IDs:</h3>
                    <pre className="bg-gray-100 p-2 rounded">{JSON.stringify(unstakedIds, null, 2)}</pre>
                </div>
            )}
        </div>
    );
}