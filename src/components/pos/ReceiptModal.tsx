"use client";

import type { SaleDTO } from "@/types";

export default function ReceiptModal({ sale, onClose }: { sale: SaleDTO; onClose: () => void }) {
  const date = new Date(sale.createdAt);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7">
            <path
              d="m5 13 4 4 10-10"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-slate-900">Продаж оформлено</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          Чек №{sale.number} · {date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}
        </p>

        <div className="my-4 max-h-48 overflow-y-auto rounded-xl bg-slate-50 p-3 text-left">
          {sale.items.map((item, idx) => (
            <div key={idx} className="flex justify-between py-1 text-sm">
              <span className="text-slate-600">
                {item.name} × {item.quantity}
              </span>
              <span className="font-medium text-slate-800">{item.subtotal.toFixed(2)} ₴</span>
            </div>
          ))}
        </div>

        <div className="space-y-1 border-t border-slate-100 pt-3 text-left">
          <div className="flex justify-between">
            <span className="text-sm text-slate-500">
              Оплата: {sale.paymentType === "CASH" ? "Готівка" : "Картка"}
            </span>
            <span className="font-display text-lg font-bold text-slate-900">
              {sale.total.toFixed(2)} ₴
            </span>
          </div>
          {sale.paymentType === "CASH" && sale.cashGiven !== null && (
            <>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Отримано</span>
                <span>{sale.cashGiven.toFixed(2)} ₴</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-cash-600">
                <span>Решта</span>
                <span>{(sale.changeGiven ?? 0).toFixed(2)} ₴</span>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="btn-press mt-5 w-full rounded-xl bg-brand-700 py-3.5 text-base font-semibold text-white shadow-soft hover:bg-brand-600"
        >
          Новий продаж
        </button>
      </div>
    </div>
  );
}
