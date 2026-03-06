"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Models } from "appwrite";
import { getCurrentUser, logoutUser } from "@/lib/auth";
import { getStorageMetadata } from "@/lib/storage-stats";
import { getUserSettings } from "@/lib/settings";

interface AuthContextValue {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const u = await getCurrentUser();
      setUser(u);

      // If user exists, ensure default data is seeded
      if (u) {
        // Ensure storage & settings docs exist (create-if-not-exists)
        Promise.all([
          getStorageMetadata(u.$id),
          getUserSettings(u.$id),
        ]).catch(() => {});
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
