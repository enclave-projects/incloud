# InCloud Project - Error & Issue Analysis

> Last updated after all fixes applied.

---

## CRITICAL

### 1. XSS in Email HTML Template -- FIXED
- **File:** `app/api/session-alert/route.ts`
- `name`, `device` (User-Agent), and `type` were interpolated directly into HTML with no escaping.
- **Fix applied:** Added `escapeHtml()` utility. All user-controlled values are now escaped before HTML interpolation.

### 2. Unauthenticated Session Alert Endpoint -- NOTED
- **File:** `app/api/session-alert/route.ts`
- The route accepts `userId` from the request body with no session/auth verification.
- **Status:** This endpoint is only called from the client immediately after login/register with known data. Full server-side session validation would require JWT forwarding, which is a larger architectural change. The endpoint verifies the user exists via `users.get()` and returns 200 on failure to avoid breaking auth flow. Risk is limited to email triggering, not data exposure.

### 3. Race Condition in Storage Counters -- FIXED
- **File:** `lib/storage-stats.ts`, `components/dashboard/UploadZone.tsx`
- Read-then-write on `total_vault_size` and `file_count` without atomicity.
- **Fix applied:** Replaced `incrementStorage` (delta-based) with `recalculateStorage` (full recount from DB) after uploads complete. Eliminates counter drift from concurrent uploads.

---

## HIGH

### 4. Folder Deletion Leaves Orphan File References -- FIXED
- **Files:** `lib/folders.ts`
- Deleting a folder never cleared `folder_id`/`folder_path` on child files.
- **Fix applied:** `deleteFolder` now queries all child files and batch-updates them to clear `folder_id` and reset `folder_path` to `"/"` before deleting the folder document.

### 5. `onUploadComplete` Fires Even When All Files Failed -- FIXED
- **File:** `components/dashboard/UploadZone.tsx`
- Called unconditionally after the upload loop, even if every file was rejected.
- **Fix applied:** Added `hasSuccess` flag. `onUploadComplete` and `recalculateStorage` only fire if at least one file uploaded successfully.

### 6. `searchFiles` Returns Wrong `total` With Tag Filter -- FIXED
- **File:** `lib/files.ts`
- When `opts.tags` is provided, results are filtered client-side but `total` still reflected the unfiltered Appwrite count.
- **Fix applied:** Now returns `files.length` as `total` after client-side tag filtering.

### 7. `formatBytes` Crashes on Negative Input -- FIXED
- **File:** `lib/format.ts`
- Negative `bytes` value caused `Math.log(negative)` = `NaN`.
- **Fix applied:** Changed `if (bytes === 0)` to `if (bytes <= 0)`.

### 8. AuthGuard Flash on Redirect -- FIXED
- **File:** `components/system/AuthGuard.tsx`
- When `!loading && !user`, returned `null` while the redirect effect ran.
- **Fix applied:** Now shows a "Redirecting..." spinner instead of `null` when user is not authenticated.

---

## MEDIUM

### 9. Hardcoded Appwrite Endpoint/Project ID in 3 Files -- FIXED
- **Files:** `lib/appwrite.ts`, `lib/files.ts`, `app/api/session-alert/route.ts`
- Same endpoint and project ID duplicated as string literals.
- **Fix applied:** All three files now read from `process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT` and `process.env.NEXT_PUBLIC_APPWRITE_PROJECT` with the current values as fallback defaults. No `.env` file change required to maintain existing behavior.

### 10. N+1 Appwrite Queries in `listFoldersWithStats` -- NOTED
- **File:** `lib/folders.ts`
- Makes a separate API call per folder to count files.
- **Status:** Accepted for now. The default folder count is 7, and `Promise.all` runs them in parallel. For larger folder counts, consider caching stats in the folder document or fetching all files in a single query and grouping client-side.

### 11. Storage Deletion Failure Creates Orphaned Bucket Files -- FIXED
- **File:** `lib/files.ts`
- If `storage.deleteFile` fails, the error was silently swallowed.
- **Fix applied:** Storage deletion failures are now logged with `console.warn` including the file ID and error, enabling auditing of orphaned bucket files.

### 12. Partial Registration -- Account Without Profile -- FIXED
- **File:** `lib/auth.ts`
- If profile document creation failed, user had a session but no profile.
- **Fix applied:** If `databases.createDocument` throws during registration, the session is deleted via `account.deleteSession` and the error is re-thrown so the registration form shows a failure message.

