"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onDetected: (code: string) => void;
  onClose: () => void;
};

export default function BarcodeScanner({ onDetected, onClose }: Props) {
  const qrScannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const scanner = new Html5Qrcode("qr-reader");
        qrScannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!cancelled) {
              onDetected(decodedText);
            }
          },
          () => {}
        );
        
        if (!cancelled) setScanning(true);
      } catch (e) {
        if (!cancelled) {
          setError("Немає доступу до камери. Дозвольте доступ у налаштуваннях браузера.");
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      qrScannerRef.current?.stop().catch(() => {});
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

      <div className="relative flex-1 overflow-hidden">
        <div id="qr-reader" style={{ width: "100%", height: "100%" }} />
        {error && (
          <p className="absolute inset-x-4 bottom-6 rounded-xl bg-red-600/90 px-4 py-3 text-center text-sm text-white">
            {error}
          </p>
        )}
      </div>

      <form onSubmit={handleManualSubmit} className="flex gap-2 p-4">
        <input
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          autoFocus
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