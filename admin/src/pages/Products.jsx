import { useEffect, useRef, useState } from "react";
import { AlertCircle, ImagePlus, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { api } from "../lib/api";
import { formatPrice } from "../lib/format";
import Modal from "../components/ui/Modal";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  categoryId: "",
  imageUrl: "",
  stock: "",
  sku: "",
  isFeatured: false,
  isActive: true,
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  function loadProducts() {
    setLoading(true);
    api
      .getProducts({ includeInactive: "1", search, pageSize: 48 })
      .then((res) => setProducts(res.products))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api.getCategories().then((res) => setCategories(res.categories));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(loadProducts, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      compareAtPrice: product.compare_at_price ?? "",
      categoryId: product.category_id ?? "",
      imageUrl: product.image_url,
      stock: product.stock,
      sku: product.sku ?? "",
      isFeatured: !!product.is_featured,
      isActive: !!product.is_active,
    });
    setError("");
    setModalOpen(true);
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const { url } = await api.uploadImage(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setError("Image upload failed: " + err.message);
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        compareAtPrice: form.compareAtPrice || null,
        categoryId: form.categoryId || null,
      };
      if (editingId) {
        await api.updateProduct(editingId, payload);
      } else {
        await api.createProduct(payload);
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await api.deleteProduct(deleteTarget.id);
    setDeleteTarget(null);
    loadProducts();
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Products</h1>
          <p className="mt-1 text-sm text-muted">Manage your catalog, pricing, and stock.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-sage-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-sage-900"
        >
          <Plus size={16} /> Add product
        </button>
      </div>

      <div className="relative mt-5 max-w-xs">
        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sage-600"
        />
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-surface">
        <table>
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">Loading…</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">No products found.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="text-sm">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.image_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                      <div>
                        <p className="font-medium text-ink">{product.name}</p>
                        <p className="font-mono text-xs text-muted">{product.sku || "—"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted">{product.category_name || "—"}</td>
                  <td className="px-4 py-3 text-ink">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={product.stock <= 5 ? "font-medium text-clay" : "text-ink"}>
                      {product.stock}
                    </span>
                  </td>
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
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(product)} className="text-muted hover:text-sage-700" aria-label="Edit">
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => setDeleteTarget(product)} className="text-muted hover:text-clay" aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen ? (
        <Modal title={editingId ? "Edit product" : "Add product"} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            {error ? (
              <div className="flex items-start gap-2 rounded-lg bg-clay/10 px-3.5 py-2.5 text-sm text-clay">
                <AlertCircle size={15} className="mt-0.5 shrink-0" /> {error}
              </div>
            ) : null}

            <div>
              <label className="mb-1 block text-xs text-muted">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-sage-600"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full resize-none rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-sage-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted">Price (Rs)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-sage-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">Compare-at price</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.compareAtPrice}
                  onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-sage-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs text-muted">Stock</label>
                <input
                  type="number"
                  required
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-sage-600"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">SKU</label>
                <input
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-sage-600"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-sage-600"
              >
                <option value="">No category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-muted">Product Image</label>

              {/* Preview */}
              {form.imageUrl ? (
                <div className="relative mb-2 h-36 w-full overflow-hidden rounded-lg border border-line bg-sage-50">
                  <img
                    src={form.imageUrl}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, imageUrl: "" })}
                    className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-ink/60 shadow hover:text-clay"
                    aria-label="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : null}

              {/* Upload button */}
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="img-upload"
                />
                <label
                  htmlFor="img-upload"
                  className={`flex cursor-pointer items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm text-ink/70 hover:border-sage-600 hover:text-sage-700 ${uploading ? "pointer-events-none opacity-50" : ""}`}
                >
                  {uploading ? (
                    <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                  ) : (
                    <><ImagePlus size={14} /> Upload image</>
                  )}
                </label>

                {/* OR paste URL */}
                <input
                  value={form.imageUrl}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="…or paste image URL"
                  className="flex-1 rounded-lg border border-line px-3 py-2 text-sm outline-none focus:border-sage-600"
                />
              </div>
              <p className="mt-1 text-xs text-muted">JPG, PNG or WebP · max 5 MB</p>
            </div>

            <div className="flex gap-5 pt-1">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-line accent-sage-700"
                />
                Featured
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-line accent-sage-700"
                />
                Active (visible in store)
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-sage-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-sage-900 disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Create product"}
            </button>
          </form>
        </Modal>
      ) : null}

      {deleteTarget ? (
        <Modal title="Delete product?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-muted">
            This will permanently delete <span className="font-medium text-ink">{deleteTarget.name}</span>. This can't be undone.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-line px-4 py-2 text-sm text-ink hover:bg-paper"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Delete
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
