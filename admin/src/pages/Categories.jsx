import { useEffect, useState } from "react";
import { AlertCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import Modal from "../components/ui/Modal";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    api
      .getCategories()
      .then((res) => setCategories(res.categories))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", description: "" });
    setError("");
    setModalOpen(true);
  }

  function openEdit(cat) {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || "" });
    setError("");
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId) {
        await api.updateCategory(editingId, form);
      } else {
        await api.createCategory(form);
      }
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await api.deleteCategory(deleteTarget.id);
    setDeleteTarget(null);
    load();
  }

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Categories</h1>
          <p className="mt-1 text-sm text-muted">Organize how products are grouped in the shop.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-lg bg-sage-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-sage-900"
        >
          <Plus size={16} /> Add category
        </button>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-muted">Loading…</p>
        ) : (
          categories.map((cat) => (
            <div key={cat.id} className="rounded-xl border border-line bg-surface p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-ink">{cat.name}</h3>
                  <p className="mt-1 text-sm text-muted">{cat.product_count} products</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(cat)} className="text-muted hover:text-sage-700" aria-label="Edit">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteTarget(cat)} className="text-muted hover:text-clay" aria-label="Delete">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {cat.description ? <p className="mt-2 text-sm text-muted">{cat.description}</p> : null}
            </div>
          ))
        )}
      </div>

      {modalOpen ? (
        <Modal title={editingId ? "Edit category" : "Add category"} onClose={() => setModalOpen(false)}>
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
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-sage-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-sage-900 disabled:opacity-60"
            >
              {saving ? "Saving…" : editingId ? "Save changes" : "Create category"}
            </button>
          </form>
        </Modal>
      ) : null}

      {deleteTarget ? (
        <Modal title="Delete category?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-muted">
            Products in <span className="font-medium text-ink">{deleteTarget.name}</span> will become uncategorized, not deleted.
          </p>
          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => setDeleteTarget(null)} className="rounded-lg border border-line px-4 py-2 text-sm text-ink hover:bg-paper">
              Cancel
            </button>
            <button onClick={handleDelete} className="rounded-lg bg-clay px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Delete
            </button>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
