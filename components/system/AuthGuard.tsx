"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: "var(--dash-bg)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--dash-accent)", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "var(--dash-text-2)" }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: "var(--dash-bg)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--dash-accent)", borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: "var(--dash-text-2)" }}>
            Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
