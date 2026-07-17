"use client";

import ProductImage from "@/components/ProductImage";
import type { ProductDTO } from "@/types";

export default function ProductGrid({
  products,
  loading,
  onAdd,
}: {
  products: ProductDTO[];
  loading: boolean;
  onAdd: (product: ProductDTO) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center text-slate-400">
        <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <p className="text-sm">Товарів не знайдено</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => {
        const outOfStock = product.stock <= 0;
        return (
          <button
            key={product.id}
            disabled={outOfStock}
            onClick={() => onAdd(product)}
            className={`btn-press group flex flex-col overflow-hidden rounded-2xl bg-white text-left shadow-card transition-shadow hover:shadow-soft ${
              outOfStock ? "opacity-50" : ""
            }`}
          >
            <div className="relative aspect-square w-full">
              <ProductImage src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
              {product.stock <= product.minStock && product.stock > 0 && (
                <span className="absolute left-2 top-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  Мало
                </span>
              )}
              {outOfStock && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-semibold text-white">
                  Немає в наявності
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <p className="line-clamp-2 text-sm font-medium leading-tight text-slate-800">
                {product.name}
              </p>
              <div className="mt-auto flex items-end justify-between pt-1">
                <span className="font-display text-base font-bold text-brand-700">
                  {product.price.toFixed(2)} ₴
                </span>
                <span className="text-[11px] text-slate-400">{product.stock} шт</span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
