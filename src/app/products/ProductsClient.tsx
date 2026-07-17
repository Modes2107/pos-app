"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import ProductImage from "@/components/ProductImage";
import ProductForm from "./ProductForm";
import type { ProductDTO } from "@/types";

type Category = { id: string; name: string };

export default function ProductsClient() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);
  const [showForm, setShowForm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const loadCategories = useCallback(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const loadProducts = useCallback(
    (q: string, categoryId: string | null, lowStock: boolean, includeInactive: boolean) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (categoryId) params.set("categoryId", categoryId);
      if (lowStock) params.set("lowStock", "1");
      if (includeInactive) params.set("includeInactive", "1");
      params.set("pageSize", "200");
      fetch(`/api/products?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => setProducts(data.items))
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadProducts(search, activeCategory, lowStockOnly, showInactive);
  }, [activeCategory, lowStockOnly, showInactive, loadProducts]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(
      () => loadProducts(value, activeCategory, lowStockOnly, showInactive),
      300
    );
  }

  function refresh() {
    loadProducts(search, activeCategory, lowStockOnly, showInactive);
    loadCategories();
  }

  function openNewProduct() {
    setEditingProduct(null);
    setShowForm(true);
  }

  function openEditProduct(product: ProductDTO) {
    setEditingProduct(product);
    setShowForm(true);
  }

  async function handleDelete(product: ProductDTO) {
    if (!confirm(`Видалити товар "${product.name}"?`)) return;
    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (res.ok) refresh();
  }

  function handleSaved() {
    setShowForm(false);
    refresh();
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-slate-900">Товари</h1>
            <p className="text-xs text-slate-400">{products.length} позицій</p>
          </div>
          <div className="flex gap-2">
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
              <span className="hidden sm:inline">CSV</span>
            </a>
            <button
              onClick={openNewProduct}
              className="btn-press flex h-11 items-center gap-1.5 rounded-xl bg-brand-700 px-4 text-sm font-semibold text-white shadow-soft"
            >
              + Товар
            </button>
          </div>
        </div>

        <div className="mt-3">
          <input
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Пошук за назвою, артикулом, штрих-кодом..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className={`btn-press shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
              activeCategory === null ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-500"
            }`}
          >
            Усі категорії
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`btn-press shrink-0 rounded-full px-3 py-1.5 text-xs font-medium ${
                activeCategory === c.id ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-500"
              }`}
            >
              {c.name}
            </button>
          ))}
          <label className="ml-1 flex cursor-pointer items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="h-3.5 w-3.5 accent-amber-600"
            />
            Мало на складі
          </label>
          <label className="flex cursor-pointer items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-3.5 w-3.5 accent-slate-600"
            />
            Показати неактивні
          </label>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 p-16 text-center text-slate-400">
          <p className="text-sm">Товарів не знайдено</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`flex items-center gap-3 rounded-2xl bg-white p-3 shadow-card ${
                !product.isActive ? "opacity-50" : ""
              }`}
            >
              <ProductImage
                src={product.imageUrl}
                alt={product.name}
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{product.name}</p>
                <p className="text-xs text-slate-400">
                  {product.sku}
                  {product.categoryName ? ` · ${product.categoryName}` : ""}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="font-display text-sm font-bold text-brand-700">
                    {product.price.toFixed(2)} ₴
                  </span>
                  <span
                    className={`text-xs ${
                      product.stock <= product.minStock ? "font-semibold text-amber-600" : "text-slate-400"
                    }`}
                  >
                    {product.stock} шт
                  </span>
                  {!product.isActive && (
                    <span className="text-xs text-slate-400">(неактивний)</span>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-1.5">
                <button
                  onClick={() => openEditProduct(product)}
                  className="btn-press flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
                  aria-label="Редагувати"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path
                      d="m4 20 1-4L16 5l3 3L8 19l-4 1Z"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(product)}
                  className="btn-press flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-red-500"
                  aria-label="Видалити"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path
                      d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 .7 12.3A2 2 0 0 0 8.7 21h6.6a2 2 0 0 0 2-1.7L18 7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categories}
          onClose={() => setShowForm(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
