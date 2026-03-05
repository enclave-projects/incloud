# VFX Vault - Technical Requirements Document (TRD)

**Document Version:** 1.0  
**Last Updated:** March 5, 2026  
**Status:** Ready for Development  
**Target Audience:** AI Agents (GitHub Copilot + Claude Sonnet 4.6), Developers

---

## 1. Executive Technical Overview

**Project:** VFX Vault - Self-Hosted VFX File Management Platform  
**Tech Stack:** Next.js + Appwrite (live instance) + ExCloud VM  
**Development Workflow:** GitHub Copilot (Claude Sonnet 4.6) + Git versioning  
**Storage Architecture:** 40GB active vault + 10GB backup = 50GB total  

### 1.1 Key Technical Decisions
- ✅ **Appwrite:** Already deployed on live URL (credentials provided, no deployment needed)
- ✅ **CLI Access:** Pre-authenticated Appwrite CLI available for schema management
- ✅ **Video Transcoding:** Appwrite Cloud Functions (HLS streaming)
- ✅ **Realtime Sync:** Appwrite realtime subscriptions (frontend)
- ✅ **Schema Migrations:** Versioned SQL files in `/migrations` folder, tracked in git
- ✅ **Credentials:** `.env` file (gitignored), `.env.example` for templates
- ✅ **Package Manager:** Flexible minor versions (using ranges, not pinned to patch)

---

## 2. Technology Stack & Version Specifications

### 2.1 Frontend - Next.js Ecosystem

| Technology | Version Spec | Rationale |
|-----------|-------------|-----------|
| **Node.js** | `^18.17.0 \|\| ^20.0.0 \|\| ^22.0.0` | LTS versions, maximum compatibility |
| **Next.js** | `^14.2.0` | Latest stable App Router, React 19 compatible |
| **React** | `^18.3.0` | Latest stable, Hooks-first |
| **TypeScript** | `^5.4.0` | Latest, strict mode by default |
| **Tailwind CSS** | `^3.4.0` | Latest with latest utility classes |
| **Tailwind Plugins** | `^4.0.0` | Dynamic Tailwind config support |

### 2.2 Frontend Dependencies (By Category)

#### UI & Component Libraries
```json
{
  "lucide-react": "^0.400.0",
  "react-hot-toast": "^2.4.1",
  "recharts": "^2.12.0",
  "@radix-ui/dialog": "^1.1.2",
  "@radix-ui/dropdown-menu": "^2.1.1",
  "@headlessui/react": "^2.0.0"
}
```

#### State Management & Forms
```json
{
  "zustand": "^4.5.0",
  "react-hook-form": "^7.51.0",
  "zod": "^3.23.0"
}
```

#### Media & Preview
```json
{
  "hls.js": "^1.4.0",
  "react-responsive": "^10.0.0",
  "react-resizable-panels": "^2.0.0"
}
```

#### Utilities
```json
{
  "date-fns": "^3.0.0",
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.3.0",
  "axios": "^1.6.0",
  "js-cookie": "^3.0.0"
}
```

### 2.3 Backend/API - Appwrite SDK

| Technology | Version Spec | Rationale |
|-----------|-------------|-----------|
| **Appwrite SDK (JS)** | `^14.0.0` | Latest official JavaScript SDK |
| **Appwrite CLI** | `^5.0.0` (pre-installed) | Schema management, migrations |

**Note:** Appwrite instance is **live and pre-authenticated**. No deployment needed.

### 2.4 Development Dependencies

```json
{
  "@types/node": "^20.0.0",
  "@types/react": "^18.3.0",
  "@types/react-dom": "^18.3.0",
  "@types/js-cookie": "^3.0.0",
  "autoprefixer": "^10.4.0",
  "postcss": "^8.4.0",
  "eslint": "^8.57.0",
  "eslint-config-next": "^14.2.0",
  "@typescript-eslint/eslint-plugin": "^7.0.0",
  "@typescript-eslint/parser": "^7.0.0",
  "prettier": "^3.2.0"
}
```

### 2.5 Testing Dependencies

```json
{
  "jest": "^29.7.0",
  "@testing-library/react": "^14.2.0",
  "@testing-library/jest-dom": "^6.1.0",
  "@playwright/test": "^1.42.0",
  "vitest": "^1.2.0"
}
```

### 2.6 Package Manager
- **Primary:** `npm` (v10+)
- **Alternative:** `pnpm` (v8+) for faster installs
- **Lock File:** Commit `package-lock.json` or `pnpm-lock.yaml` to git

---

## 3. Environment Configuration & Credentials

### 3.1 Environment Variables (`.env.local`)

Create `.env.local` in project root (add to `.gitignore`):