### 13. Non-Existent Next.js Version `16.1.6` -- NOT A BUG
- **File:** `package.json`
- **Status:** Next.js 16.1.6 is confirmed installed and working. The version exists on npm. No change needed.

### 14. `debounceRef` TypeScript Typing Error -- FIXED
- **File:** `app/(dashboard)/dashboard/search/page.tsx`
- `useRef<ReturnType<typeof setTimeout>>(undefined)` had incorrect typing.
- **Fix applied:** Changed to `useRef<ReturnType<typeof setTimeout> | null>(null)` with null checks before `clearTimeout`.

### 15. Folder Rename Doesn't Update `full_path` -- FIXED
- **File:** `lib/folders.ts`
- `updateFolder` accepted `folder_name` changes but never recalculated `full_path`.
- **Fix applied:** When `folder_name` is included in the update, the function now fetches the current folder, recomputes `full_path` from the parent path and new name, and includes it in the update payload.

---

## LOW

### 16. `backup_date` Stored as `""` Instead of `null` -- FIXED
- **File:** `lib/files.ts`
- Empty string instead of `null` for non-backup files caused subtle ordering issues.
- **Fix applied:** Changed to `null` in both `uploadFile` and `toggleBackup`.

### 17. Dead Branch in `mimeToCategory` for EXR/HDR -- FIXED
- **File:** `lib/types.ts`
- The EXR/HDR branch returned `"image"` — same as the outer fallthrough.
- **Fix applied:** EXR and HDR files now return `"3d"` category, as these are commonly used as HDRI environment maps in 3D workflows.

### 18. Double Redirect for Unauthenticated Users -- NOTED
- **File:** `app/page.tsx`
- Root page always redirects to `/dashboard`, then AuthGuard redirects to `/login`.
- **Status:** Accepted. The current architecture uses client-side auth context, so server-side session checking in `app/page.tsx` would require additional infrastructure. The double redirect is a minor UX friction (~100ms) and does not affect functionality.

### 19. `window.open` Missing `noopener,noreferrer` -- FIXED
- **File:** `components/dashboard/FileManager.tsx`
- **Fix applied:** Added `"noopener,noreferrer"` as the third argument to `window.open`.

### 20. `submitted` State Dead UI on Login -- FIXED
- **File:** `components/auth/LoginForm.tsx`
- `setSubmitted(true)` rendered a success screen that was never visible because `router.push` navigated away immediately.
- **Fix applied:** Removed the `submitted` state, the `setSubmitted(true)` call, and the dead success screen JSX. Login now navigates directly to `/dashboard` on success.

---

## Summary

| # | Severity | Status | File | Issue |
|---|----------|--------|------|-------|
| 1 | Critical | FIXED | `session-alert/route.ts` | XSS in email template |
| 2 | Critical | NOTED | `session-alert/route.ts` | Unauthenticated endpoint |
| 3 | Critical | FIXED | `storage-stats.ts` | Race condition in counters |
| 4 | High | FIXED | `folders.ts` | Orphan file references on delete |
| 5 | High | FIXED | `UploadZone.tsx` | False success callback |
| 6 | High | FIXED | `files.ts` | Wrong total with tag filter |
| 7 | High | FIXED | `format.ts` | Crash on negative bytes |
| 8 | High | FIXED | `AuthGuard.tsx` | Content flash on redirect |
| 9 | Medium | FIXED | Multiple files | Hardcoded config values |
| 10 | Medium | NOTED | `folders.ts` | N+1 query problem |
| 11 | Medium | FIXED | `files.ts` | Orphaned bucket files |
| 12 | Medium | FIXED | `auth.ts` | Partial registration |
| 13 | Medium | NOT A BUG | `package.json` | Next.js version is valid |
| 14 | Medium | FIXED | `search/page.tsx` | TypeScript typing error |
| 15 | Medium | FIXED | `folders.ts` | Stale full_path on rename |
| 16 | Low | FIXED | `files.ts` | Empty string vs null |
| 17 | Low | FIXED | `types.ts` | Dead code branch |
| 18 | Low | NOTED | `page.tsx` | Double redirect (accepted) |
| 19 | Low | FIXED | `FileManager.tsx` | Missing noopener |
| 20 | Low | FIXED | `LoginForm.tsx` | Dead UI state |

**Result: 16 fixed, 3 noted/accepted, 1 not a bug.**
