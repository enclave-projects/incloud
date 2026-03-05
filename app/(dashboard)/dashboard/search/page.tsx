"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ALL_FILES } from "@/lib/mock-data";
import type { FileCategory } from "@/lib/mock-data";
import FileGrid from "@/components/dashboard/FileGrid";

const ALL_CATEGORIES: FileCategory[] = ["video", "image", "audio", "3d", "doc", "archive", "lut", "unknown"];

function SearchContent() {
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selectedCats, setSelectedCats] = useState<FileCategory[]>([]);
  const [view, setView] = useState<"grid" | "list">("list");

  const results = ALL_FILES.filter((f) => {
    const q = query.toLowerCase();
    const matchesQ = !q || f.name.toLowerCase().includes(q) || f.folder?.toLowerCase().includes(q) || false;
    const matchesCat = selectedCats.length === 0 || selectedCats.includes(f.category);
    return matchesQ && matchesCat;
  });

  function toggleCat(cat: FileCategory) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <h1
        className="text-xl font-semibold"
        style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
      >
        Search
      </h1>

      {/* Search input */}
      <div
        className="flex items-center gap-3 rounded-xl px-4 py-3"
        style={{ background: "var(--dash-surface)", border: "1px solid var(--dash-border)" }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="var(--dash-text-3)" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--dash-text)", fontFamily: "var(--font-body)" }}
          placeholder="Search files by name or folder…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ color: "var(--dash-text-3)" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        {ALL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="text-xs px-3 py-1.5 rounded-full capitalize transition-all"
            style={{
              background: selectedCats.includes(cat) ? "var(--dash-accent)" : "var(--dash-surface)",
              color: selectedCats.includes(cat) ? "#fff" : "var(--dash-text-2)",
              border: `1px solid ${selectedCats.includes(cat) ? "var(--dash-accent)" : "var(--dash-border)"}`,
            }}
            onClick={() => toggleCat(cat)}
          >
            {cat}
          </button>
        ))}
        {selectedCats.length > 0 && (
          <button
            className="text-xs px-3 py-1.5 rounded-full"
            style={{ color: "var(--dash-text-3)" }}
            onClick={() => setSelectedCats([])}
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {query || selectedCats.length > 0 ? (
        <div>
          <p className="text-xs mb-4" style={{ color: "var(--dash-text-3)" }}>
            {results.length} result{results.length !== 1 ? "s" : ""}
          </p>
          <FileGrid files={results} view={view} onViewChange={setView} showToolbar={false} />
        </div>
      ) : (
        <p className="text-sm" style={{ color: "var(--dash-text-3)" }}>
          Start typing to search your vault…
        </p>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
