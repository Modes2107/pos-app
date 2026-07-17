"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  onDetected: (code: string) => void;
  onClose: () => void;
};

// Розширення window.BarcodeDetector, якого немає у стандартних типах TS
declare global {
  interface Window {
    BarcodeDetector?: new (options?: { formats?: string[] }) => {
      detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
    };
  }
}

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [manualCode, setManualCode] = useState("");

  useEffect(() => {
    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | undefined;

    async function start() {
      if (typeof window === "undefined" || !window.BarcodeDetector) {
        setSupported(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const detector = new window.BarcodeDetector({
          formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "code_39", "qr_code"],
        });

        intervalId = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const codes = await detector.detect(videoRef.current);
            if (codes.length > 0 && !cancelled) {
              onDetected(codes[0].rawValue);
            }
          } catch {
            // ігноруємо помилки поодиноких кадрів
          }
        }, 350);
      } catch (e) {
        setError("Немає доступу до камери. Дозвольте доступ у налаштуваннях браузера.");
      }
    }

    start();

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (manualCode.trim()) {
      onDetected(manualCode.trim());
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between p-4">
        <p className="font-medium text-white">Сканування штрих-коду</p>
        <button
          onClick={onClose}
          className="btn-press rounded-full bg-white/10 p-2 text-white"
          aria-label="Закрити"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {supported ? (
        <div className="relative flex-1 overflow-hidden">
          <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-32 w-64 rounded-2xl border-2 border-brand-300/80" />
          </div>
          {error && (
            <p className="absolute inset-x-4 bottom-6 rounded-xl bg-red-600/90 px-4 py-3 text-center text-sm text-white">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center text-white">
          <p className="text-sm text-slate-300">
            Ваш браузер не підтримує автоматичне сканування штрих-кодів (BarcodeDetector). Введіть
            код вручну — наприклад, використовуючи зовнішній сканер, який працює як клавіатура.
          </p>
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="flex gap-2 p-4">
        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          autoFocus={!supported}
          placeholder="Введіть штрих-код вручну"
          className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-brand-300"
        />
        <button
          type="submit"
          className="btn-press rounded-xl bg-brand-600 px-5 py-3 font-medium text-white"
        >
          OK
        </button>
      </form>
    </div>
  );
}