```bash
# ========== APPWRITE CONFIGURATION ==========
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key

# ========== APPWRITE DATABASE & COLLECTIONS ==========
NEXT_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
NEXT_PUBLIC_APPWRITE_COLLECTION_FILES=files
NEXT_PUBLIC_APPWRITE_COLLECTION_FOLDERS=folders
NEXT_PUBLIC_APPWRITE_COLLECTION_TAGS=tags
NEXT_PUBLIC_APPWRITE_COLLECTION_BACKUP_META=backup_metadata

# ========== APPWRITE STORAGE BUCKETS ==========
NEXT_PUBLIC_APPWRITE_BUCKET_VAULT=vault-files
NEXT_PUBLIC_APPWRITE_BUCKET_THUMBNAILS=vault-thumbnails
NEXT_PUBLIC_APPWRITE_BUCKET_HLS=vault-hls-streams

# ========== STORAGE LIMITS (BYTES) ==========
NEXT_PUBLIC_VAULT_CAPACITY=42949672960          # 40GB in bytes
NEXT_PUBLIC_BACKUP_CAPACITY=10737418240        # 10GB in bytes
NEXT_PUBLIC_STORAGE_WARNING_THRESHOLD=0.8      # Warn at 80%

# ========== VIDEO TRANSCODING ==========
NEXT_PUBLIC_HLS_THRESHOLD_BYTES=524288000      # 500MB - threshold for HLS
NEXT_PUBLIC_APPWRITE_FUNCTION_HLS_ID=your-hls-function-id

# ========== APPWRITE REALTIME ==========
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_REALTIME_TIMEOUT=30000             # 30 seconds

# ========== SESSION & AUTH ==========
NEXT_PUBLIC_SESSION_TIMEOUT=86400000           # 24 hours in ms
NEXT_PUBLIC_TOKEN_EXPIRY=86400                 # 24 hours in seconds

# ========== DEVELOPMENT/LOGGING ==========
NEXT_PUBLIC_LOG_LEVEL=info                     # debug, info, warn, error
NODE_ENV=development                           # development, production
```

### 3.2 `.env.example` (Template for Developers)

Commit this to git:

```bash
# ========== APPWRITE CONFIGURATION ==========
# Get from Appwrite Console: Settings > API Keys
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-instance.com/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=xxxxx
APPWRITE_API_KEY=xxxxx

# ========== APPWRITE DATABASE & COLLECTIONS ==========
# Create these via Appwrite CLI or Console
NEXT_PUBLIC_APPWRITE_DATABASE_ID=xxxxx
NEXT_PUBLIC_APPWRITE_COLLECTION_FILES=files
NEXT_PUBLIC_APPWRITE_COLLECTION_FOLDERS=folders
NEXT_PUBLIC_APPWRITE_COLLECTION_TAGS=tags
NEXT_PUBLIC_APPWRITE_COLLECTION_BACKUP_META=backup_metadata

# ========== APPWRITE STORAGE BUCKETS ==========
NEXT_PUBLIC_APPWRITE_BUCKET_VAULT=vault-files
NEXT_PUBLIC_APPWRITE_BUCKET_THUMBNAILS=vault-thumbnails
NEXT_PUBLIC_APPWRITE_BUCKET_HLS=vault-hls-streams

# ========== STORAGE LIMITS (BYTES) ==========
NEXT_PUBLIC_VAULT_CAPACITY=42949672960
NEXT_PUBLIC_BACKUP_CAPACITY=10737418240
NEXT_PUBLIC_STORAGE_WARNING_THRESHOLD=0.8

# ========== VIDEO TRANSCODING ==========
NEXT_PUBLIC_HLS_THRESHOLD_BYTES=524288000
NEXT_PUBLIC_APPWRITE_FUNCTION_HLS_ID=xxxxx

# ========== APPWRITE REALTIME ==========
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_REALTIME_TIMEOUT=30000

# ========== SESSION & AUTH ==========
NEXT_PUBLIC_SESSION_TIMEOUT=86400000
NEXT_PUBLIC_TOKEN_EXPIRY=86400

# ========== DEVELOPMENT/LOGGING ==========
NEXT_PUBLIC_LOG_LEVEL=info
NODE_ENV=development
```

### 3.3 Credentials Management Workflow

1. **Pranjal provides:**
   - Appwrite endpoint URL
   - Project ID
   - API key (pre-authenticated)
   - Database ID
   - Collection IDs (files, folders, tags, backup_metadata)
   - Bucket IDs (vault-files, vault-thumbnails, vault-hls-streams)

2. **Developer creates `.env.local`:**
   - Copy `.env.example`
   - Populate with credentials from Pranjal
   - Add to `.gitignore` (never commit)

3. **Appwrite CLI Access:**
   ```bash
   appwrite auth login --endpoint https://your-appwrite-instance.com/v1
   # Pre-authenticated by Pranjal
   ```

4. **Git Workflow:**
   - Commit `.env.example` ✅
   - Never commit `.env.local` ❌
   - Share `.env.local` via secure channel only (not email, not git)

---

## 4. Appwrite Integration Architecture

### 4.1 Live Appwrite Instance (Pre-Deployed)

**Status:** ✅ Already running on ExCloud VM  
**Access Method:** HTTPS endpoint + MCP connection + CLI  
**Credentials:** Will be provided separately

### 4.2 Appwrite MCP (Model Context Protocol)

**Purpose:** Direct Appwrite console access for schema management and documentation

**Usage for AI Agents:**
- Query Appwrite collections
- List storage buckets
- Retrieve function details
- Generate API documentation

**Fallback Chain if MCP Fails:**
```
MCP Connection ❌
    ↓
Appwrite CLI (Pre-authenticated) ❌
    ↓
SQL Migration Files ✅ (version-controlled in /migrations)
```

### 4.3 Appwrite CLI Access

**Pre-installed and Pre-authenticated** by Pranjal

```bash
# Verify CLI access
appwrite --version

# List projects
appwrite projects list

# List collections
appwrite databases listCollections --databaseId [DATABASE_ID]

# Export schema (for versioning)
appwrite collections export --databaseId [DATABASE_ID] --collectionId files
```

### 4.4 Appwrite Collections Schema

