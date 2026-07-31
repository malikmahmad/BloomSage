import { useEffect, useState } from "react";
import { AlertTriangle, Package, Save } from "lucide-react";
import { api } from "../lib/api";

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("stock-asc");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    api
      .getInventory({ sort, lowStock: lowStockOnly ? "1" : "" })
      .then((res) => setProducts(res.products))
      .finally(() => setLoading(false));
  }

  useEffect(load, [sort, lowStockOnly]);

  function startEdit(product) {
    setEditingId(product.id);
    setEditValue(String(product.stock));
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const { product } = await api.updateStock(editingId, Number(editValue));
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, ...product } : p)));
      setEditingId(null);
    } finally {
      setSaving(false);
    }
  }

  const lowCount = products.filter((p) => p.stock <= 10).length;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold text-ink">Inventory</h1>
        <p className="mt-1 text-sm text-muted">Monitor and update stock levels across all products.</p>
      </div>

      {lowCount > 0 ? (
        <div className="mt-5 flex items-center gap-3 rounded-lg border border-amber/20 bg-amber/5 px-4 py-3 text-sm">
          <AlertTriangle size={18} className="shrink-0 text-amber" />
          <p className="text-ink">
            <strong>{lowCount}</strong> product{lowCount > 1 ? "s" : ""} {lowCount > 1 ? "are" : "is"} low in stock (10 units or fewer).
          </p>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
            className="h-4 w-4 rounded border-line accent-sage-700"
          />
          Show only low stock (≤10)
        </label>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm text-ink outline-none focus:border-sage-600"
        >
          <option value="stock-asc">Stock: Low to High</option>
          <option value="stock-desc">Stock: High to Low</option>
          <option value="name">Name: A–Z</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-surface">
        <table>
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">Loading…</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">No products match these filters.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="text-sm">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image_url}
                        alt=""
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div>
                        <p className="font-medium text-ink">{product.name}</p>
                        <p className="font-mono text-xs text-muted">{product.sku || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{product.category_name || "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        product.is_active ? "bg-sage-50 text-sage-700" : "bg-line text-muted"
                      }`}
                    >
                      {product.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        disabled={saving}
                        className="w-20 rounded border border-sage-600 px-2 py-1 text-sm outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                      />
                    ) : (
                      <span
                        className={`${
                          product.stock <= 5
                            ? "font-semibold text-clay"
                            : product.stock <= 10
                              ? "font-medium text-amber"
                              : "text-ink"
                        }`}
                      >
                        {product.stock}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {editingId === product.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            disabled={saving}
                            className="flex items-center gap-1 rounded bg-sage-700 px-2.5 py-1 text-xs font-medium text-white hover:bg-sage-900 disabled:opacity-50"
                          >
                            <Save size={13} /> Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            disabled={saving}
                            className="text-xs text-muted hover:text-ink"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(product)}
                          className="text-sm text-sage-700 hover:underline"
                        >
                          Edit stock
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
