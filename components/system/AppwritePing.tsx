"use client";

import { useEffect } from "react";
import { client } from "@/lib/appwrite";

export default function AppwritePing() {
  useEffect(() => {
    // Verify Appwrite connectivity as soon as the app loads.
    void client.ping().catch(() => {
      // Swallow in UI; this is only a connectivity probe.
    });
  }, []);

  return null;
}
