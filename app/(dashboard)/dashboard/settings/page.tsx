import type { Metadata } from "next";

export const metadata: Metadata = { title: "Settings — InCloud" };

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

function Toggle({ defaultOn = false }: { defaultOn?: boolean }) {
  return (
    <div
      className="relative w-10 h-5 rounded-full transition-colors cursor-pointer flex-shrink-0"
      style={{ background: defaultOn ? "var(--dash-accent)" : "var(--dash-border)" }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ transform: defaultOn ? "translateX(21px)" : "translateX(2px)" }}
      />
    </div>
  );
}

function Select({ options, value }: { options: string[]; value: string }) {
  return (
    <select
      defaultValue={value}
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
  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1
          className="text-xl font-semibold"
          style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
        >
          Settings
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-3)" }}>
          Manage your InCloud preferences
        </p>
      </div>

      <Section
        title="Account"
        rows={[
          {
            label: "Display Name",
            description: "Your name shown across the platform",
            control: (
              <input
                defaultValue="Pranjal Sharma"
                className="text-sm rounded-xl px-3 py-1.5 outline-none w-44"
                style={{
                  background: "var(--dash-surface-2)",
                  color: "var(--dash-text)",
                  border: "1px solid var(--dash-border)",
                }}
              />
            ),
          },
          {
            label: "Email",
            description: "Used for login and notifications",
            control: (
              <input
                defaultValue="pranjal@incloud.local"
                className="text-sm rounded-xl px-3 py-1.5 outline-none w-44"
                style={{
                  background: "var(--dash-surface-2)",
                  color: "var(--dash-text)",
                  border: "1px solid var(--dash-border)",
                }}
              />
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
            control: <Toggle />,
          },
          {
            label: "Compression on upload",
            description: "Losslessly compress compatible files on upload",
            control: <Toggle />,
          },
          {
            label: "Storage warning threshold",
            description: "Show warning when vault usage reaches",
            control: <Select options={["70%", "75%", "80%", "85%", "90%"]} value="80%" />,
          },
        ]}
      />

      <Section
        title="Preview"
        rows={[
          {
            label: "Video preview quality",
            description: "Resolution for in-browser video previews",
            control: <Select options={["360p", "480p", "720p", "1080p"]} value="720p" />,
          },
          {
            label: "Show EXIF data",
            description: "Display metadata panel in image preview",
            control: <Toggle defaultOn />,
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
