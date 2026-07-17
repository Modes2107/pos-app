"use client";

import { useEffect, useState } from "react";

type Category = { id: string; name: string };

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() }),
    });
    if (res.ok) {
      setNewName("");
      loadCategories();
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return;
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName.trim() }),
    });
    if (res.ok) {
      setEditingId(null);
      loadCategories();
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Видалити категорію?")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadCategories();
    }
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur">
        <h1 className="font-display text-xl font-bold text-slate-900">Категорії</h1>
        <p className="text-xs text-slate-400">{categories.length} категорій</p>
      </div>

      <div className="max-w-2xl space-y-4 p-4">
        {/* Форма додавання */}
        <form onSubmit={handleAdd} className="flex gap-2 rounded-2xl bg-white p-4 shadow-card">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Нова категорія..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="btn-press rounded-xl bg-brand-700 px-5 py-2 font-medium text-white"
          >
            Додати
          </button>
        </form>

        {/* Список */}
        {loading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <p className="py-8 text-center text-slate-400">Немає категорій</p>
        ) : (
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card">
                {editingId === cat.id ? (
                  <>
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-brand-500"
                    />
                    <button
                      onClick={() => handleUpdate(cat.id)}
                      className="btn-press rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white"
                    >
                      Зберегти
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-press rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-600"
                    >
                      Скасувати
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-medium text-slate-800">{cat.name}</span>
                    <button
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                      }}
                      className="btn-press rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600"
                    >
                      Редагувати
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="btn-press rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600"
                    >
                      Видалити
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}