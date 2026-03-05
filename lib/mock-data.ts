// ─── Types ────────────────────────────────────────────────────────────────────

export type FileCategory =
  | "video"
  | "image"
  | "audio"
  | "3d"
  | "doc"
  | "archive"
  | "lut"
  | "unknown";

export interface VaultFile {
  id: string;
  name: string;
  extension: string;
  category: FileCategory;
  size: number; // bytes
  uploadedAt: string; // ISO
  modifiedAt: string; // ISO
  folder: string; // path
  tags: string[];
  isBackup: boolean;
  thumbnail?: string; // URL or null
  duration?: number; // seconds (video/audio)
  resolution?: string; // e.g. "4K", "1920×1080"
  isHLS?: boolean;
  hlsUrl?: string;
}

export interface VaultFolder {
  id: string;
  name: string;
  path: string;
  parent: string | null;
  createdAt: string;
  fileCount: number;
  totalSize: number; // bytes
  color?: string;
}

export interface StorageStats {
  vaultUsed: number;
  vaultTotal: number;
  backupUsed: number;
  backupTotal: number;
}

// ─── Storage Stats ─────────────────────────────────────────────────────────

export const STORAGE_STATS: StorageStats = {
  vaultUsed:   28_500_000_000, // 28.5 GB
  vaultTotal:  42_949_672_960, // 40 GB
  backupUsed:   6_200_000_000, // 6.2 GB
  backupTotal: 10_737_418_240, // 10 GB
};

// ─── Folders ───────────────────────────────────────────────────────────────

export const FOLDERS: VaultFolder[] = [
  { id: "f1", name: "Raw Footage",      path: "/Raw_Footage",      parent: null, createdAt: "2026-01-10T08:00:00Z", fileCount: 48, totalSize: 12_800_000_000, color: "#a78bfa" },
  { id: "f2", name: "Project Files",    path: "/Project_Files",    parent: null, createdAt: "2026-01-10T08:00:00Z", fileCount: 23, totalSize: 4_200_000_000,  color: "#22d3ee" },
  { id: "f3", name: "Rendered Outputs", path: "/Rendered_Outputs", parent: null, createdAt: "2026-01-12T09:00:00Z", fileCount: 31, totalSize: 8_900_000_000,  color: "#4ade80" },
  { id: "f4", name: "Reference Media",  path: "/Reference_Media",  parent: null, createdAt: "2026-01-15T10:00:00Z", fileCount: 15, totalSize: 1_400_000_000,  color: "#f472b6" },
  { id: "f5", name: "Textures & Assets",path: "/Textures_Assets",  parent: null, createdAt: "2026-01-15T10:00:00Z", fileCount: 62, totalSize: 3_100_000_000,  color: "#fb923c" },
  { id: "f6", name: "Sound Design",     path: "/Sound_Design",     parent: null, createdAt: "2026-01-20T11:00:00Z", fileCount: 19, totalSize: 850_000_000,    color: "#fbbf24" },
  { id: "f7", name: "Archive",          path: "/Archive",          parent: null, createdAt: "2026-02-01T08:00:00Z", fileCount: 7,  totalSize: 2_200_000_000,  color: "#64748b" },
];

// ─── Tags ──────────────────────────────────────────────────────────────────

export const ALL_TAGS = [
  "in-progress", "final", "archived", "review",
  "vfx-shot", "matte-painting", "motion-graphics", "color-grade",
  "4K", "1080p", "proxy", "full-resolution",
  "ProRes", "DNxHD", "H264",
  "project-atlas", "project-nova", "personal",
];

// ─── Files ─────────────────────────────────────────────────────────────────

