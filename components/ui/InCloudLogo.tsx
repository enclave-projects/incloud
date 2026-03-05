interface InCloudLogoProps {
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export default function InCloudLogo({
  variant = "dark",
  size = "md",
}: InCloudLogoProps) {
  const textColor = variant === "light" ? "#EFF6FF" : "#0F172A";
  const iconBg =
    variant === "light" ? "rgba(59,130,246,0.2)" : "#EFF6FF";
  const iconStroke = variant === "light" ? "#93C5FD" : "#2563EB";

  const sizeMap = {
    sm: { icon: 22, text: "15px" },
    md: { icon: 28, text: "19px" },
    lg: { icon: 34, text: "23px" },
  };
  const s = sizeMap[size];

  return (
    <div className="flex items-center gap-2.5">
      {/* Cloud + upload-arrow icon */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill={iconBg} />
        {/* Cloud outline */}
        <path
          d="M10.5 22.5C8.01 22.5 6 20.49 6 18c0-2.21 1.63-4.04 3.77-4.42A6.001 6.001 0 0 1 21.5 15a3.5 3.5 0 1 1 0 7H10.5Z"
          stroke={iconStroke}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Upload arrow */}
        <path
          d="M16 20.5v-5M13.5 17.5 16 15l2.5 2.5"
          stroke={iconStroke}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: s.text,
          color: textColor,
          fontWeight: 600,
          letterSpacing: "-0.02em",
        }}
      >
        InCloud
      </span>
    </div>
  );
}
