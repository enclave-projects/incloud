import { NextResponse } from "next/server";

const ENDPOINT =
  process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ||
  "https://appwrite.enclaveprojects.dev/v1";

const PROJECT =
  process.env.NEXT_PUBLIC_APPWRITE_PROJECT || "incloud-enclaveprojects";

const TIMEOUT_MS = 6_000;

export type ServiceStatus = "operational" | "down";
export type HealthStatus = "operational" | "degraded" | "down";

export interface ServiceCheck {
  status: ServiceStatus;
  latency: number | null;
}

export interface HealthResponse {
  status: HealthStatus;
  latency: number | null;
  checkedAt: string;
  services: {
    api: ServiceCheck;
    authentication: ServiceCheck;
    database: ServiceCheck;
    storage: ServiceCheck;
    realtime: ServiceCheck;
    email: ServiceCheck;
  };
}

/**
 * Probe a single URL.
 * KEY FIX: ANY HTTP response (including 401/403) = service is UP.
 * Only a network error or 5xx = down.
 * A 401 simply means "needs auth" — the service itself is running.
 */
async function probe(path: string): Promise<ServiceCheck> {
  const start = Date.now();
  try {
    const res = await fetch(`${ENDPOINT}${path}`, {
      method: "GET",
      headers: { "X-Appwrite-Project": PROJECT },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const latency = Date.now() - start;
    // 5xx = server error = degraded/down; anything else = service is responding
    return {
      status: res.status < 500 ? "operational" : "down",
      latency,
    };
  } catch {
    return { status: "down", latency: null };
  }
}

export async function GET() {
  // Run all service probes in parallel
  const [api, auth, db, storage, realtime, email] = await Promise.all([
    // API Gateway — probe the locale endpoint (public, no auth needed)
    probe("/locale"),
    // Authentication — 401 expected without session = service is running
    probe("/account"),
    // Database — 401 expected without auth = service is running
    probe("/databases"),
    // File Storage — 401 expected = service is running
    probe("/storage/buckets"),
    // Realtime — health check for the queue (401 without API key = running)
    probe("/health/queue/messaging"),
    // Email queue — 401 without API key = service is running
    probe("/health/queue/emails"),
  ]);

  const services = {
    api,
    authentication: auth,
    database: db,
    storage,
    realtime,
    email,
  };

  const downCount = Object.values(services).filter(
    (s) => s.status === "down"
  ).length;

  const overall: HealthStatus =
    downCount === 0
      ? "operational"
      : downCount < Object.keys(services).length
      ? "degraded"
      : "down";

  // Overall latency = API gateway latency (first meaningful response)
  const latency = api.latency;

  const body: HealthResponse = {
    status: overall,
    latency,
    checkedAt: new Date().toISOString(),
    services,
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
