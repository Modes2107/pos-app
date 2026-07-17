"use client";

import { useMemo, useState } from "react";
import type { CartItem, PaymentType, SaleDTO } from "@/types";

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export default function CheckoutModal({
  items,
  onClose,
  onCompleted,
}: {
  items: CartItem[];
  onClose: () => void;
  onCompleted: (sale: SaleDTO) => void;
}) {
  const total = useMemo(
    () => Math.round(items.reduce((sum, i) => sum + i.price * i.quantity, 0) * 100) / 100,
    [items]
  );

  const [paymentType, setPaymentType] = useState<PaymentType>("CARD");
  const [cashGiven, setCashGiven] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cashGivenNumber = Number(cashGiven.replace(",", "."));
  const change =
    paymentType === "CASH" && !Number.isNaN(cashGivenNumber) && cashGivenNumber >= total
      ? Math.round((cashGivenNumber - total) * 100) / 100
      : null;

  const canSubmit =
    paymentType === "CARD" || (!Number.isNaN(cashGivenNumber) && cashGivenNumber >= total);

  async function handleConfirm() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentType,
          cashGiven: paymentType === "CASH" ? cashGivenNumber : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Не вдалося оформити продаж");
        return;
      }
      onCompleted(data as SaleDTO);
    } catch {
      setError("Немає з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-md sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-slate-900">Оплата</h2>
          <button
            onClick={onClose}
            className="btn-press flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500"
            aria-label="Закрити"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mb-5 rounded-2xl bg-slate-50 p-4 text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">До сплати</p>
          <p className="font-display text-4xl font-bold text-slate-900">{total.toFixed(2)} ₴</p>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => setPaymentType("CARD")}
            className={`btn-press rounded-xl border-2 py-3.5 text-sm font-semibold transition-colors ${
              paymentType === "CARD"
                ? "border-card-500 bg-card-500/10 text-card-600"
                : "border-slate-200 text-slate-500"
            }`}
          >
            💳 Картка
          </button>
          <button
            onClick={() => setPaymentType("CASH")}
            className={`btn-press rounded-xl border-2 py-3.5 text-sm font-semibold transition-colors ${
              paymentType === "CASH"
                ? "border-cash-500 bg-cash-500/10 text-cash-600"
                : "border-slate-200 text-slate-500"
            }`}
          >
            💵 Готівка
          </button>
        </div>

        {paymentType === "CASH" && (
          <div className="mb-4 space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Сума, яку дав покупець
              </label>
              <input
                type="text"
                inputMode="decimal"
                value={cashGiven}
                onChange={(e) => setCashGiven(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-lg font-semibold outline-none focus:border-cash-500 focus:ring-2 focus:ring-cash-500/10"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setCashGiven(String(amount))}
                  className="btn-press rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600"
                >
                  {amount} ₴
                </button>
              ))}
              <button
                onClick={() => setCashGiven(String(total))}
                className="btn-press rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-600"
              >
                Без решти
              </button>
            </div>
            {change !== null && (
              <div className="flex items-center justify-between rounded-xl bg-cash-500/10 px-4 py-3">
                <span className="text-sm font-medium text-cash-600">Решта</span>
                <span className="font-display text-xl font-bold text-cash-600">
                  {change.toFixed(2)} ₴
                </span>
              </div>
            )}
          </div>
        )}

        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleConfirm}
          disabled={!canSubmit || loading}
          className="btn-press w-full rounded-xl bg-brand-700 py-4 text-base font-semibold text-white shadow-soft transition-colors hover:bg-brand-600 disabled:opacity-40"
        >
          {loading ? "Оформлюємо..." : "Підтвердити оплату"}
        </button>
      </div>
    </div>
  );
}
