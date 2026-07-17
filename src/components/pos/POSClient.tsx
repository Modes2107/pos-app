"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductGrid from "./ProductGrid";
import CartDrawer from "./CartDrawer";
import CheckoutModal from "./CheckoutModal";
import ReceiptModal from "./ReceiptModal";
import BarcodeScanner from "@/components/BarcodeScanner";
import type { CartItem, ProductDTO, SaleDTO } from "@/types";

type Category = { id: string; name: string };

export default function POSClient() {
  const [products, setProducts] = useState<ProductDTO[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedSale, setCompletedSale] = useState<SaleDTO | null>(null);
  const [mobileCartOpen, setMobileCartOpen] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(() => {});
  }, []);

  const loadProducts = useCallback((q: string, categoryId: string | null) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryId) params.set("categoryId", categoryId);
    params.set("pageSize", "100");
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setProducts(data.items))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadProducts(search, activeCategory);
  }, [activeCategory, loadProducts]);

  function handleSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadProducts(value, activeCategory), 300);
  }

  function addToCart(product: ProductDTO) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock,
          imageUrl: product.imageUrl,
        },
      ];
    });
  }

  function incrementItem(productId: string) {
    setCart((prev) =>
      prev.map((i) =>
        i.productId === productId && i.quantity < i.stock ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  }

  function decrementItem(productId: string) {
    setCart((prev) =>
      prev
        .map((i) => (i.productId === productId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0)
    );
  }

  function removeItem(productId: string) {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  }

  function handleBarcodeDetected(code: string) {
    setShowScanner(false);
    const product = products.find((p) => p.barcode === code);
    if (product) {
      addToCart(product);
      setScanError(null);
    } else {
      setScanError(`Товар зі штрих-кодом "${code}" не знайдено`);
      setTimeout(() => setScanError(null), 3500);
    }
  }

  function handleSaleCompleted(sale: SaleDTO) {
    setCompletedSale(sale);
    setShowCheckout(false);
    setCart([]);
    setMobileCartOpen(false);
    loadProducts(search, activeCategory);
  }

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="flex h-screen flex-col md:flex-row">
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Пошук і сканер */}
        <div className="border-b border-slate-100 bg-white px-4 py-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              >
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
                <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Пошук за назвою, артикулом, штрих-кодом..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <button
              onClick={() => setShowScanner(true)}
              className="btn-press flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-soft"
              aria-label="Сканувати штрих-код"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path
                  d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3m12-4v3a1 1 0 0 1-1 1h-3M4 12h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          {/* Фільтр категорій */}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory(null)}
              className={`btn-press shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${
                activeCategory === null
                  ? "bg-brand-700 text-white"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              Усі
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                className={`btn-press shrink-0 rounded-full px-4 py-1.5 text-xs font-medium ${
                  activeCategory === c.id
                    ? "bg-brand-700 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {scanError && (
          <div className="mx-4 mt-3 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">
            {scanError}
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-24 md:pb-4">
          <ProductGrid products={products} loading={loading} onAdd={addToCart} />
        </div>
      </div>

      {/* Кошик: постійна панель на десктопі */}
      <aside className="hidden w-96 shrink-0 border-l border-slate-100 bg-white md:block">
        <CartDrawer
          items={cart}
          onIncrement={incrementItem}
          onDecrement={decrementItem}
          onRemove={removeItem}
          onCheckout={() => setShowCheckout(true)}
        />
      </aside>

      {/* Плаваюча кнопка кошика на мобільному */}
      {cart.length > 0 && !mobileCartOpen && (
        <button
          onClick={() => setMobileCartOpen(true)}
          className="btn-press fixed inset-x-4 bottom-20 z-30 flex items-center justify-between rounded-2xl bg-brand-700 px-5 py-4 text-white shadow-2xl md:hidden"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
              {cartCount}
            </span>
            Кошик
          </span>
          <span className="font-display text-lg font-bold">{cartTotal.toFixed(2)} ₴</span>
        </button>
      )}

      {/* Мобільна шторка кошика */}
      {mobileCartOpen && (
        <div className="fixed inset-0 z-40 flex items-end bg-black/40 md:hidden">
          <div className="max-h-[85vh] w-full rounded-t-3xl bg-white">
            <div className="flex justify-center pt-2">
              <div className="h-1 w-10 rounded-full bg-slate-200" />
            </div>
            <div className="flex items-center justify-end px-4 pt-1">
              <button
                onClick={() => setMobileCartOpen(false)}
                className="btn-press flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500"
              >
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <div className="h-[70vh]">
              <CartDrawer
                items={cart}
                onIncrement={incrementItem}
                onDecrement={decrementItem}
                onRemove={removeItem}
                onCheckout={() => setShowCheckout(true)}
              />
            </div>
          </div>
        </div>
      )}

      {showScanner && (
        <BarcodeScanner onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} />
      )}

      {showCheckout && (
        <CheckoutModal
          items={cart}
          onClose={() => setShowCheckout(false)}
          onCompleted={handleSaleCompleted}
        />
      )}

      {completedSale && (
        <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      )}
    </div>
  );
}
