import { ID, Models, Permission, Role } from "appwrite";
import { account, databases } from "@/lib/appwrite";
import { APPWRITE_DB_ID, APPWRITE_COLLECTION_PROFILES } from "@/lib/config";

/* ── Types ────────────────────────────────────────────── */

export interface UserProfile extends Models.Document {
  user_id: string;
  name: string;
  email: string;
  registered_at: string;
  storage_used: number;
  plan: string;
}

export interface AuthError {
  message: string;
  code?: number;
}

/* ── Register ─────────────────────────────────────────── */

/**
 * Creates an Appwrite account, opens a session, then writes a
 * user_profiles document. Uses SDK v23 object-based parameters.
 */
export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<UserProfile> {
  // 1. Create the account (SDK v23: object params)
  const user = await account.create({
    userId: ID.unique(),
    email,
    password,
    name,
  });

  // 2. Destroy any stale session before creating a new one
  try {
    await account.deleteSession({ sessionId: "current" });
  } catch {
    // No active session – that's fine
  }

  // 3. Open a session so we can write an authenticated document
  await account.createEmailPasswordSession({
    email,
    password,
  });

  // 4. Write registration metadata – document ID = Appwrite user ID
  let profile: UserProfile;
  try {
    profile = await databases.createDocument<UserProfile>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_PROFILES,
      documentId: user.$id,
      data: {
        user_id: user.$id,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        registered_at: new Date().toISOString(),
        storage_used: 0,
        plan: "free",
      },
      permissions: [
        Permission.read(Role.user(user.$id)),
        Permission.update(Role.user(user.$id)),
      ],
    });
  } catch (profileErr) {
    // Roll back the session so user isn't left in a broken state
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch {
      // ignore cleanup failure
    }
    throw profileErr;
  }

  return profile;
}

/* ── Login ────────────────────────────────────────────── */

/**
 * Creates an email/password session.
 * Returns the Appwrite user object on success.
 */
export async function loginUser(email: string, password: string) {
  // Destroy any stale session first
  try {
    await account.deleteSession({ sessionId: "current" });
  } catch {
    // No active session – that's fine
  }
  await account.createEmailPasswordSession({ email, password });
  return account.get();
}

/* ── Logout ───────────────────────────────────────────── */

export async function logoutUser(): Promise<void> {
  await account.deleteSession({ sessionId: "current" });
}

/* ── Get current user ─────────────────────────────────── */

/**
 * Returns the logged-in Appwrite user, or null if not authenticated.
 */
export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

/* ── Get user profile ─────────────────────────────────── */

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    return await databases.getDocument<UserProfile>({
      databaseId: APPWRITE_DB_ID,
      collectionId: APPWRITE_COLLECTION_PROFILES,
      documentId: userId,
    });
  } catch {
    return null;
  }
}

/* ── Update user display name ─────────────────────── */

export async function updateUserName(
  name: string
): Promise<Models.User<Models.Preferences>> {
  return account.updateName({ name });
}

/* ── Update user profile document ─────────────────── */

export async function updateUserProfile(
  userId: string,
  data: { name?: string; email?: string }
): Promise<UserProfile> {
  return databases.updateDocument<UserProfile>({
    databaseId: APPWRITE_DB_ID,
    collectionId: APPWRITE_COLLECTION_PROFILES,
    documentId: userId,
    data,
  });
}
