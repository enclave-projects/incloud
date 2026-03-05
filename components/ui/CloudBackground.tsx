/**
 * CloudBackground — pure CSS-animated SVG panel for the auth left side.
 * No JavaScript needed; all motion is driven by globals.css keyframes.
 */
export default function CloudBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* ── Radial glow blobs ── */}
      <div
        className="absolute animate-pulse-glow"
        style={{
          width: 560,
          height: 560,
          top: -120,
          right: -160,
          background:
            "radial-gradient(circle, rgba(37,99,235,0.22) 0%, transparent 68%)",
          borderRadius: "50%",
        }}
      />
      <div
        className="absolute animate-pulse-glow"
        style={{
          width: 440,
          height: 440,
          bottom: -100,
          left: -120,
          background:
            "radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 68%)",
          borderRadius: "50%",
          animationDelay: "2.2s",
        }}
      />
      <div
        className="absolute animate-pulse-glow"
        style={{
          width: 300,
          height: 300,
          top: "40%",
          left: "30%",
          background:
            "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animationDelay: "1s",
        }}
      />

      {/* ── Scrolling dot grid ── */}
      <svg
        className="absolute animate-grid-drift"
        style={{
          top: -80,
          left: -80,
          width: "calc(100% + 120px)",
          height: "calc(100% + 120px)",
          opacity: 0.18,
        }}
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="ic-dot-grid"
            x="0"
            y="0"
            width="36"
            height="36"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.4" fill="rgba(147,197,253,0.8)" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#ic-dot-grid)" />
      </svg>

      {/* ── Network topology SVG ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 480 720"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* Connection lines */}
        <line x1="240" y1="290" x2="155" y2="370" stroke="rgba(147,197,253,0.18)" strokeWidth="1" />
        <line x1="240" y1="290" x2="325" y2="370" stroke="rgba(147,197,253,0.18)" strokeWidth="1" />
        <line x1="155" y1="370" x2="190" y2="460" stroke="rgba(147,197,253,0.13)" strokeWidth="1" />
        <line x1="325" y1="370" x2="290" y2="460" stroke="rgba(147,197,253,0.13)" strokeWidth="1" />
        <line x1="75"  y1="220" x2="155" y2="370" stroke="rgba(147,197,253,0.09)" strokeWidth="1" />
        <line x1="390" y1="210" x2="325" y2="370" stroke="rgba(147,197,253,0.09)" strokeWidth="1" />
        <line x1="190" y1="460" x2="130" y2="540" stroke="rgba(147,197,253,0.08)" strokeWidth="1" />
        <line x1="290" y1="460" x2="350" y2="540" stroke="rgba(147,197,253,0.08)" strokeWidth="1" />

        {/* Central node — pulsing */}
        <circle cx="240" cy="290" r="6"  fill="rgba(59,130,246,0.55)" className="animate-pulse-glow" />
        <circle cx="240" cy="290" r="14" fill="none" stroke="rgba(59,130,246,0.22)" strokeWidth="1" />
        <circle cx="240" cy="290" r="24" fill="none" stroke="rgba(59,130,246,0.11)" strokeWidth="1" />

        {/* Mid-tier nodes */}
        <circle cx="155" cy="370" r="5" fill="rgba(147,197,253,0.45)" className="animate-float-slow" />
        <circle cx="325" cy="370" r="5" fill="rgba(147,197,253,0.45)" className="animate-float-slow" style={{ animationDelay: "2s" }} />

        {/* Outer nodes */}
        <circle cx="190" cy="460" r="4" fill="rgba(147,197,253,0.3)" className="animate-float-medium" />
        <circle cx="290" cy="460" r="4" fill="rgba(147,197,253,0.3)" className="animate-float-medium" style={{ animationDelay: "3s" }} />
        <circle cx="75"  cy="220" r="4" fill="rgba(147,197,253,0.22)" className="animate-float-slow"    style={{ animationDelay: "1s" }} />
        <circle cx="390" cy="210" r="4" fill="rgba(147,197,253,0.22)" className="animate-float-medium"  style={{ animationDelay: "4.5s" }} />
        <circle cx="130" cy="540" r="3.5" fill="rgba(147,197,253,0.18)" className="animate-float-slow"  style={{ animationDelay: "0.5s" }} />
        <circle cx="350" cy="540" r="3.5" fill="rgba(147,197,253,0.18)" className="animate-float-medium" style={{ animationDelay: "2.5s" }} />

        {/* Decorative rings */}
        <circle cx="90"  cy="560" r="44" fill="none" stroke="rgba(147,197,253,0.07)" strokeWidth="1" className="animate-float-slow" />
        <circle cx="390" cy="500" r="58" fill="none" stroke="rgba(147,197,253,0.06)" strokeWidth="1" className="animate-float-medium" style={{ animationDelay: "1.5s" }} />
        <circle cx="45"  cy="140" r="32" fill="none" stroke="rgba(147,197,253,0.09)" strokeWidth="1" className="animate-float-medium" />

        {/* Accent tick-marks */}
        <line x1="18"  y1="600" x2="95"  y2="600" stroke="rgba(147,197,253,0.1)" strokeWidth="1" />
        <line x1="370" y1="560" x2="460" y2="560" stroke="rgba(147,197,253,0.1)" strokeWidth="1" />
        <line x1="18"  y1="96"  x2="72"  y2="96"  stroke="rgba(147,197,253,0.1)" strokeWidth="1" />
      </svg>
    </div>
  );
}
