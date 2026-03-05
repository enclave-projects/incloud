"use client";

import { useState } from "react";
import FileCard from "@/components/dashboard/FileCard";
import type { VaultFile } from "@/lib/mock-data";

type SortKey = "name" | "size" | "date";

interface FileGridProps {
  files: VaultFile[];
  view: "grid" | "list";
  onViewChange: (v: "grid" | "list") => void;
  showToolbar?: boolean;
}

export default function FileGrid({
  files,
  view,
  onViewChange,
  showToolbar = true,
}: FileGridProps) {
  const [sort, setSort] = useState<SortKey>("date");
  const [asc, setAsc] = useState(false);

  const sorted = [...files].sort((a, b) => {
    let cmp = 0;
    if (sort === "name") cmp = a.name.localeCompare(b.name);
    else if (sort === "size") cmp = a.size - b.size;
    else cmp = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    return asc ? cmp : -cmp;
  });

  function toggleSort(key: SortKey) {
    if (sort === key) setAsc((v) => !v);
    else { setSort(key); setAsc(false); }
  }

  const chevron = (key: SortKey) =>
    sort === key ? (asc ? " ↑" : " ↓") : "";

  return (
    <div className="flex flex-col gap-4">
      {/* Toolbar */}
      {showToolbar && (
        <div className="flex items-center justify-between gap-3">
          {/* File count */}
          <p className="text-sm" style={{ color: "var(--dash-text-2)" }}>
            {sorted.length} {sorted.length === 1 ? "file" : "files"}
          </p>

          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <select
              className="text-sm rounded-lg px-2 py-1.5 outline-none border sortDropdown"
              value={sort}
              onChange={(e) => toggleSort(e.target.value as SortKey)}
              aria-label="Sort files by"
            >
              <option value="date">Recent first</option>
              <option value="name">Name</option>
              <option value="size">Size</option>
            </select>

            {/* View toggle */}
            <div
              className="flex rounded-lg overflow-hidden"
              style={{ border: "1px solid var(--dash-border)" }}
            >
              {(["grid", "list"] as const).map((v) => (
                <button
                  key={v}
                  className="w-8 h-8 flex items-center justify-center transition-colors"
                  style={{
                    background: view === v ? "var(--dash-accent)" : "var(--dash-surface)",
                    color: view === v ? "#fff" : "var(--dash-text-2)",
                  }}
                  onClick={() => onViewChange(v)}
                  aria-label={`${v} view`}
                >
                  {v === "grid" ? (
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="0" y="0" width="6" height="6" rx="1"/>
                      <rect x="9" y="0" width="6" height="6" rx="1"/>
                      <rect x="0" y="9" width="6" height="6" rx="1"/>
                      <rect x="9" y="9" width="6" height="6" rx="1"/>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
                      <rect x="0" y="1" width="16" height="2" rx="1"/>
                      <rect x="0" y="6" width="16" height="2" rx="1"/>
                      <rect x="0" y="11" width="16" height="2" rx="1"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* List header */}
      {view === "list" && (
        <div className="flex items-center gap-4 px-4 text-xs select-none"
          style={{ color: "var(--dash-text-3)" }}>
          <div className="flex-1 flex gap-1 items-center cursor-pointer" onClick={() => toggleSort("name")}>
            Name{chevron("name")}
          </div>
          <div className="hidden lg:block w-36" />
          <button className="hidden sm:block text-xs w-20 text-right" onClick={() => toggleSort("size")}>
            Size{chevron("size")}
          </button>
          <button className="hidden md:block text-xs w-24 text-right" onClick={() => toggleSort("date")}>
            Modified{chevron("date")}
          </button>
          <div className="w-7" />
        </div>
      )}

      {/* Files */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
            stroke="var(--dash-text-3)" strokeWidth="1.5">
            <path d="M3 6h18M3 12h18M3 18h18"/>
          </svg>
          <p style={{ color: "var(--dash-text-3)" }}>No files found</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {sorted.map((f) => (
            <FileCard key={f.id} file={f} view="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-0.5">
          {sorted.map((f) => (
            <FileCard key={f.id} file={f} view="list" />
          ))}
        </div>
      )}
    </div>
  );
}