#### Collection: `files`
```javascript
{
  collectionId: "files",
  name: "Files",
  attributes: [
    {
      key: "userId",
      type: "string",
      required: true,
      size: 255
    },
    {
      key: "filename",
      type: "string",
      required: true,
      size: 500
    },
    {
      key: "originalFilename",
      type: "string",
      required: true,
      size: 500
    },
    {
      key: "fileSize",
      type: "integer",
      required: true
    },
    {
      key: "mimeType",
      type: "string",
      required: true,
      size: 100
    },
    {
      key: "appwriteFileId",
      type: "string",
      required: true,
      size: 255
    },
    {
      key: "folderPath",
      type: "string",
      required: true,
      size: 1000
    },
    {
      key: "folderId",
      type: "string",
      required: false,
      size: 255
    },
    {
      key: "tags",
      type: "string",
      required: false,
      array: true,
      size: 255
    },
    {
      key: "isBackup",
      type: "boolean",
      required: false,
      default: false
    },
    {
      key: "backupDate",
      type: "datetime",
      required: false
    },
    {
      key: "uploadDate",
      type: "datetime",
      required: true
    },
    {
      key: "modificationDate",
      type: "datetime",
      required: true
    },
    {
      key: "resolution",
      type: "string",
      required: false,
      size: 100
    },
    {
      key: "duration",
      type: "integer",
      required: false
    },
    {
      key: "codec",
      type: "string",
      required: false,
      size: 100
    },
    {
      key: "bitrate",
      type: "integer",
      required: false
    },
    {
      key: "colorSpace",
      type: "string",
      required: false,
      size: 100
    },
    {
      key: "frameRate",
      type: "number",
      required: false
    },
    {
      key: "isHLS",
      type: "boolean",
      required: false,
      default: false
    },
    {
      key: "hlsUrl",
      type: "string",
      required: false,
      size: 500
    },
    {
      key: "thumbnailFileId",
      type: "string",
      required: false,
      size: 255
    }
  ],
  indexes: [
    {
      key: "userId_uploadDate",
      type: "key",
      attributes: ["userId", "uploadDate"],
      orders: ["ASC", "DESC"]
    },
    {
      key: "userId_isBackup",
      type: "key",
      attributes: ["userId", "isBackup"],
      orders: ["ASC", "ASC"]
    }
  ]
}
```

#### Collection: `folders`
```javascript
{
  collectionId: "folders",
  name: "Folders",
  attributes: [
    { key: "userId", type: "string", required: true, size: 255 },
    { key: "folderName", type: "string", required: true, size: 500 },
    { key: "parentFolderId", type: "string", required: false, size: 255 },
    { key: "fullPath", type: "string", required: true, size: 1000 },
    { key: "createdDate", type: "datetime", required: true }
  ],
  indexes: [
    {
      key: "userId_parentFolderId",
      type: "key",
      attributes: ["userId", "parentFolderId"]
    }
  ]
}
```

#### Collection: `tags`
```javascript
{
  collectionId: "tags",
  name: "Tags",
  attributes: [
    { key: "userId", type: "string", required: true, size: 255 },
    { key: "tagName", type: "string", required: true, size: 255 },
    { key: "color", type: "string", required: false, size: 20 },
    { key: "category", type: "string", required: false, size: 100 },
    { key: "createdDate", type: "datetime", required: true }
  ],
  indexes: [
    {
      key: "userId_tagName",
      type: "unique",
      attributes: ["userId", "tagName"]
    }
  ]
}
```

#### Collection: `backup_metadata`
```javascript
{
  collectionId: "backup_metadata",
  name: "Backup Metadata",
  attributes: [
    { key: "userId", type: "string", required: true, size: 255 },
    { key: "totalBackupSize", type: "integer", required: true, default: 0 },
    { key: "maxBackupCapacity", type: "integer", required: true, default: 10737418240 },
    { key: "lastUpdated", type: "datetime", required: true },
    { key: "fileCount", type: "integer", required: true, default: 0 }
  ]
}
```

### 4.5 Appwrite Storage Buckets

#### Bucket: `vault-files`
```bash
# Create via CLI
appwrite storage createBucket \
  --bucketId vault-files \
  --name "Vault Files" \
  --permission document \
  --fileSecurity true \
  --enabled true
```

