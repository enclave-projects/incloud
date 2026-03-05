import type { FileCategory } from "@/lib/mock-data";

interface FileTypeIconProps {
  category: FileCategory;
  size?: number;
}

const META: Record<
  FileCategory,
  { color: string; bg: string; path: string }
> = {
  video: {
    color: "var(--ft-video)",
    bg: "var(--ft-video-bg)",
    path: "M15 10l4.553-2.277A1 1 0 0 1 21 8.649v6.702a1 1 0 0 1-1.447.894L15 14M4 8a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z",
  },
  image: {
    color: "var(--ft-image)",
    bg: "var(--ft-image-bg)",
    path: "M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 3h18M3 21h18M3 3v18M21 3v18M9 9h.008v.008H9V9Z",
  },
  audio: {
    color: "var(--ft-audio)",
    bg: "var(--ft-audio-bg)",
    path: "M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 1 1-.99-3.467l2.31-.66a2.25 2.25 0 0 0 1.632-2.163Zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 0 1-1.632 2.163l-1.32.377a1.803 1.803 0 0 1-.99-3.467l2.31-.66A2.25 2.25 0 0 0 9 15.553Z",
  },
  "3d": {
    color: "var(--ft-3d)",
    bg: "var(--ft-3d-bg)",
    path: "M21 7.5l-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  },
  doc: {
    color: "var(--ft-doc)",
    bg: "var(--ft-doc-bg)",
    path: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
  },
  archive: {
    color: "var(--ft-archive)",
    bg: "var(--ft-arc-bg)",
    path: "M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z",
  },
  lut: {
    color: "var(--ft-lut)",
    bg: "var(--ft-lut-bg)",
    path: "M4.098 19.902a3.75 3.75 0 0 0 5.304 0l6.401-6.402M6.75 21A3.75 3.75 0 0 1 3 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 0 0 3.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88",
  },
  unknown: {
    color: "var(--ft-unk)",
    bg: "var(--ft-unk-bg)",
    path: "M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z",
  },
};

export default function FileTypeIcon({ category, size = 20 }: FileTypeIconProps) {
  const m = META[category] ?? META.unknown;
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center rounded-lg"
      style={{
        width: size + 12,
        height: size + 12,
        background: m.bg,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={m.color}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={m.path} />
      </svg>
    </div>
  );
}

export { META as fileTypeMeta };
