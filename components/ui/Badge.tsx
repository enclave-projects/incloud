interface BadgeProps {
  label: string;
  variant?: "default" | "blue" | "green" | "amber" | "red" | "purple";
}

const VARIANTS: Record<string, { bg: string; color: string }> = {
  default: { bg: "rgba(255,255,255,0.06)",  color: "#7b9abf" },
  blue:    { bg: "rgba(59,130,246,0.14)",    color: "#60a5fa" },
  green:   { bg: "rgba(74,222,128,0.12)",    color: "#4ade80" },
  amber:   { bg: "rgba(251,191,36,0.12)",    color: "#fbbf24" },
  red:     { bg: "rgba(239,68,68,0.12)",     color: "#f87171" },
  purple:  { bg: "rgba(167,139,250,0.14)",   color: "#a78bfa" },
};

export default function Badge({ label, variant = "default" }: BadgeProps) {
  const v = VARIANTS[variant];
  return (
    <span
      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium"
      style={{ background: v.bg, color: v.color }}
    >
      {label}
    </span>
  );
}
