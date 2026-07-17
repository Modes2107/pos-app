"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // тихо ігноруємо - PWA не критична для роботи додатку
      });
    }
  }, []);

  return null;
}
