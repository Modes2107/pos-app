"use client";

import { useEffect, useState } from "react";
import { DailyBarChart, TopProductsBars } from "@/components/stats/Charts";
import type { StatsDTO } from "@/types";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "cash" | "card";
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-card">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p
        className={`mt-1 font-display text-2xl font-bold ${
          accent === "cash" ? "text-cash-600" : accent === "card" ? "text-card-600" : "text-slate-900"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

export default function StatsClient() {
  const [stats, setStats] = useState<StatsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    const offset = new Date().getTimezoneOffset();
    fetch(`/api/stats?tzOffset=${offset}`)
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  async function handleReset() {  // ← ПЕРЕНЕСИ СЮДИ, ДО if()
    if (!confirm("Видалити всю статистику та продажи? Це неможна буде відмінити!")) return;
    setResetting(true);
    try {
      const res = await fetch("/api/stats/reset", { method: "POST" });
      if (res.ok) {
        setStats(null);
        window.location.reload();
      }
    } finally {
      setResetting(false);
    }
  }

  if (loading || !stats) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4 p-4 pb-8">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-slate-900">Статистика</h1>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="btn-press rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {resetting ? "Видаляємо..." : "🗑️ Очистити"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Сьогодні" value={`${stats.todayTotal.toFixed(2)} ₴`} />
        <StatCard label="Чеків сьогодні" value={String(stats.todayCount)} />
        <StatCard label="За 7 днів" value={`${stats.weekTotal.toFixed(2)} ₴`} />
        <StatCard label="За 30 днів" value={`${stats.monthTotal.toFixed(2)} ₴`} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Готівка (30 дн.)" value={`${stats.cashTotal.toFixed(2)} ₴`} accent="cash" />
        <StatCard label="Картка (30 дн.)" value={`${stats.cardTotal.toFixed(2)} ₴`} accent="card" />
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <h2 className="mb-3 font-display text-sm font-bold text-slate-700">
          Виручка за останні 30 днів
        </h2>
        <DailyBarChart data={stats.dailyTotals} />
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-3 font-display text-sm font-bold text-slate-700">
            Топ товарів за виручкою
          </h2>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-slate-400">Ще немає продажів</p>
          ) : (
            <TopProductsBars data={stats.topProducts} />
          )}
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <h2 className="mb-3 font-display text-sm font-bold text-slate-700">
            Товари, що закінчуються
          </h2>
          {stats.lowStock.length === 0 ? (
            <p className="text-sm text-slate-400">Усі товари в достатній кількості</p>
          ) : (
            <ul className="space-y-2">
              {stats.lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <span className="truncate pr-2 text-slate-600">{p.name}</span>
                  <span className="shrink-0 font-semibold text-amber-600">
                    {p.stock} / мін. {p.minStock}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
