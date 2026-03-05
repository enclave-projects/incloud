# VFX File Management Platform - Product Requirements Document

**Document Version:** 1.0  
**Last Updated:** March 5, 2026  
**Owner:** Pranjal Sharma  
**Status:** Ready for Development

---

## 1. Executive Summary

**Project Name:** VFX Vault  
**Platform Type:** Self-Hosted File Management & Organization System  
**Tech Stack:** Next.js (Frontend) + Appwrite (Backend) + ExCloud VM (Infrastructure)  
**Primary User:** Single user (Pranjal Sharma - VFX artist & student at AAFT)

**Core Purpose:** Create a private, organized, and searchable file management system for VFX production assets, enabling efficient storage, retrieval, backup, and preview of all media types (raw footage, project files, rendered outputs, reference media, textures, sound design, etc.) in one consolidated platform.

**Why This Matters:** VFX workflows generate massive amounts of heterogeneous files. This platform centralizes them with hybrid organization (folders + tags), intelligent search, and critical backup tracking—all privately hosted on your infrastructure.

---

## 2. Product Vision & Philosophy

### 2.1 Vision Statement
Build a **minimalist, Apple-style, single-user VFX asset vault** that is:
- **Private & Autonomous:** Self-hosted on your ExCloud VM, zero external dependencies
- **Organized:** Hybrid folder + tag system for intuitive file discovery
- **Intelligent:** Full-text search + advanced filters (date, format, size, project, tags)
- **Preview-Rich:** Streaming video playback (HLS for large files, HTML5 for small), image galleries, metadata viewers
- **Backup-Smart:** Manual backup marking with 10GB vault, restore functionality
- **Storage-Aware:** Real-time disk usage tracking with capacity warnings

### 2.2 Design Philosophy
- **Minimalist & Clean:** Apple-inspired aesthetic with plenty of whitespace
- **Dark Mode Default:** Professional, eye-friendly interface for long work sessions
- **Single-User Focus:** No collaboration overhead, optimized for solo workflows
- **Vibecoding-Ready:** Designed to be built primarily via prompts with minimal manual code

### 2.3 What You DON'T Want
- ❌ Full version control / multi-version history (too much storage bloat)
- ❌ Collaboration features (not multi-user)
- ❌ Complex metadata inheritance or AI-powered auto-tagging (keep it simple)
- ❌ Folder-only or tag-only organization (hybrid is key)
- ❌ External cloud storage dependencies (self-hosted only)

---

## 3. Core Features

### 3.1 Phase 1 Features (MVP - All in Launch)

#### 3.1.1 File Upload & Management
- **Drag-and-drop upload** to current folder or bulk upload multiple files
- **File types supported:** All VFX-related formats (video: MP4, MOV, ProRes, DNxHD; images: PNG, JPG, EXR, TIFF; audio: WAV, MP3; project files: AEP, DaVinci, BLEND, etc.; archives: ZIP, RAR)
- **File metadata captured:** Filename, file size, MIME type, upload date, modification date, folder path, tags
- **Delete functionality:** Soft delete (move to trash) or permanent delete with confirmation
- **Move/Copy files:** Between folders while preserving metadata

#### 3.1.2 Hybrid Organization System
**Folder Structure (Traditional Hierarchy):**
- Create/edit/delete folders
- Nested folder support (unlimited depth, but UI shows breadcrumb)
- Suggested folder structure:
  ```
  /Vault/
    ├── Raw_Footage/
    │   ├── [Project_Name]/
    │   └── [Asset_Type]/
    ├── Project_Files/
    │   ├── After_Effects/
    │   ├── DaVinci/
    │   └── Blender/
    ├── Rendered_Outputs/
    │   ├── [Project_Name]/
    │   └── [Quality_Tier]/
    ├── Reference_Media/
    ├── Textures_&_Assets/
    ├── Sound_Design/
    └── Archive/
  ```

**Tag System (Flexible Categorization):**
- Create custom tags (unlimited)
- Assign multiple tags per file
- Suggested tag categories:
  - **Status:** `in-progress`, `final`, `archived`, `review`
  - **Project:** `project-name`, `client`, `personal`
  - **Asset Type:** `vfx-shot`, `matte-painting`, `motion-graphics`, `color-grade`
  - **Quality:** `4K`, `1080p`, `proxy`, `full-resolution`
  - **Format:** `ProRes`, `DNxHD`, `H264`
