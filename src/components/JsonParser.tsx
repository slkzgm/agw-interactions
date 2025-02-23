// Path: src/components/JsonParser.tsx
"use client";

import React, { useState } from "react";

interface ParsedData {
  id: string;
}

export function JsonParser() {
  const [jsonInput, setJsonInput] = useState<string>("");
  const [allIds, setAllIds] = useState<string[]>([]);
  const [stakedIds, setStakedIds] = useState<string[]>([]);
  const [unstakedIds, setUnstakedIds] = useState<string[]>([]);

  function parseJson() {
    try {
      const data = JSON.parse(jsonInput);

      const all = Array.isArray(data?.heroes?.items)
        ? data.heroes.items.map((item: ParsedData) => item.id)
        : [];

      const staked = Array.isArray(data?.stakedHeroes)
        ? data.stakedHeroes.map((item: ParsedData) => item.id)
        : [];

      const unstaked = Array.isArray(data?.unstakedHeroes)
        ? data.unstakedHeroes.map((item: ParsedData) => item.id)
        : [];

      setAllIds(all);
      setStakedIds(staked);
      setUnstakedIds(unstaked);
    } catch (error) {
      console.error("JSON parsing error:", error);
    }
  }

  function IdList({ title, ids }: { title: string; ids: string[] }) {
    if (ids.length === 0) return null;

    return (
      <div className="space-y-2 pt-4">
        <h3 className="font-semibold">{title}</h3>
        <pre className="bg-card border border-border p-3 rounded-lg overflow-x-auto text-sm">
          {JSON.stringify(ids, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">JSON Parser</h2>
          <p className="text-muted">Parse your hero data here</p>
        </div>

        <textarea
          placeholder='{"address": "...", "s1TotalClaimed": 1254, ... }'
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          className="w-full min-h-32 p-3 bg-background border border-border rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />

        <button
          onClick={parseJson}
          className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
        >
          Parse JSON
        </button>

        {(allIds.length > 0 ||
          stakedIds.length > 0 ||
          unstakedIds.length > 0) && (
          <div className="mt-4 space-y-4 divide-y divide-border">
            <IdList title="All Token IDs" ids={allIds} />
            <IdList title="Staked Token IDs" ids={stakedIds} />
            <IdList title="Unstaked Token IDs" ids={unstakedIds} />
          </div>
        )}
      </div>
    </div>
  );
}
