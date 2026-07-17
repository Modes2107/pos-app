"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductImage from "@/components/ProductImage";
import type { ProductDTO } from "@/types";

export default function WarehouseClient() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadProducts = useCallback((q: string, lowStock: boolean) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (lowStock) params.set("lowStock", "1");
    params.set("pageSize", "200");
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.items))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProducts(search, lowStockOnly);
  }, [lowStockOnly, loadProducts]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadProducts(value, lowStockOnly), 300);
  }

  async function adjustStock(product: ProductDTO, delta: number) {
    const newStock = Math.max(0, product.stock + delta);
    setSavingId(product.id);
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, stock: newStock } : p))
    );
    try {
      await fetch(`/api/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
    } finally {
      setSavingId(null);
    }
  }

  async function setStockValue(product: ProductDTO, value: string) {
    const parsed = Math.max(0, Math.round(Number(value)));
    if (Number.isNaN(parsed)) return;
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: parsed } : p)));
    await fetch(`/api/products/${product.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stock: parsed }),
    });
  }

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">Склад</h1>
            <p className="text-xs text-slate-400">
              {products.length} позицій
              {lowStockCount > 0 && (
                <span className="ml-1 font-medium text-amber-600">
                  · {lowStockCount} з малим залишком
                </span>
              )}
            </p>
          </div>
          <a
            href="/api/products/export"
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
          </a>
        </div>

        <div className="mt-3 flex gap-2">
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Пошук товару..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
          <label className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-xs font-medium text-slate-500">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-3.5 w-3.5 accent-amber-600"
            />
            Мало
          </label>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2 p-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 p-4">
          {products.map((product) => {
            const low = product.stock <= product.minStock;
            return (
              <div
                key={product.id}
                className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card ${
                  savingId === product.id ? "opacity-70" : ""
                }`}
              >
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
                  <p className="text-xs text-slate-400">
                    {product.sku} · мін. {product.minStock} шт
                  </p>
                  {low && (
                    <span className="mt-0.5 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                      Потрібне поповнення
                    </span>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    onClick={() => adjustStock(product, -1)}
                    className="btn-press flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    value={product.stock}
                    onChange={(e) => setStockValue(product, e.target.value)}
                    className="w-16 rounded-lg border border-slate-200 py-1.5 text-center text-sm font-semibold"
                  />
                  <button
                    onClick={() => adjustStock(product, 1)}
                    className="btn-press flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