- Tag-based filtering in search

#### 3.1.3 Full-Text Search + Advanced Filters
**Search Interface:**
- **Full-text search:** Search by filename, folder path, file metadata
- **Advanced Filters:** Combine multiple criteria
  - **Date Range:** Upload date, modification date (calendar picker)
  - **File Format:** Video, Image, Audio, Project File, Archive (multi-select checkboxes)
  - **File Size:** Min/Max size slider (bytes to GB)
  - **Tags:** Filter by one or multiple tags (multi-select)
  - **Folders:** Filter by current folder or entire vault
  - **Project:** Filter by project name/tag

**Search Results:**
- Display grid or list view (user toggle)
- Show filename, thumbnail (if applicable), size, date, tags, folder path
- Instant search with debouncing
- Clear/reset filters button

#### 3.1.4 File Preview & Streaming
**Video Preview:**
- **Small files (<500MB):** HTML5 `<video>` player with controls (play, pause, seek, volume, fullscreen)
- **Large files (>500MB):** HLS streaming via Appwrite-hosted M3U8 playlist
  - Background transcoding to HLS format on first request
  - Adaptive bitrate streaming (auto-quality based on connection)
  - Seek capability within stream
- **Video Metadata:** Resolution, codec, duration, bitrate, frame rate displayed

**Image Preview:**
- Gallery view with thumbnails
- Click to expand full-size viewer
- Image metadata: resolution, color space, file size

**Audio Files:**
- HTML5 `<audio>` player with waveform display (if library available)
- Metadata: sample rate, bitrate, duration

**Project Files (AEP, DaVinci, BLEND, etc.):**
- Thumbnail + metadata display (filename, size, last modified)
- No in-app preview (too complex), but download link provided

**Other Formats:**
- Thumbnail + metadata, download link

#### 3.1.5 Backup Vault (10GB Manual Backup System)
**Backup Marking:**
- Each file has a "Mark as Backup" toggle in the file details panel
- Visual indicator (star icon or badge) on backup-marked files in lists/grids
- Toggling adds/removes file metadata flag in Appwrite DB (no data duplication)

**Backup Vault UI:**
- Dedicated "Backup Vault" section in sidebar
- Shows all backup-marked files
- Displays:
  - Total backup size (tracked in DB)
  - Remaining backup capacity (10GB - used)
  - Warning: "Backup vault is 80%+ full"
  - List of backup files with size, date, original folder path

**Backup Restoration:**
- Restore button on each backup file
- Restore to: "Original location" or "Choose folder"
- Confirmation dialog: "Restore [filename] to [location]?"
- After restore: Remove from backup vault (toggle off metadata flag) or keep flagged

#### 3.1.6 Storage Management & Monitoring
**Storage Dashboard:**
- Top-level component showing:
  - **Total Vault Size:** Disk usage in GB (formatted: "45.2 GB / 500 GB")
  - **Visual Progress Bar:** Shows % full, color-coded:
    - Green: 0-70%
    - Yellow: 70-85%
    - Red: 85-100%
  - **Backup Usage:** "2.3 GB / 10 GB used"
  - **Last Updated:** Timestamp of last scan

**Warnings & Alerts:**
- Notification banner: "Storage approaching capacity (89% full)" when >85%
- Notification banner: "Backup vault nearly full (95% used)" when backup >9.5GB
- Optional: Email/push notification (Phase 2)

**Storage Calculation:**
- Recalculate on:
  - File upload
  - File delete
  - Backup marking/unmarking
- Real-time updates in UI (no page refresh needed)

---

## 4. User Interface Structure

### 4.1 Layout Overview
```
┌─────────────────────────────────────────────────────┐
│                      HEADER                         │
│  Logo | Search Bar | Storage Status | User Menu     │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   SIDEBAR    │         MAIN CONTENT AREA           │
│              │                                      │
│  • Dashboard │  Folder View / Search Results       │
│  • All Files │  - Breadcrumb Navigation           │
│  • Folders   │  - File Grid/List                  │
│  • Tags      │  - Sort Options (name, date, size) │
│  • Backup    │  - Upload Zone                     │
│  • Settings  │                                      │
│              │                                      │
└──────────────┴──────────────────────────────────────┘
```

