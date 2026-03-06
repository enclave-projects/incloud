"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { searchFiles } from "@/lib/files";
import type { FileCategory, ParsedVaultFile } from "@/lib/types";
import FileManager from "@/components/dashboard/FileManager";
import ErrorBoundary from "@/components/system/ErrorBoundary";

const ALL_CATEGORIES: FileCategory[] = ["video", "image", "audio", "3d", "doc", "archive", "lut", "unknown"];

function SearchContent() {
  const params = useSearchParams();
  const { user } = useAuth();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [selectedCats, setSelectedCats] = useState<FileCategory[]>([]);
  const [results, setResults] = useState<ParsedVaultFile[]>([]);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync query from URL params (e.g. navigating from TopBar search)
  useEffect(() => {
    const q = params.get("q");
    if (q !== null && q !== query) setQuery(q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const doSearch = useCallback(() => {
    if (!user) return;
    if (!query && selectedCats.length === 0) { setResults([]); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearching(true);
      searchFiles(user.$id, {
        query: query || undefined,
        categories: selectedCats.length > 0 ? selectedCats : undefined,
        limit: 50,
      })
        .then((res) => setResults(res.files))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 300);
  }, [user, query, selectedCats]);

  useEffect(() => {
    doSearch();
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [doSearch]);

  function toggleCat(cat: FileCategory) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <h1
        className="text-2xl font-semibold"
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
          placeholder="Search files by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery("")} style={{ color: "var(--dash-text-3)" }} aria-label="Clear search">
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
            {searching ? "Searching…" : `${results.length} result${results.length !== 1 ? "s" : ""}`}
          </p>
          <ErrorBoundary label="Search Results">
            <FileManager files={results} onMutate={doSearch} defaultView="list" showToolbar={false} />
          </ErrorBoundary>
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
