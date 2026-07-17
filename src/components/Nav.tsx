"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Продаж",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M3 4h2l1.6 9.6a2 2 0 0 0 2 1.7h7.7a2 2 0 0 0 2-1.6L20 8H6"
          stroke={active ? "#0f766e" : "#6b7280"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="9" cy="20" r="1.4" fill={active ? "#0f766e" : "#6b7280"} />
        <circle cx="16" cy="20" r="1.4" fill={active ? "#0f766e" : "#6b7280"} />
      </svg>
    ),
  },
  {
    href: "/warehouse",
    label: "Склад",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M3 9.5 12 4l9 5.5V19a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z"
          stroke={active ? "#0f766e" : "#6b7280"}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/products",
    label: "Товари",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <rect x="4" y="4" width="7" height="7" rx="1.5" stroke={active ? "#0f766e" : "#6b7280"} strokeWidth="1.8" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" stroke={active ? "#0f766e" : "#6b7280"} strokeWidth="1.8" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" stroke={active ? "#0f766e" : "#6b7280"} strokeWidth="1.8" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" stroke={active ? "#0f766e" : "#6b7280"} strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "Історія",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M5 6h14M5 12h14M5 18h9"
          stroke={active ? "#0f766e" : "#6b7280"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/categories",
    label: "Категорії",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M4 6h16M4 12h16M4 18h16"
          stroke={active ? "#0f766e" : "#6b7280"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    href: "/stats",
    label: "Статистика",
    icon: (active: boolean) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
        <path
          d="M4 20V10M12 20V4M20 20v-7"
          stroke={active ? "#0f766e" : "#6b7280"}
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function Nav({ username }: { username: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Десктоп: бічна панель */}
      <aside className="hidden md:flex md:fixed md:inset-y-0 md:left-0 md:w-60 md:flex-col md:border-r md:border-slate-200 md:bg-white">
        <div className="px-5 py-6">
          <p className="font-display text-lg font-bold text-brand-700">КасаPOS</p>
          <p className="mt-0.5 text-xs text-slate-400">{username}</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {item.icon(active)}
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="btn-press flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50"
          >
            Вийти
          </button>
        </div>
      </aside>

      {/* Мобільний: нижня панель */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="btn-press flex flex-1 flex-col items-center gap-0.5 py-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            >
              {item.icon(active)}
              <span className={`text-[10px] font-medium ${active ? "text-brand-700" : "text-slate-500"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