### 4.2 Key Screens

#### 4.2.1 Dashboard Screen
- Welcome message: "VFX Vault - Your Private Media Storage"
- Storage stats widget (total, backup, warnings)
- Recent files widget (last 8 uploaded)
- Quick actions: Upload, Create Folder, Browse All Files
- Suggested folders (if new user): Offer preset structure

#### 4.2.2 Folder/Browse Screen
- Breadcrumb navigation: `/Vault / Raw_Footage / Project_A / Shots`
- Action bar: Create Folder, Upload, Search, Filter, View Toggle (Grid/List)
- Main area: File grid/list with:
  - Thumbnail (video frame grab, image, or generic icon)
  - Filename
  - File size
  - Date
  - Tags (if any)
  - Backup indicator (star icon)
  - Right-click context menu: Preview, Download, Move, Delete, Properties, Mark Backup

#### 4.2.3 Search Results Screen
- Search bar (pre-filled with query)
- Applied filters shown as removable chips
- Filter sidebar (collapsible): Date, Format, Size, Tags, Folders
- Results displayed as grid/list
- "X results found" counter
- "Clear all filters" button

#### 4.2.4 File Details Panel
- Opens on click or via context menu: "Properties"
- Shows:
  - File thumbnail/preview
  - Filename (editable?)
  - Full path
  - File size
  - Upload date
  - Modification date
  - File type/MIME
  - Resolution (if video/image)
  - Duration (if video/audio)
  - Tags (editable chips)
  - Backup status toggle
  - Actions: Download, Delete, Move, Restore (if in backup vault)

#### 4.2.5 Backup Vault Screen
- Header: "Backup Vault - X GB / 10 GB Used"
- Progress bar showing capacity
- List of backup-marked files with:
  - Filename
  - Size
  - Original location
  - Backup date
  - Restore button
  - Unmark button (toggle off backup flag)
- Warning banner if >80% full

#### 4.2.6 Settings Screen
- **General:**
  - App theme (light/dark mode toggle)
  - Default view (grid/list)
  - Backup capacity (editable, default 10GB)
- **Storage:**
  - Recalculate storage button
  - Clear trash (if soft delete implemented)
  - Auto-cleanup old proxy files (Phase 2)
- **Preview:**
  - HLS streaming threshold (default 500MB)
  - Preview quality (draft/high)
- **About:**
  - App version
  - Self-hosted Appwrite instance info (URL, version)

