"use client";

import { useEffect, useState } from "react";
import InCloudLogo from "@/components/ui/InCloudLogo";

export default function MobileBlock() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  if (!isMobile) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center px-8 text-center"
      style={{ background: "var(--dash-bg)" }}
    >
      <div className="mb-8">
        <InCloudLogo variant="light" size="md" />
      </div>

      {/* Desktop icon */}
      <div
        className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
        style={{ background: "var(--dash-accent-dim)", border: "1px solid rgba(59,130,246,0.2)" }}
      >
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none"
          stroke="var(--dash-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      </div>

      <h1
        className="text-xl font-semibold mb-3"
        style={{ color: "var(--dash-text)", fontFamily: "var(--font-display)" }}
      >
        Desktop Only
      </h1>
      <p
        className="text-sm leading-relaxed max-w-xs"
        style={{ color: "var(--dash-text-2)" }}
      >
        InCloud is designed for desktop use. Please open this site on a device
        with a screen width of at least 1024px for the best experience.
      </p>
    </div>
  );
}