**Config:**
- **Max File Size:** 5GB
- **Allowed MIME Types:** video/*, image/*, audio/*, application/json, application/zip, application/x-tar, application/x-gzip, application/vnd.openxmlformats-officedocument.*, text/*
- **Encryption:** Enabled
- **AntiVirus:** Enabled (if available)

#### Bucket: `vault-thumbnails`
```bash
appwrite storage createBucket \
  --bucketId vault-thumbnails \
  --name "Vault Thumbnails" \
  --permission document
```

**Config:**
- **Max File Size:** 10MB
- **MIME Types:** image/jpeg, image/png, image/webp
- **Auto-cleanup:** Thumbnails deleted with parent file

#### Bucket: `vault-hls-streams`
```bash
appwrite storage createBucket \
  --bucketId vault-hls-streams \
  --name "HLS Streams" \
  --permission document
```

**Config:**
- **Max File Size:** 2GB (per segment)
- **MIME Types:** application/vnd.apple.mpegurl, video/mp2t
- **Auto-cleanup:** HLS streams deleted with parent file

### 4.6 Appwrite Cloud Functions (for HLS Transcoding)

**Function Name:** `generateHLS`  
**Runtime:** Node.js 18+ / 20+  
**Trigger:** Manual via API call  

**Environment Variables:**
```bash
FFMPEG_PATH=/usr/bin/ffmpeg
APPWRITE_API_KEY=[from env]
APPWRITE_DATABASE_ID=[from env]
APPWRITE_COLLECTION_FILES=[from env]
APPWRITE_BUCKET_HLS=[from env]
```

**Function Logic (Pseudo):**
1. Receive file ID from request
2. Download video from `vault-files` bucket
3. Check file size:
   - If < 500MB: Skip HLS, keep HTML5
   - If >= 500MB: Transcode to HLS (multiple bitrates)
4. Upload HLS segments to `vault-hls-streams` bucket
5. Update file document:
   - `isHLS = true`
   - `hlsUrl = https://...stream.m3u8`
6. Delete temporary transcoded files

**Deployment:**
```bash
appwrite functions create \
  --functionId generateHLS \
  --name "Generate HLS Streams" \
  --runtime node-18.0
# Upload function code via Appwrite Dashboard or CLI
```

---

## 5. Database Schema Migrations (Git-Based Versioning)

### 5.1 Migration Folder Structure

```
project-root/
├── migrations/
│   ├── v1.0.0/
│   │   ├── 001_create_files_collection.sql
│   │   ├── 002_create_folders_collection.sql
│   │   ├── 003_create_tags_collection.sql
│   │   └── 004_create_backup_metadata_collection.sql
│   ├── v1.1.0/
│   │   ├── 001_add_colorspace_to_files.sql
│   │   └── 002_add_indexes.sql
│   ├── v1.2.0/
│   │   └── 001_add_metadata_column.sql
│   ├── migration-runner.js
│   ├── rollback-runner.js
│   └── README.md
```

### 5.2 Migration File Format

**Naming Convention:** `NNN_description.sql`
- `NNN` = sequence number (001, 002, 003, etc.)
- `description` = kebab-case description

**File Content Example (v1.0.0/001_create_files_collection.sql):**

```sql
-- Migration: Create files collection
-- Version: v1.0.0
-- Author: GitHub Copilot + Claude Sonnet 4.6
-- Date: 2026-03-05
-- Description: Initialize core files collection for vault storage

-- SQL representation (for documentation/versioning)
-- Actual creation via Appwrite CLI

/*
  APPWRITE CLI COMMAND:
  
  appwrite databases createCollection \
    --databaseId [DATABASE_ID] \
    --collectionId files \
    --name "Files" \
    --documentSecurity false \
    --enabled true

  appwrite databases createAttribute \
    --databaseId [DATABASE_ID] \
    --collectionId files \
    --key userId \
    --type string \
    --size 255 \
    --required true

  appwrite databases createAttribute \
    --databaseId [DATABASE_ID] \
    --collectionId files \
    --key filename \
    --type string \
    --size 500 \
    --required true

  [... additional attributes ...]
*/

-- Rollback command (documented for reference)
/*
  appwrite databases deleteCollection \
    --databaseId [DATABASE_ID] \
    --collectionId files
*/
```

### 5.3 Migration Runner Script (`migrations/migration-runner.js`)

```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Migration Runner
 * Reads SQL/command files and executes them in order
 * Usage: node migration-runner.js [version] [direction]
 * Example: node migration-runner.js v1.0.0 up
 */

const args = process.argv.slice(2);
const version = args[0] || 'latest';
const direction = args[1] || 'up';

const migrationsDir = path.join(__dirname);
const versionDirs = fs.readdirSync(migrationsDir)
  .filter(f => f.startsWith('v') && fs.statSync(path.join(migrationsDir, f)).isDirectory())
  .sort();

console.log(`🔄 Running migrations: ${version} (${direction})`);

if (direction === 'up') {
  // Run migrations UP to specified version
  const targetVersion = version === 'latest' ? versionDirs[versionDirs.length - 1] : version;
  const migrationsToRun = versionDirs.filter(v => v <= targetVersion);
  
  migrationsToRun.forEach(v => {
    const versionPath = path.join(migrationsDir, v);
    const files = fs.readdirSync(versionPath)
      .filter(f => f.endsWith('.sql'))
      .sort();

    files.forEach(file => {
      const filePath = path.join(versionPath, file);
      console.log(`✅ Running: ${v}/${file}`);
      
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Extract and execute Appwrite CLI commands
        const commands = content.match(/appwrite .+/g) || [];
        commands.forEach(cmd => {
          execSync(cmd, { stdio: 'inherit' });
        });
      } catch (err) {
        console.error(`❌ Failed: ${v}/${file}`, err.message);
        process.exit(1);
      }
    });
  });

  console.log('✅ All migrations completed!');
} else if (direction === 'down') {
  // Rollback migrations
  console.log('⚠️  Rollback not yet implemented. Use manual CLI commands.');
}
```

### 5.4 Rollback Strategy

For each migration, document the **inverse operation**:

**Example Rollback (v1.0.0/001_rollback_create_files_collection.sql):**

```sql
-- ROLLBACK: Delete files collection
-- This removes all files data - use with extreme caution!

/*
  APPWRITE CLI COMMAND:
  
  appwrite databases deleteCollection \
    --databaseId [DATABASE_ID] \
    --collectionId files
*/
```

**Rollback Procedure:**
1. **Backup current state:** `appwrite backups create` (if available)
2. **Identify problematic migration**
3. **Execute rollback SQL** in reverse order
4. **Test data integrity**
5. **Document reason** in git commit

---

## 6. MCP → CLI → SQL Fallback Chain

### 6.1 Decision Tree for Schema Operations

```
SCHEMA CHANGE REQUIRED?
    │
    ├─→ [TRY] MCP Connection
    │       └─→ Success? ✅ Done
    │       └─→ Fail? ❌ Continue
    │
    ├─→ [TRY] Appwrite CLI (Pre-authenticated)
    │       └─→ Success? ✅ Done
    │       └─→ Fail? ❌ Continue
    │
    └─→ [TRY] SQL Migration Files in /migrations
            └─→ Success? ✅ Done
            └─→ Fail? ❌ Manual intervention required
```

### 6.2 Operation Examples

#### Use Case 1: Add New Column to `files` Collection

**Attempt 1 - MCP:**
```javascript
// If MCP available
const client = new Appwrite.Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID);