### 4.3 Design System
- **Color Palette:**
  - Dark mode primary: Near-black backgrounds (#0A0A0A, #1A1A1A)
  - Accent: Professional blue (#0066FF) or minimalist silver (#EBEBEB)
  - Success: Green (#34C759)
  - Warning: Orange (#FF9500)
  - Error: Red (#FF3B30)
- **Typography:**
  - Headings: System font stack (Inter, -apple-system, Segoe UI)
  - Body: Same stack, 14-16px
  - Monospace for file paths/metadata
- **Spacing:** 8px grid system
- **Icons:** Lucide React or SF Symbols equivalents
- **Components:**
  - Buttons: Minimal, rounded (4-8px), dark background, light text
  - Input fields: Subtle borders, focus ring
  - Cards: Slight elevation, hover effects
  - Modals: Centered, overlay with blur

---

## 5. Database Schema (Appwrite)

### 5.1 Collections

#### Collection: `files`
```
{
  $id: string (auto-generated),
  userId: string (Appwrite user ID),
  filename: string,
  originalFilename: string,
  fileSize: number (bytes),
  mimeType: string,
  appwriteFileId: string (reference to Appwrite storage),
  folderPath: string (e.g., "/Vault/Raw_Footage/Project_A"),
  folderId: string (reference to folders collection),
  tags: string[] (array of tag IDs or tag names),
  isBackup: boolean (default: false),
  backupDate: datetime (nullable),
  uploadDate: datetime (auto, now),
  modificationDate: datetime (auto, now),
  resolution: string (nullable, e.g., "4K 3840x2160"),
  duration: number (nullable, seconds, for video/audio),
  codec: string (nullable, e.g., "h.264"),
  bitrate: number (nullable, kbps),
  colorSpace: string (nullable, e.g., "rec709"),
  frameRate: number (nullable, fps, for video),
  isHLS: boolean (false by default, true after HLS transcoding),
  hlsUrl: string (nullable, M3U8 playlist URL),
  thumbnailFileId: string (nullable, reference to thumbnail in storage),
  metadata: json (flexible, store additional metadata),
  permissions: string[] (Appwrite permissions, only user can access)
}
```

#### Collection: `folders`
```
{
  $id: string (auto-generated),
  userId: string,
  folderName: string,
  parentFolderId: string (nullable, for nested folders),
  fullPath: string (computed, e.g., "/Vault/Raw_Footage/Project_A"),
  createdDate: datetime,
  permissions: string[] (only user can access)
}
```

#### Collection: `tags`
```
{
  $id: string,
  userId: string,
  tagName: string (unique per user),
  color: string (optional, hex, for UI display),
  category: string (optional, e.g., "status", "project", "format"),
  createdDate: datetime,
  permissions: string[]
}
```

#### Collection: `backup_metadata`
```
{
  $id: string,
  userId: string,
  totalBackupSize: number (bytes, running sum),
  maxBackupCapacity: number (bytes, default 10GB = 10,737,418,240),
  lastUpdated: datetime,
  fileCount: number (count of backup-marked files)
}
```

### 5.2 Storage Buckets (Appwrite)

#### Bucket: `vault-files`
- **Purpose:** Store actual VFX files
- **Permissions:** Private, only authenticated user
- **Versioning:** Disabled (no version history needed)
- **Max file size:** 5GB per file (configurable)
- **Structure:**
  ```
  vault-files/
  ├── [userId]/
  │   ├── original/
  │   │   ├── [fileId]/
  │   │   │   └── [original_filename]
  │   ├── thumbnails/
  │   │   ├── [fileId].jpg
  │   ├── hls-streams/
  │   │   ├── [fileId]/
  │   │   │   ├── stream.m3u8
  │   │   │   ├── segment-0.ts
  │   │   │   ├── segment-1.ts
  │   │   │   └── ...
  ```

---

## 6. API Endpoints (Next.js Backend via Appwrite SDK)

### 6.1 Authentication Endpoints
```
POST   /api/auth/register
  Body: { email, password, name }
  Response: { userId, token }

POST   /api/auth/login
  Body: { email, password }
  Response: { userId, token, user }

POST   /api/auth/logout
  Response: { success: true }

GET    /api/auth/me
  Response: { user, email, token }
```

### 6.2 File Endpoints
```
POST   /api/files/upload
  Body: FormData { file, folderId, tags[] }
  Response: { fileId, filename, fileSize, uploadDate }

GET    /api/files/list
  Query: { folderId?, tags[]?, searchQuery?, limit?, offset? }
  Response: { files: [], total, hasMore }

GET    /api/files/[fileId]
  Response: { file object with full details }

GET    /api/files/[fileId]/preview
  Query: { type: "thumbnail" | "stream" }
  Response: { url, type, resolution (if applicable) }

GET    /api/files/[fileId]/download
  Response: Binary file download

PATCH  /api/files/[fileId]
  Body: { filename?, tags?, folderPath?, isBackup? }
  Response: { updated file object }

DELETE /api/files/[fileId]
  Response: { success: true, deletedFileId }

POST   /api/files/[fileId]/restore
  Body: { restoreToFolderId? }
  Response: { success: true, restoredFileId }
```

### 6.3 Folder Endpoints
```
POST   /api/folders
  Body: { folderName, parentFolderId? }
  Response: { folderId, folderName, fullPath }

GET    /api/folders
  Query: { parentFolderId? }
  Response: { folders: [] }

GET    /api/folders/[folderId]
  Response: { folder details, parentFolder, childFolders }

PATCH  /api/folders/[folderId]
  Body: { folderName? }
  Response: { updated folder }

DELETE /api/folders/[folderId]
  Query: { recursive: true } // Delete folder and all contents
  Response: { success: true, deletedCount }
```

### 6.4 Tag Endpoints
```
POST   /api/tags
  Body: { tagName, color?, category? }
  Response: { tagId, tagName }

GET    /api/tags
  Response: { tags: [] }

PATCH  /api/tags/[tagId]
  Body: { tagName?, color?, category? }
  Response: { updated tag }

DELETE /api/tags/[tagId]
  Response: { success: true }
```

### 6.5 Search & Filter Endpoints
```
GET    /api/search
  Query: {
    q: "search query",
    fileFormat?: "video|image|audio|project|archive",
    dateFrom?: "2024-01-01",
    dateTo?: "2024-12-31",
    sizeMin?: 0,
    sizeMax?: 1073741824,
    tags?: ["tag1", "tag2"],
    folderId?: "folder-id",
    limit?: 50,
    offset?: 0
  }
  Response: { results: [], total, facets }
```

### 6.6 Backup Endpoints
```
GET    /api/backup/metadata
  Response: { totalSize, capacity, percentUsed, fileCount }

GET    /api/backup/files
  Query: { limit?, offset? }
  Response: { files: [], total }

POST   /api/backup/recalculate
  Response: { totalSize, fileCount }
```

### 6.7 Storage Endpoints
```
GET    /api/storage/usage
  Response: { totalUsed, totalCapacity, percentUsed, breakdown { videos, images, audio, projects, other } }

POST   /api/storage/recalculate
  Response: { totalUsed, timestamp }
```

---

## 7. Technical Architecture

### 7.1 Frontend (Next.js)
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS + custom dark mode
- **State Management:** React Context API + useState/useReducer (simple, no Redux needed)
- **Components:**
  - Dashboard
  - FolderBrowser
  - SearchInterface
  - FileGrid / FileList
  - FileDetailsPanel
  - BackupVault
  - UploadZone (drag-drop)
  - StorageMeter
  - Settings
  - VideoPlayer (with HLS support via HLS.js)
  - ImageGallery
- **Libraries:**
  - `hls.js` for HLS video streaming
  - `react-hot-toast` for notifications
  - `zustand` for lightweight state (optional)
  - `date-fns` for date formatting
  - `lucide-react` for icons
  - `next-auth` for authentication via Appwrite

### 7.2 Backend (Appwrite)
- **Auth:** Appwrite Email/Password authentication
- **Database:** Appwrite Document DB (collections defined above)
- **Storage:** Appwrite Storage (buckets for files, thumbnails, HLS streams)
- **Functions (Appwrite Cloud Functions or custom Node.js):**
  - `generateThumbnail.js` - Create thumbnail on file upload
  - `generateHLS.js` - Transcode video to HLS on first access (async)
  - `calculateStorageUsage.js` - Compute total vault size
  - `searchIndex.js` - Full-text search indexing (via Appwrite full-text search or Meilisearch)

### 7.3 Deployment
- **Frontend:** Deployed on same ExCloud VM as Next.js server or static export
- **Backend:** Self-hosted Appwrite instance on ExCloud VM (Docker containers)
- **Storage:** Local file system on ExCloud VM (mounted to Appwrite)
- **Video Transcoding:** FFmpeg on ExCloud VM (called by Appwrite functions)

### 7.4 Infrastructure (ExCloud VM)
```
ExCloud VM
├── Docker (Appwrite containers)
│   ├── Appwrite API
│   ├── Appwrite Database
│   ├── Appwrite Storage
│   └── Redis Cache (optional)
├── Next.js Server (Node.js)
├── FFmpeg (for HLS transcoding)
├── Nginx/Reverse Proxy (optional, for HTTPS)
└── Local Storage (mounted to Appwrite)
    └── /data/appwrite/
        ├── files/
        ├── thumbnails/
        └── hls-streams/
```

---

## 8. Implementation Roadmap

### Phase 1 (MVP - Full Launch)
**Estimated Effort:** 3-4 weeks for experienced vibecoder

#### Week 1: Foundation & Auth
- [ ] Set up Next.js project with Tailwind + dark mode
- [ ] Configure Appwrite instance on ExCloud VM
- [ ] Implement Appwrite authentication (register, login, logout)
- [ ] Create auth context and protected routes
- [ ] Build login/register pages (minimalist design)

#### Week 2: File Upload & Folder System
- [ ] Design and implement folder structure creation/editing
- [ ] Build file upload component (drag-drop + input)
- [ ] Implement `files` and `folders` collections in Appwrite
- [ ] Create file listing UI (grid view)
- [ ] Implement folder navigation + breadcrumb

#### Week 3: Tags, Search & Filtering
- [ ] Implement tag system (create, assign, delete)
- [ ] Build full-text search functionality
- [ ] Implement advanced filters (date, format, size, tags)
- [ ] Create search results page
- [ ] Integrate filter chips and clear filters

#### Week 4: Preview, Backup & Storage
- [ ] Implement video preview (HTML5 player)
- [ ] Set up HLS streaming for large video files (basic implementation)
- [ ] Build image gallery preview
- [ ] Implement backup marking system (10GB vault)
- [ ] Build backup vault UI with restore functionality
- [ ] Add storage usage dashboard with warnings

**Phase 1 Deliverables:**
- ✅ Functional VFX vault with all core features
- ✅ Working authentication
- ✅ File upload, folder creation, tagging
- ✅ Full-text search + advanced filters
- ✅ Video/image preview with basic streaming
- ✅ 10GB manual backup system with restore
- ✅ Storage monitoring + warnings
- ✅ Minimalist Apple-style UI
- ✅ Self-hosted on ExCloud VM

### Phase 2 (Enhancement)
**Future Features (After Launch):**
- [ ] Advanced HLS transcoding (multiple bitrates, auto-quality)
- [ ] Scheduled backups (auto-backup on timer)
- [ ] Trash/soft delete with restoration
- [ ] File rename functionality
- [ ] Bulk operations (move, tag, delete multiple files)
- [ ] File compression/optimization
- [ ] Smart folder suggestions (AI-powered organization)
- [ ] Export/import vault metadata
- [ ] Cloud backup sync (optional, to secondary storage)
- [ ] Performance optimizations (caching, lazy loading)

### Phase 3 (Advanced)
- [ ] Multi-user collaboration (if needed)
- [ ] Permission-based file sharing
- [ ] Automated proxy file generation
- [ ] AI-powered tagging suggestions
- [ ] Analytics (storage trends, usage patterns)
- [ ] Mobile app (React Native)

---

## 9. Success Metrics

### Phase 1 Success Criteria
- ✅ All files upload and download without errors
- ✅ Search finds files correctly with sub-second response time
- ✅ Video playback smooth (HLS for >500MB, no buffering)
- ✅ Backup vault enforces 10GB limit and prevents overflow
- ✅ Storage meter updates in real-time
- ✅ UI responsive and navigable on 1920x1080+ displays
- ✅ Authentication secure (no stored passwords in localStorage, HTTPS-ready)
- ✅ Zero external dependencies on 3rd-party cloud services

### Key Performance Indicators
- File upload speed: >50MB/s (depends on VM bandwidth)
- Search latency: <200ms for 10k+ files
- Video preview load time: <2s for streaming
- Backup calculation time: <5s for 10k files
- UI responsiveness: 60 FPS on interactions

---

## 10. Security & Privacy Considerations

### 10.1 Authentication
- Email/password via Appwrite (secure hashing)
- Session tokens stored securely in HTTP-only cookies (not localStorage)
- Token expiry: 24 hours (refreshable)
- Logout clears all client-side tokens

### 10.2 Data Privacy
- **Self-Hosted:** All data resides on your ExCloud VM, no external servers
- **Encryption:** 
  - Optional: TLS/HTTPS for VM access (configure Nginx reverse proxy)
  - File encryption at rest (Phase 2, optional)
- **Access Control:** Only authenticated user can access their vault
- **No Backups to 3rd Party:** All backups stay on your VM

### 10.3 Network Security
- API endpoints require valid JWT token in `Authorization` header
- Appwrite permissions: All resources scoped to user ID
- CORS configured for local/same-origin only
- File download endpoints include proper MIME type headers + no execution

---

## 11. Known Limitations & Trade-offs

### Intentional Limitations (Per Spec)
- ❌ No multi-user support (single-user design)
- ❌ No full version control (only metadata flagging for backups)
- ❌ No automatic backup scheduling (Phase 2)
- ❌ Backup limit hard-capped at 10GB (by design)

### Technical Constraints
- **Video HLS Transcoding:** Requires FFmpeg on server; first access may have 10-30s delay
- **Large File Streaming:** Depends on VM network bandwidth
- **Search Latency:** Full-text search on 100k+ files may need Elasticsearch (Phase 2)
- **Storage Scalability:** Depends on ExCloud VM disk allocation

---

## 12. Glossary & Terminology

| Term | Definition |
|------|-----------|
| **Vault** | The root directory/namespace where all user files are stored |
| **Backup Vault** | Separate logical namespace for 10GB of manually-marked critical files |
| **HLS** | HTTP Live Streaming; adaptive bitrate streaming protocol for video |
| **Full-Text Search** | Search across file metadata, filenames, and properties, not file contents |
| **Backup Marking** | User-initiated toggle to flag a file as critical (stored as metadata, not duplicated) |
| **Hybrid Organization** | Combination of traditional folder structure + flexible tagging system |
| **Soft Delete** | File marked as deleted but recoverable from trash (Phase 2) |
| **Transcoding** | Converting video to HLS format for streaming |
| **Restore** | Copying a backup-marked file back from backup vault to active vault |

---

## 13. Questions for Clarification (If AI Agent Needs Them)

1. **File Size Limits:** Is 5GB per file acceptable, or should it be higher/unlimited?
2. **Search Speed:** For 10k+ files, should we implement full-text indexing (Elasticsearch/Meilisearch)?
3. **HLS Transcoding:** Should first access trigger async transcoding or sync (user waits)?
4. **Backup Overflow:** What should happen if user tries to mark a file as backup when vault is full?
   - Suggested: Show warning, allow marking but reject until space freed
5. **File Deletion:** Should deleted files go to trash first (Phase 2), or permanent delete immediately?
6. **Tags Limit:** Should there be a max number of tags per file or total tags?
7. **Video Codecs:** Should we support all codecs, or optimize for specific ones (ProRes, DNxHD)?

---

## 14. References & Resources

### Technology Docs
- **Next.js:** https://nextjs.org/docs
- **Appwrite:** https://appwrite.io/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **HLS.js:** https://hls-js.readthedocs.io
- **FFmpeg:** https://ffmpeg.org/documentation.html

### Vibecoding Best Practices
- Prompt-driven development with AI agents
- Minimal manual code, maximum prompts
- Leverage SDK documentation for quick implementation
- Use component libraries (shadcn/ui, Lucide) for speed

---

## 15. Document Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | Pranjal Sharma | March 5, 2026 | Approved |
| Technical Lead | [To be assigned] | — | — |
| Development Lead | [To be assigned] | — | — |

---

**END OF PRD**

---

## Appendix A: Sample File Metadata Example

```json
{
  "fileId": "f123abc",
  "filename": "shot_001_vfx_compositing_final.mov",
  "fileSize": 2147483648,
  "mimeType": "video/quicktime",
  "folderPath": "/Vault/Project_Files/DaVinci/Client_A/Shots",
  "tags": ["final", "client-a", "color-grade", "4K"],
  "isBackup": true,
  "backupDate": "2026-03-05T10:00:00Z",
  "uploadDate": "2026-02-28T15:30:00Z",
  "resolution": "4K 3840x2160",
  "duration": 120,
  "codec": "ProRes422HQ",
  "frameRate": 24,
  "bitrate": 250000,
  "colorSpace": "rec709",
  "thumbnailFileId": "thumb_f123abc.jpg",
  "isHLS": true,
  "hlsUrl": "https://yourvm.local/storage/hls-streams/f123abc/stream.m3u8"
}
```

## Appendix B: Folder Structure Template

```
/Vault
├── Raw_Footage
│   ├── Client_Projects
│   │   └── Project_A
│   ├── Personal_Projects
│   └── Stock_Footage
├── Project_Files
│   ├── After_Effects
│   ├── DaVinci
│   ├── Blender
│   └── Nuke
├── Rendered_Outputs
│   ├── 4K_Masters
│   ├── 1080p_Proxies
│   └── Web_Export
├── Reference_Media
│   ├── Color_Reference
│   └── Sound_Design_Reference
├── Textures_&_Assets
│   ├── 3D_Models
│   ├── Particle_Systems
│   └── Mattes
├── Sound_Design
│   ├── Music
│   ├── SFX
│   └── Dialogue
├── Archive
│   └── Old_Projects
└── Backups
    └── (Auto-managed by Backup Vault feature)
```

