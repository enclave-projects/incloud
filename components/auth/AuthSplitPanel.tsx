import type { ReactNode } from "react";
import InCloudLogo from "@/components/ui/InCloudLogo";
import CloudBackground from "@/components/ui/CloudBackground";

interface AuthSplitPanelProps {
  /** Page-level heading shown on the right form panel */
  heading: string;
  /** Supporting sub-heading below the page heading */
  subheading: string;
  children: ReactNode;
}

const BRAND_FEATURES = [
  { label: "End-to-End", sub: "Encryption" },
  { label: "Zero", sub: "Third-party Access" },
  { label: "99.9%", sub: "Uptime" },
];

export default function AuthSplitPanel({
  heading,
  subheading,
  children,
}: AuthSplitPanelProps) {
  return (
    <div className="flex min-h-screen">
      {/* ═══════════════════════════════════════
          LEFT — Brand Panel (hidden on mobile)
      ═══════════════════════════════════════ */}
      <aside
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] relative overflow-hidden flex-col"
        style={{
          background:
            "linear-gradient(145deg, #0D1B2A 0%, #0F2744 48%, #152D55 100%)",
        }}
        aria-hidden="true"
      >
        <CloudBackground />

        <div className="relative z-10 flex flex-col justify-between h-full p-12 xl:p-16">
          {/* Logo */}
          <InCloudLogo variant="light" size="md" />

          {/* Hero copy */}
          <div className="max-w-sm">
            {/* Cloud icon badge */}
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mb-8"
              style={{
                background: "rgba(59,130,246,0.18)",
                border: "1px solid rgba(147,197,253,0.22)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M8.5 19C5.46 19 3 16.54 3 13.5c0-2.78 2.03-5.07 4.7-5.45A6.5 6.5 0 0 1 19.5 10c1.93 0 3.5 1.57 3.5 3.5S21.43 17 19.5 17"
                  stroke="rgba(147,197,253,0.85)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <path
                  d="M12 22V14M9.5 16.5 12 14l2.5 2.5"
                  stroke="rgba(147,197,253,0.85)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <h2
              style={{
                fontFamily: "var(--font-display)",
                color: "#EFF6FF",
                fontSize: "clamp(1.75rem, 2.4vw, 2.2rem)",
                fontWeight: 600,
                lineHeight: 1.25,
                letterSpacing: "-0.025em",
              }}
            >
              Your private cloud,
              <br />
              your rules.
            </h2>

            <p
              className="mt-4 text-base leading-relaxed"
              style={{ color: "rgba(148,180,220,0.8)" }}
            >
              All your files, secured and accessible only to you.
              No third-party access. No tracking. Just you and your data.
            </p>
          </div>

          {/* Bottom feature strip */}
          <div className="flex gap-8">
            {BRAND_FEATURES.map((f) => (
              <div key={f.sub}>
                <div
                  className="text-sm font-semibold"
                  style={{ color: "#93C5FD" }}
                >
                  {f.label}
                </div>
                <div
                  className="text-xs mt-0.5"
                  style={{ color: "rgba(148,180,220,0.55)" }}
                >
                  {f.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ═══════════════════════════════════════
          RIGHT — Form Panel
      ═══════════════════════════════════════ */}
      <main
        className="flex flex-1 flex-col items-center justify-center
                   px-6 py-12 sm:px-10 md:px-16"
        style={{ background: "#FFFFFF" }}
      >
        {/* Mobile-only logo */}
        <div className="lg:hidden mb-10">
          <InCloudLogo variant="dark" size="md" />
        </div>

        <div className="w-full max-w-[420px]">
          {/* Page heading — staggered fade-up */}
          <div
            className="mb-8 animate-fade-up"
            style={{ animationDelay: "0.08s" }}
          >
            <h1
              className="text-2xl font-semibold mb-1.5 tracking-tight"
              style={{
                fontFamily: "var(--font-display)",
                color: "#0F172A",
                letterSpacing: "-0.02em",
              }}
            >
              {heading}
            </h1>
            <p className="text-sm" style={{ color: "#64748B" }}>
              {subheading}
            </p>
          </div>

          {/* Form content */}
          <div className="animate-fade-up" style={{ animationDelay: "0.18s" }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