const databases = new Appwrite.Databases(client);

await databases.createAttribute(
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  'files',
  'newColumnName',
  'string',
  false,
  500
);
```

**Attempt 2 - Appwrite CLI:**
```bash
appwrite databases createAttribute \
  --databaseId [DATABASE_ID] \
  --collectionId files \
  --key newColumnName \
  --type string \
  --size 500 \
  --required false
```

**Attempt 3 - SQL Migration File:**
```sql
-- migrations/v1.1.0/001_add_new_column.sql
/*
  appwrite databases createAttribute \
    --databaseId [DATABASE_ID] \
    --collectionId files \
    --key newColumnName \
    --type string \
    --size 500 \
    --required false
*/
```

#### Use Case 2: Create New Index

**Attempt 1 - MCP:**
```javascript
await databases.createIndex(
  process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
  'files',
  'userId_isBackup',
  'key',
  ['userId', 'isBackup'],
  ['ASC', 'ASC']
);
```

**Attempt 2 - CLI:**
```bash
appwrite databases createIndex \
  --databaseId [DATABASE_ID] \
  --collectionId files \
  --key userId_isBackup \
  --type key \
  --attributes userId,isBackup \
  --orders ASC,ASC
```

**Attempt 3 - SQL File:**
```sql
-- migrations/v1.1.0/002_add_indexes.sql
/*
  appwrite databases createIndex \
    --databaseId [DATABASE_ID] \
    --collectionId files \
    --key userId_isBackup \
    --type key \
    --attributes userId,isBackup \
    --orders ASC,ASC
*/
```

---

## 7. Git Workflow & Versioning

### 7.1 Git Repository Structure

```
vfx-vault/
├── .git/
├── .gitignore                      # .env.local, node_modules, dist
├── .env.example                    # Commit this
├── .env.local                      # DO NOT commit
├── package.json
├── package-lock.json               # Commit (version lock)
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
│
├── migrations/                     # Schema versions
│   ├── v1.0.0/
│   │   ├── 001_create_files_collection.sql
│   │   └── 002_create_folders_collection.sql
│   ├── v1.1.0/
│   │   └── 001_add_indexes.sql
│   ├── migration-runner.js
│   └── README.md
│
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── dashboard/
│   │   ├── auth/
│   │   └── api/
│   │       ├── files/
│   │       ├── folders/
│   │       ├── tags/
│   │       └── search/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── FileGrid.tsx
│   │   ├── FolderBrowser.tsx
│   │   ├── SearchInterface.tsx
│   │   └── ...
│   │
│   ├── lib/
│   │   ├── appwrite.ts             # Appwrite client config
│   │   ├── auth.ts                 # Auth helpers
│   │   ├── storage.ts              # Storage operations
│   │   ├── fileService.ts          # File management
│   │   └── utils.ts
│   │
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useStorage.ts
│   │   ├── useRealtimeFiles.ts
│   │   └── ...
│   │
│   └── types/
│       ├── appwrite.ts
│       ├── files.ts
│       └── index.ts
│
├── public/
│   ├── icons/
│   └── assets/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── docs/
│   ├── SETUP.md                    # Getting started
│   ├── API.md                      # API documentation
│   ├── TROUBLESHOOTING.md          # Common issues
│   └── DEPLOYMENT.md               # Deployment guide
│
└── README.md
```

### 7.2 Git Commit Conventions

**Format:** `[TYPE]: [SCOPE] - [DESCRIPTION]`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `style`: Code style (formatting, etc.)
- `test`: Test additions/modifications
- `docs`: Documentation
- `chore`: Maintenance, dependencies
- `migration`: Database schema migration
- `ci`: CI/CD changes

**Examples:**
```bash
git commit -m "feat: file-upload - Implement drag-drop upload with validation"
git commit -m "fix: search - Fix full-text search timeout on large datasets"
git commit -m "migration: v1.1.0 - Add userId_isBackup index for performance"
git commit -m "docs: SETUP.md - Update environment variable instructions"
git commit -m "test: FileGrid - Add component unit tests"
```

### 7.3 Version Tags

Tag releases for deployment tracking:

```bash
# Tag a release
git tag -a v1.0.0 -m "Release: VFX Vault v1.0.0 - MVP launch"
git push origin v1.0.0

# List tags
git tag -l

