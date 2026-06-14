"use client";

// Registers the static service worker that helps Android Chrome treat the app like an installable PWA.
import { useEffect } from "react";

export function PWARegister() {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  return null;
}