export const RECENT_FILES: VaultFile[] = [
  {
    id: "file-01",
    name: "Atlas_SHot_041_comp_v07.mov",
    extension: "mov",
    category: "video",
    size: 2_847_300_000,
    uploadedAt: "2026-03-04T14:22:00Z",
    modifiedAt: "2026-03-04T14:22:00Z",
    folder: "/Rendered_Outputs",
    tags: ["final", "4K", "project-atlas"],
    isBackup: true,
    resolution: "4K",
    duration: 182,
    isHLS: true,
  },
  {
    id: "file-02",
    name: "Nova_BG_plate_raw_034.mp4",
    extension: "mp4",
    category: "video",
    size: 384_000_000,
    uploadedAt: "2026-03-03T10:05:00Z",
    modifiedAt: "2026-03-03T10:05:00Z",
    folder: "/Raw_Footage",
    tags: ["in-progress", "1080p", "project-nova"],
    isBackup: false,
    resolution: "1920×1080",
    duration: 46,
  },
  {
    id: "file-03",
    name: "Hero_comp_grade_final.aep",
    extension: "aep",
    category: "doc",
    size: 128_000_000,
    uploadedAt: "2026-03-02T16:40:00Z",
    modifiedAt: "2026-03-04T09:15:00Z",
    folder: "/Project_Files",
    tags: ["final", "color-grade", "project-atlas"],
    isBackup: true,
  },
  {
    id: "file-04",
    name: "env_hdri_golden_hour_16k.exr",
    extension: "exr",
    category: "image",
    size: 1_048_576_000,
    uploadedAt: "2026-03-01T11:30:00Z",
    modifiedAt: "2026-03-01T11:30:00Z",
    folder: "/Textures_Assets",
    tags: ["full-resolution"],
    isBackup: false,
    resolution: "16384×8192",
  },
  {
    id: "file-05",
    name: "atmo_wind_deep_forest.wav",
    extension: "wav",
    category: "audio",
    size: 92_000_000,
    uploadedAt: "2026-02-28T08:55:00Z",
    modifiedAt: "2026-02-28T08:55:00Z",
    folder: "/Sound_Design",
    tags: ["final"],
    isBackup: false,
    duration: 143,
  },
  {
    id: "file-06",
    name: "character_rig_main_v3.blend",
    extension: "blend",
    category: "3d",
    size: 412_000_000,
    uploadedAt: "2026-02-27T13:10:00Z",
    modifiedAt: "2026-03-01T17:20:00Z",
    folder: "/Project_Files",
    tags: ["in-progress", "project-atlas"],
    isBackup: false,
  },
  {
    id: "file-07",
    name: "LUT_Cinematic_Rec709_v2.cube",
    extension: "cube",
    category: "lut",
    size: 2_100_000,
    uploadedAt: "2026-02-25T09:00:00Z",
    modifiedAt: "2026-02-25T09:00:00Z",
    folder: "/Textures_Assets",
    tags: ["color-grade"],
    isBackup: false,
  },
  {
    id: "file-08",
    name: "project_atlas_assets_v2.zip",
    extension: "zip",
    category: "archive",
    size: 6_800_000_000,
    uploadedAt: "2026-02-20T15:00:00Z",
    modifiedAt: "2026-02-20T15:00:00Z",
    folder: "/Archive",
    tags: ["archived", "project-atlas"],
    isBackup: true,
  },
];

export const ALL_FILES: VaultFile[] = [
  ...RECENT_FILES,
  {
    id: "file-09",
    name: "ref_breakdown_spiderman_final.mp4",
    extension: "mp4",
    category: "video",
    size: 248_000_000,
    uploadedAt: "2026-02-18T12:00:00Z",
    modifiedAt: "2026-02-18T12:00:00Z",
    folder: "/Reference_Media",
    tags: ["review", "1080p"],
    isBackup: false,
    duration: 720,
  },
  {
    id: "file-10",
    name: "rock_texture_4k_albedo.png",
    extension: "png",
    category: "image",
    size: 48_000_000,
    uploadedAt: "2026-02-15T10:00:00Z",
    modifiedAt: "2026-02-15T10:00:00Z",
    folder: "/Textures_Assets",
    tags: ["full-resolution", "4K"],
    isBackup: false,
    resolution: "4096×4096",
  },
  {
    id: "file-11",
    name: "Atlas_SHot_012_comp_v03.mov",
    extension: "mov",
    category: "video",
    size: 1_200_000_000,
    uploadedAt: "2026-02-10T09:00:00Z",
    modifiedAt: "2026-02-10T09:00:00Z",
    folder: "/Rendered_Outputs",
    tags: ["review", "4K", "project-atlas"],
    isBackup: false,
    resolution: "4K",
    duration: 94,
    isHLS: true,
  },
  {
    id: "file-12",
    name: "color_grade_nova_ep1.drp",
    extension: "drp",
    category: "doc",
    size: 34_000_000,
    uploadedAt: "2026-02-08T14:00:00Z",
    modifiedAt: "2026-03-02T11:00:00Z",
    folder: "/Project_Files",
    tags: ["in-progress", "color-grade", "project-nova"],
    isBackup: false,
  },
];

// ─── Backup files ───────────────────────────────────────────────────────────

export const BACKUP_FILES = ALL_FILES.filter((f) => f.isBackup);
