"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateUserName, updateUserProfile } from "@/lib/auth";
import { getUserSettings, updateUserSettings } from "@/lib/settings";
import type { UserSettings } from "@/lib/types";

interface SettingRow {
  label: string;
  description: string;
  control: React.ReactNode;
}

function Section({ title, rows }: { title: string; rows: SettingRow[] }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid var(--dash-border)", background: "var(--dash-surface)" }}
    >
      <div
        className="px-5 py-3.5"
        style={{ borderBottom: "1px solid var(--dash-border)" }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--dash-text-3)", letterSpacing: "0.08em", fontFamily: "var(--font-display)" }}
        >
          {title}
        </p>
      </div>
      <div className="divide-y" style={{ borderColor: "var(--dash-border)" }}>
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-6 px-5 py-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--dash-text)" }}>
                {row.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-3)" }}>
                {row.description}
              </p>
            </div>
            {row.control}
          </div>
        ))}
      </div>
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className="relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ background: on ? "var(--dash-accent)" : "var(--dash-border)" }}
      onClick={() => onChange(!on)}
      role="switch"
      aria-checked={on}
      aria-label="Toggle"
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: on ? "translateX(21px)" : "translateX(2px)" }}
      />
    </button>
  );
}

function Select({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Select option"
      className="text-sm rounded-xl px-3 py-1.5 outline-none"
      style={{
        background: "var(--dash-surface-2)",
        color: "var(--dash-text-2)",
        border: "1px solid var(--dash-border)",
      }}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export default function SettingsPage() {
  const { user, refresh } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [editName, setEditName] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);

  useEffect(() => { if (user) setEditName(user.name || ""); }, [user]);

  const saveName = async () => {
    if (!user || !editName.trim() || editName.trim() === user.name) {
      setNameEditing(false);
      return;
    }
    setNameSaving(true);
    try {
      await updateUserName(editName.trim());
      await updateUserProfile(user.$id, { name: editName.trim() }).catch(() => {});
      await refresh();
      setNameEditing(false);
    } catch {} finally { setNameSaving(false); }
  };

  useEffect(() => {
    if (!user) return;
    getUserSettings(user.$id).then(setSettings).catch(() => {});
  }, [user]);

  const save = (patch: Partial<UserSettings>) => {
    if (!settings) return;
    const updated = { ...settings, ...patch };
    setSettings(updated as UserSettings);
    setSaving(true);
    updateUserSettings(settings.$id, patch)
      .then((s) => setSettings(s))
      .catch(() => {})
      .finally(() => setSaving(false));
  };

  if (!settings) {
    return (
      <div className="p-6 max-w-2xl mx-auto flex items-center justify-center" style={{ minHeight: 200 }}>
        <p className="text-sm" style={{ color: "var(--dash-text-3)" }}>Loading settings…</p>
      </div>
    );
  }
  return (
    <div className="p-8 max-w-2xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-semibold"
            style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
          >
            Settings
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-3)" }}>
            Manage your InCloud preferences
          </p>
        </div>
        {saving && (
          <span className="text-xs px-2 py-1 rounded-lg" style={{ color: "var(--dash-accent)" }}>
            Saving…
          </span>
        )}
      </div>

      <Section
        title="Account"
        rows={[
          {
            label: "Display Name",
            description: "Your name shown across the platform",
            control: nameEditing ? (
              <div className="flex items-center gap-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") { setNameEditing(false); setEditName(user?.name || ""); } }}
                  className="text-sm rounded-xl px-3 py-1.5 outline-none w-44"
                  style={{ color: "var(--dash-text)", background: "var(--dash-surface-2)", border: "1px solid var(--dash-accent)" }}
                  aria-label="Display name"
                  autoFocus
                />
                <button
                  onClick={saveName}
                  disabled={nameSaving}
                  className="text-xs px-3 py-1.5 rounded-xl font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
                  style={{ background: "var(--dash-accent)", color: "#fff" }}
                >
                  {nameSaving ? "…" : "Save"}
                </button>
                <button
                  onClick={() => { setNameEditing(false); setEditName(user?.name || ""); }}
                  className="text-xs px-2 py-1.5 rounded-xl"
                  style={{ color: "var(--dash-text-3)" }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setNameEditing(true)}
                className="text-sm rounded-xl px-3 py-1.5 transition-colors hover:opacity-80 cursor-pointer"
                style={{ color: "var(--dash-text)", background: "var(--dash-surface-2)", border: "1px solid var(--dash-border)" }}
                title="Click to edit"
              >
                {user?.name || "—"}
              </button>
            ),
          },
          {
            label: "Email",
            description: "Used for login and notifications",
            control: (
              <span
                className="text-sm rounded-xl px-3 py-1.5"
                style={{ color: "var(--dash-text)", background: "var(--dash-surface-2)", border: "1px solid var(--dash-border)" }}
              >
                {user?.email || "—"}
              </span>
            ),
          },
        ]}
      />

      <Section
        title="Storage"
        rows={[
          {
            label: "Auto-backup new files",
            description: "Automatically mark uploaded files for backup",
            control: <Toggle on={settings.auto_backup} onChange={(v) => save({ auto_backup: v })} />,
          },
          {
            label: "Compression on upload",
            description: "Losslessly compress compatible files on upload",
            control: <Toggle on={settings.compression} onChange={(v) => save({ compression: v })} />,
          },
          {
            label: "Storage warning threshold",
            description: "Show warning when vault usage reaches",
            control: (
              <Select
                options={["70", "75", "80", "85", "90"]}
                value={String(settings.warning_threshold)}
                onChange={(v) => save({ warning_threshold: parseInt(v, 10) })}
              />
            ),
          },
        ]}
      />

      <Section
        title="Preview"
        rows={[
          {
            label: "Video preview quality",
            description: "Resolution for in-browser video previews",
            control: (
              <Select
                options={["360p", "480p", "720p", "1080p"]}
                value={settings.video_quality}
                onChange={(v) => save({ video_quality: v })}
              />
            ),
          },
          {
            label: "Show EXIF data",
            description: "Display metadata panel in image preview",
            control: <Toggle on={settings.show_exif} onChange={(v) => save({ show_exif: v })} />,
          },
        ]}
      />

      <Section
        title="About"
        rows={[
          {
            label: "InCloud Version",
            description: "Private cloud storage platform",
            control: (
              <span className="text-xs px-2 py-1 rounded-lg"
                style={{ background: "var(--dash-surface-2)", color: "var(--dash-text-3)" }}>
                v1.0.0-beta
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
