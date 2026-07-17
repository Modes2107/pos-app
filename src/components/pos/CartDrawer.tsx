"use client";

import ProductImage from "@/components/ProductImage";
import type { CartItem } from "@/types";

export default function CartDrawer({
  items,
  onIncrement,
  onDecrement,
  onRemove,
  onCheckout,
}: {
  items: CartItem[];
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}) {
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-display text-lg font-bold text-slate-900">Кошик</h2>
        <p className="text-xs text-slate-400">{count} шт. товару</p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
            <svg viewBox="0 0 24 24" fill="none" className="h-10 w-10">
              <path
                d="M3 4h2l1.6 9.6a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6L20 8H6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="9" cy="20" r="1.2" fill="currentColor" />
              <circle cx="16" cy="20" r="1.2" fill="currentColor" />
            </svg>
            <p className="text-sm">Кошик порожній</p>
            <p className="text-xs">Торкніться товару, щоб додати</p>
          </div>
        ) : (
          <ul className="space-y-2 py-2">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2">
                <ProductImage
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-14 w-14 shrink-0 rounded-lg object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-400">{item.price.toFixed(2)} ₴ / шт</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDecrement(item.productId)}
                    className="btn-press flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-card"
                    aria-label="Зменшити кількість"
                  >
                    −
                  </button>
                  <span className="w-6 text-center text-sm font-semibold text-slate-800">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onIncrement(item.productId)}
                    disabled={item.quantity >= item.stock}
                    className="btn-press flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-card disabled:opacity-40"
                    aria-label="Збільшити кількість"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => onRemove(item.productId)}
                  className="btn-press ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-300 hover:text-red-500"
                  aria-label="Видалити"
                >
                  <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5">
                    <path
                      d="M6 7h12M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 .7 12.3A2 2 0 0 0 8.7 21h6.6a2 2 0 0 0 2-1.7L18 7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-slate-100 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Разом</span>
          <span className="font-display text-2xl font-bold text-slate-900">
            {total.toFixed(2)} ₴
          </span>
        </div>
        <button
          disabled={items.length === 0}
          onClick={onCheckout}
          className="btn-press w-full rounded-xl bg-brand-700 py-4 text-base font-semibold text-white shadow-soft transition-colors hover:bg-brand-600 disabled:opacity-40"
        >
          Оформити продаж
        </button>
      </div>
    </div>
  );
}