# Create annotated tag from commit
git tag -a v1.1.0 [commit-hash] -m "Release: VFX Vault v1.1.0"
```

**Version Scheme:** `vMAJOR.MINOR.PATCH`
- **MAJOR:** Breaking changes, new architecture
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes

### 7.4 Branch Strategy

**Main branches:**
- `main` - Production-ready code (protected branch)
- `develop` - Development branch
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `migration/*` - Database migration branches

**Workflow Example:**
```bash
# Start feature development
git checkout develop
git pull origin develop
git checkout -b feature/file-preview

# Commit changes
git add .
git commit -m "feat: file-preview - Implement HLS video streaming"

# Push and create PR
git push origin feature/file-preview
# Create Pull Request on GitHub

# After review/approval
git checkout develop
git pull origin develop
git merge --no-ff feature/file-preview
git push origin develop

# Release to main
git checkout main
git pull origin main
git merge --no-ff develop
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main
git push origin v1.0.0
```

---

## 8. Storage Architecture & Limits

### 8.1 Storage Allocation

| Component | Capacity | Purpose |
|-----------|----------|---------|
| **Active Vault** | 40GB | Working files, projects, rendered outputs |
| **Backup Vault** | 10GB | Critical files (manually marked) |
| **System/Logs** | Reserved | Appwrite logs, thumbnails, HLS cache |
| **TOTAL** | 50GB | Hard limit on ExCloud VM |

### 8.2 Storage Monitoring

**Frontend displays:**
- Vault usage: `X.X GB / 40 GB used`
- Backup usage: `X.X GB / 10 GB used`
- Warning: "Vault 80%+ full"
- Warning: "Backup vault 90%+ full"

**Calculation Points:**
```
Total Vault Size = SUM(fileSize) for all files where isBackup = false
Total Backup Size = SUM(fileSize) for all files where isBackup = true
```

**Real-time Updates via Appwrite Realtime:**
- Listen for file creation/deletion
- Update storage stats on UI
- Trigger warnings if limits exceeded

### 8.3 Storage Enforcement

**Hard Limits:**
```javascript
const VAULT_CAPACITY = 40 * 1024 * 1024 * 1024;        // 40GB
const BACKUP_CAPACITY = 10 * 1024 * 1024 * 1024;       // 10GB

// On file upload, check:
if (currentVaultSize + newFileSize > VAULT_CAPACITY) {
  throw new Error("Vault is full. Delete files or move to backup.");
}

// On backup marking, check:
if (currentBackupSize + fileSize > BACKUP_CAPACITY) {
  throw new Error("Backup vault is full. Delete some backups first.");
}
```

### 8.4 Storage Cleanup Strategy (Phase 2)

- Move old files to "Archive" folder (manual)
- Delete HLS cache after 30 days (automatic)
- Delete temporary thumbnails if source deleted (automatic)

---

## 9. Appwrite Realtime Integration

### 9.1 Realtime Subscriptions (Frontend)

**Subscriptions to set up:**

```typescript
// Listen for file changes
client.subscribe(
  `databases.${NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.files.documents`,
  (message) => {
    // Update file list in real-time
    // Payload: { type, payload }
  }
);

// Listen for backup metadata updates
client.subscribe(
  `databases.${NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.backup_metadata.documents`,
  (message) => {
    // Update backup storage stats
  }
);

// Listen for user's own files
client.subscribe(
  `databases.${NEXT_PUBLIC_APPWRITE_DATABASE_ID}.collections.files.documents.userId`,
  (message) => {
    // Only receive updates for current user's files
  }
);
```

### 9.2 Realtime Event Types

- **CREATE:** New file uploaded
- **UPDATE:** File metadata changed (tags, backup status)
- **DELETE:** File deleted

### 9.3 Realtime Fallback (Polling)

If realtime unavailable:
```typescript
// Poll every 10 seconds
setInterval(async () => {
  const currentFiles = await fetchFiles();
  // Compare with local state, update if changed
}, 10000);
```

---

## 10. Video Transcoding (HLS via Appwrite Functions)

### 10.1 HLS Streaming Threshold

- **< 500MB:** Use HTML5 `<video>` player (no transcoding)
- **≥ 500MB:** Transcode to HLS (adaptive bitrate streaming)

### 10.2 HLS Function Deployment

**Function Code Example (Node.js):**

```javascript
// Appwrite Cloud Function: generateHLS
// Runtime: Node.js 18+

import { Client, Storage, Databases } from 'node-appwrite';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

export default async (req, res) => {
  try {
    const { fileId } = JSON.parse(req.body);

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const storage = new Storage(client);
    const databases = new Databases(client);

    // Get file from vault
    const file = await databases.getDocument(
      process.env.APPWRITE_DATABASE_ID,
      'files',
      fileId
    );

    // Download video
    const buffer = await storage.getFileDownload(
      process.env.APPWRITE_BUCKET_VAULT,
      file.appwriteFileId
    );

    // Save temporarily
    const tempDir = `/tmp/hls-${fileId}`;
    fs.mkdirSync(tempDir, { recursive: true });
    const inputPath = path.join(tempDir, 'input.mp4');
    fs.writeFileSync(inputPath, buffer);

    // Transcode to HLS
    const outputPath = path.join(tempDir, 'stream.m3u8');
    execSync(`ffmpeg -i "${inputPath}" -codec: copy -start_number 0 -hls_time 10 -hls_list_size 0 "${outputPath}"`);

    // Upload HLS segments
    const hlsDir = fs.readdirSync(tempDir);
    for (const file of hlsDir) {
      const filePath = path.join(tempDir, file);
      const fileBuffer = fs.readFileSync(filePath);
      await storage.createFile(
        process.env.APPWRITE_BUCKET_HLS,
        `${fileId}/${file}`,
        new Blob([fileBuffer]),
        [`user(${file.userId})`]
      );
    }

    // Update file document
    await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      'files',
      fileId,
      {
        isHLS: true,
        hlsUrl: `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${process.env.APPWRITE_BUCKET_HLS}/files/${fileId}/stream.m3u8/download`
      }
    );

    // Cleanup
    execSync(`rm -rf "${tempDir}"`);

    res.send({
      success: true,
      message: 'HLS transcoding completed',
      hlsUrl: file.hlsUrl
    });

  } catch (err) {
    console.error(err);
    res.send({ success: false, error: err.message }, 500);
  }
};
```

### 10.3 HLS Transcoding Trigger

**Frontend:**
```typescript
// On file preview, check size
if (file.fileSize >= HLS_THRESHOLD) {
  if (!file.isHLS) {
    // Trigger HLS transcoding
    await triggerHLSFunction(fileId);
    // Show "Transcoding..." message
  }
  // Play HLS stream when ready
  playHLSStream(file.hlsUrl);
}
```

---

## 11. Authentication & Security

### 11.1 Authentication Flow

1. **User Registration:**
   - Email + Password → Appwrite SDK
   - Email verification (optional, Phase 2)

2. **User Login:**
   - Email + Password → Appwrite SDK
   - Returns JWT token + session ID
   - Store token in HTTP-only cookie

3. **Token Management:**
   - Default expiry: 24 hours
   - Automatic refresh (if available)
   - Clear on logout

### 11.2 API Security

**All API endpoints require:**
```
Authorization: Bearer [JWT_TOKEN]
```

**Example API call:**
```javascript
const response = await fetch('/api/files/list', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 11.3 CORS Configuration

**For self-hosted Appwrite:**
```javascript
// Appwrite CORS settings
{
  "allowedOrigins": [
    "https://your-frontend-domain.com",
    "http://localhost:3000"  // Dev mode
  ],
  "allowedMethods": ["GET", "POST", "PATCH", "DELETE"],
  "allowedHeaders": ["Authorization", "Content-Type"]
}
```

### 11.4 File Security

- **Appwrite Permissions:** Only authenticated user can access their files
- **Download URLs:** Signed URLs with expiry (Phase 2)
- **Encryption at Rest:** Appwrite-managed (if enabled on instance)

---

## 12. Testing Strategy

### 12.1 Unit Tests (Jest + React Testing Library)

**Focus areas:**
- Appwrite SDK integration
- Storage calculations
- Auth logic
- UI components (isolated)

**Example:**
```typescript
// __tests__/lib/storage.test.ts
describe('Storage Utils', () => {
  it('should calculate remaining vault capacity', () => {
    const used = 10 * 1024 * 1024 * 1024;  // 10GB
    const capacity = 40 * 1024 * 1024 * 1024;  // 40GB
    const remaining = calculateRemaining(used, capacity);
    
    expect(remaining).toBe(30 * 1024 * 1024 * 1024);
  });
});
```

### 12.2 Integration Tests (Vitest)

**Focus areas:**
- Appwrite API calls
- File upload/download
- Search functionality
- Backup vault operations

### 12.3 E2E Tests (Playwright)

**Focus areas:**
- User workflows (login → upload → search → preview)
- Storage warnings
- Backup marking and restoration

**Example:**
```typescript
// tests/e2e/upload.spec.ts
test('user can upload file and see it in vault', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Login")');
  
  // Upload file
  const fileInput = await page.$('input[type="file"]');
  await fileInput.uploadFile('tests/fixtures/video.mp4');
  
  // Verify in list
  await expect(page.locator('text=video.mp4')).toBeVisible();
});
```

### 12.4 Test Coverage Targets

- Unit tests: 80%+ coverage
- Integration tests: Critical user paths
- E2E tests: Happy path + error states

---

## 13. Development Workflow (GitHub Copilot + Claude Sonnet 4.6)

### 13.1 Local Development Setup

```bash
# Clone repository
git clone https://github.com/your-repo/vfx-vault.git
cd vfx-vault

# Install dependencies
npm install
# or
pnpm install

# Copy environment template
cp .env.example .env.local

# Add credentials (from Pranjal)
# NEXT_PUBLIC_APPWRITE_ENDPOINT=...
# NEXT_PUBLIC_APPWRITE_PROJECT_ID=...
# APPWRITE_API_KEY=...

# Verify Appwrite CLI access
appwrite projects list

# Start development server
npm run dev
# Visit http://localhost:3000
```

### 13.2 Copilot + Claude Sonnet Prompts

**Good prompt for feature development:**
```
GitHub Copilot: Using Next.js 14+, TypeScript, and Appwrite SDK, 
implement file upload component with drag-drop. 
Should support multiple file types, show progress, and handle errors. 
Use Appwrite realtime to update file list on success.
```

**Good prompt for bug fix:**
```
Debug: Search is timing out on 10k+ files. 
Implement pagination (50 items per page) and debounce search input (300ms).
Use Appwrite SDK with limit/offset.
```

**Good prompt for schema change:**
```
Add "colorSpace" attribute to files collection. 
Create migration file: migrations/v1.1.0/001_add_colorspace.sql
Include both Appwrite CLI commands and SQL documentation.
```

### 13.3 Copilot Best Practices

1. **Provide context:** Link to PRD and TRD sections
2. **Be specific:** Exact function/component names, expected behavior
3. **Reference schema:** Show Appwrite collection structure
4. **Ask for tests:** Request unit tests alongside feature code
5. **Request documentation:** Comments and JSDoc for complex logic

---

## 14. Deployment & DevOps

### 14.1 Pre-Deployment Checklist

- [ ] All tests passing (unit, integration, E2E)
- [ ] `.env.local` configured with live Appwrite credentials
- [ ] Git commits follow convention, tagged with version
- [ ] Database migrations applied to live Appwrite
- [ ] Storage buckets created and configured
- [ ] Appwrite Cloud Functions deployed (HLS)
- [ ] Realtime subscriptions tested
- [ ] CORS properly configured on Appwrite
- [ ] SSL/HTTPS configured on ExCloud VM
- [ ] Backup of Appwrite data created

### 14.2 Deployment Commands

```bash
# Build Next.js for production
npm run build

# Test build locally
npm run start

# If using Docker (optional)
docker build -t vfx-vault:v1.0.0 .
docker run -p 3000:3000 --env-file .env.local vfx-vault:v1.0.0
```

### 14.3 Post-Deployment Verification

```bash
# Test Appwrite connectivity
curl https://your-appwrite-instance.com/v1/health

# Check file upload
# (manual test via UI)

# Monitor logs
# (check Next.js and Appwrite logs for errors)
```

---

## 15. Troubleshooting Guide

### 15.1 Common Appwrite Issues

#### Issue: "Project not found" error
**Cause:** Wrong `APPWRITE_PROJECT_ID` in `.env.local`  
**Solution:**
```bash
appwrite projects list
# Copy correct project ID to .env.local
```

#### Issue: "API key invalid"
**Cause:** `APPWRITE_API_KEY` expired or wrong  
**Solution:**
```bash
# Regenerate API key in Appwrite Console
# Settings > API Keys > Create new key
# Add to .env.local
```

#### Issue: "Collection not found"
**Cause:** Collection ID mismatch  
**Solution:**
```bash
appwrite databases listCollections --databaseId [DATABASE_ID]
# Verify collection IDs match .env.local
```

#### Issue: HLS transcoding timeout
**Cause:** FFmpeg not available on server, or video too large  
**Solution:**
```bash
# Check FFmpeg installed
which ffmpeg
# Or increase function timeout in Appwrite Dashboard
```

### 15.2 Common Next.js Issues

#### Issue: "Module not found" error
**Cause:** Missing dependency  
**Solution:**
```bash
npm install
# or rebuild node_modules
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "Next.js build fails"
**Cause:** TypeScript errors  
**Solution:**
```bash
npm run type-check
# Fix errors, then npm run build
```

### 15.3 Storage Issues

#### Issue: "Vault is full"
**Cause:** Active files exceed 40GB  
**Solution:**
1. Delete unused files
2. Archive old projects
3. Move files to backup (if backup has space)

#### Issue: "Backup vault is full"
**Cause:** Backup files exceed 10GB  
**Solution:**
1. Unmark less critical files from backup
2. Delete backup files permanently
3. Increase backup capacity (if VM space available)

### 15.4 Realtime Issues

#### Issue: "Realtime connection timeout"
**Cause:** Network issue or Appwrite realtime disabled  
**Solution:**
```bash
# Check Appwrite realtime is enabled
# Fallback to polling (automatic)
```

---

## 16. Performance Benchmarks

### 16.1 Target Performance Metrics

| Metric | Target | Acceptable |
|--------|--------|-----------|
| **File Upload** | <2s for 100MB | <5s |
| **File Download** | <2s for 100MB | <5s |
| **Search (10k files)** | <200ms | <500ms |
| **HLS Transcoding (1GB)** | <2 min | <5 min |
| **UI Render Time** | <1s | <2s |
| **Storage Calculation** | <1s | <3s |

### 16.2 Optimization Strategies

- **Search:** Implement pagination, debounce input
- **Storage Calc:** Cache results, update on change only
- **HLS:** Async background job, show progress
- **UI:** Code splitting, lazy loading, memoization

---

## 17. Documentation Structure

### 17.1 Deliverable Documents

| Document | Location | Purpose |
|----------|----------|---------|
| **TRD (This)** | `/docs/TRD.md` | Technical specifications |
| **Setup Guide** | `/docs/SETUP.md` | Local development setup |
| **API Docs** | `/docs/API.md` | Endpoint documentation |
| **Appwrite Setup** | `/docs/APPWRITE_SETUP.md` | Appwrite configuration |
| **Troubleshooting** | `/docs/TROUBLESHOOTING.md` | Common issues & fixes |
| **Deployment Guide** | `/docs/DEPLOYMENT.md` | Production deployment |
| **Migration Guide** | `/migrations/README.md` | Schema migration process |

### 17.2 Inline Documentation

- **JSDoc:** All functions documented with parameters, returns, examples
- **Comments:** Complex logic explained (why, not what)
- **Type definitions:** Full TypeScript types with descriptions

---

## 18. Version History

| Version | Date | Changes |
|---------|------|---------|
| **v1.0.0** | 2026-03-05 | Initial TRD - MVP specifications |
| **v1.1.0** | TBD | HLS optimization, performance improvements |
| **v2.0.0** | TBD | Multi-user support, advanced search |

---

## 19. Approval & Sign-Off

| Role | Name | Date | Approval |
|------|------|------|----------|
| Product Owner | Pranjal Sharma | 2026-03-05 | ✅ Approved |
| Technical Lead | [To be assigned] | — | — |
| DevOps Lead | [To be assigned] | — | — |

---

## 20. Appendix: Reference Commands

### Appwrite CLI Commands

```bash
# Verify access
appwrite --version

# List projects
appwrite projects list

# Create collection
appwrite databases createCollection \
  --databaseId [DATABASE_ID] \
  --collectionId [COLLECTION_ID] \
  --name "Collection Name"

# Add attribute
appwrite databases createAttribute \
  --databaseId [DATABASE_ID] \
  --collectionId [COLLECTION_ID] \
  --key attributeName \
  --type string \
  --size 500 \
  --required true

# Create index
appwrite databases createIndex \
  --databaseId [DATABASE_ID] \
  --collectionId [COLLECTION_ID] \
  --key indexName \
  --type key \
  --attributes userId,createdDate

# Create storage bucket
appwrite storage createBucket \
  --bucketId bucket-name \
  --name "Bucket Name" \
  --permission document
```

### Git Commands

```bash
# Create feature branch
git checkout -b feature/feature-name

# Commit with convention
git commit -m "feat: scope - description"

# Push and create PR
git push origin feature/feature-name

# Tag release
git tag -a v1.0.0 -m "Release v1.0.0"

# Merge to main
git checkout main
git merge --no-ff feature/feature-name
git push origin main
```

### NPM Commands

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run tests
npm test

# Run linter
npm run lint

# Type check
npm run type-check
```

---

**END OF TRD**

This document is your technical blueprint. Keep it updated as you build, and reference it when onboarding new features with Copilot + Claude Sonnet 4.6.

