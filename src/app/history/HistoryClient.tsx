"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { SaleDTO } from "@/types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function HistoryClient() {
  const [sales, setSales] = useState<SaleDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState(todayStr());
  const [to, setTo] = useState(todayStr());
  const [paymentType, setPaymentType] = useState<"" | "CASH" | "CARD">("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const buildParams = useCallback(
    (q: string) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (paymentType) params.set("paymentType", paymentType);
      if (q) params.set("q", q);
      params.set("pageSize", "100");
      return params;
    },
    [from, to, paymentType]
  );

  const loadSales = useCallback(
    (q: string) => {
      setLoading(true);
      fetch(`/api/sales?${buildParams(q).toString()}`)
        .then((r) => r.json())
        .then((data) => setSales(data.items))
        .finally(() => setLoading(false));
    },
    [buildParams]
  );

  useEffect(() => {
    loadSales(search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, paymentType]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadSales(value), 300);
  }

  function handleExport() {
    const params = buildParams("");
    window.location.href = `/api/sales/export?${params.toString()}`;
  }

  const total = sales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">Історія продажів</h1>
            <p className="text-xs text-slate-400">
              {sales.length} чеків · {total.toFixed(2)} ₴
            </p>
          </div>
          <button
            onClick={handleExport}
            className="btn-press flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-sm font-medium text-slate-600"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
              <path
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Експорт CSV
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
        </div>

        <div className="mt-2 flex gap-2">
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Пошук за товаром або номером чека..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="mt-2 flex gap-2">
          {(["", "CASH", "CARD"] as const).map((pt) => (
            <button
              key={pt}
              onClick={() => setPaymentType(pt)}
              className={`btn-press rounded-full px-3 py-1.5 text-xs font-medium ${
                paymentType === pt ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {pt === "" ? "Усі" : pt === "CASH" ? "Готівка" : "Картка"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : sales.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-16 text-center text-slate-400">
          <p className="text-sm">Продажів за обраний період не знайдено</p>
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {sales.map((sale) => {
            const expanded = expandedId === sale.id;
            const date = new Date(sale.createdAt);
            return (
              <div key={sale.id} className="rounded-2xl bg-white shadow-card">
                <button
                  onClick={() => setExpandedId(expanded ? null : sale.id)}
                  className="flex w-full items-center gap-3 p-3.5 text-left"
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      sale.paymentType === "CASH"
                        ? "bg-cash-500/10 text-cash-600"
                        : "bg-card-500/10 text-card-600"
                    }`}
                  >
                    {sale.paymentType === "CASH" ? "₴" : "💳"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">Чек №{sale.number}</p>
                    <p className="text-xs text-slate-400">
                      {date.toLocaleDateString("uk-UA")}{" "}
                      {date.toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })} ·{" "}
                      {sale.items.length} поз.
                    </p>
                  </div>
                  <span className="font-display text-base font-bold text-slate-900">
                    {sale.total.toFixed(2)} ₴
                  </span>
                </button>
                {expanded && (
                  <div className="border-t border-slate-100 px-3.5 py-3">
                    {sale.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between py-1 text-sm">
                        <span className="text-slate-600">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="font-medium text-slate-800">
                          {item.subtotal.toFixed(2)} ₴
                        </span>
                      </div>
                    ))}
                    {sale.paymentType === "CASH" && (
                      <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 text-xs text-slate-400">
                        <span>Отримано {sale.cashGiven?.toFixed(2)} ₴</span>
                        <span>Решта {sale.changeGiven?.toFixed(2)} ₴</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
