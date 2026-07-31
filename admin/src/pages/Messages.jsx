import { useEffect, useState } from "react";
import { CheckCheck, Mail, MailOpen, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { formatDateTime } from "../lib/format";
import Modal from "../components/ui/Modal";

export default function Messages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    api.getMessages()
      .then((res) => setMessages(res.messages))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleOpen(msg) {
    setSelected(msg);
    if (!msg.is_read) {
      await api.markMessageRead(msg.id);
      setMessages((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, is_read: 1 } : m))
      );
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await api.deleteMessage(deleteTarget.id);
    setMessages((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    if (selected?.id === deleteTarget.id) setSelected(null);
    setDeleteTarget(null);
  }

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.is_read;
    if (filter === "read") return !!m.is_read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.is_read).length;

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            Messages
            {unreadCount > 0 ? (
              <span className="ml-2 rounded-full bg-clay/15 px-2 py-0.5 text-sm font-medium text-clay">
                {unreadCount} unread
              </span>
            ) : null}
          </h1>
          <p className="mt-1 text-sm text-muted">Customer contact form submissions.</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="mt-5 flex gap-1 border-b border-line">
        {["all", "unread", "read"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`border-b-2 px-4 pb-2.5 pt-1 text-sm capitalize transition-colors ${
              filter === f
                ? "border-sage-700 text-sage-700"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-surface">
        <table>
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="w-5 px-4 py-3 font-medium" />
              <th className="px-4 py-3 font-medium">From</th>
              <th className="px-4 py-3 font-medium">Subject</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">Loading…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">No messages found.</td>
              </tr>
            ) : (
              filtered.map((msg) => (
                <tr
                  key={msg.id}
                  className={`cursor-pointer text-sm transition-colors hover:bg-paper ${
                    !msg.is_read ? "bg-sage-50/50" : ""
                  }`}
                  onClick={() => handleOpen(msg)}
                >
                  <td className="px-4 py-3">
                    {msg.is_read
                      ? <MailOpen size={15} className="text-muted" />
                      : <Mail size={15} className="text-sage-700" />}
                  </td>
                  <td className="px-4 py-3">
                    <p className={`${!msg.is_read ? "font-semibold" : "font-medium"} text-ink`}>
                      {msg.name}
                    </p>
                    <p className="text-xs text-muted">{msg.email}</p>
                  </td>
                  <td className="px-4 py-3 text-ink/80">
                    {msg.subject || <span className="italic text-muted">No subject</span>}
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDateTime(msg.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteTarget(msg); }}
                        className="text-muted hover:text-clay"
                        aria-label="Delete message"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Message detail modal */}
      {selected ? (
        <Modal title={selected.subject || "No subject"} onClose={() => setSelected(null)}>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <div>
                <p className="font-medium text-ink">{selected.name}</p>
                <p className="text-muted">{selected.email}</p>
              </div>
              <p className="text-xs text-muted">{formatDateTime(selected.created_at)}</p>
            </div>
            <div className="border-t border-line pt-3">
              <p className="whitespace-pre-wrap leading-relaxed text-ink/80">
                {selected.message}
              </p>
            </div>
            <div className="flex justify-between border-t border-line pt-3">
              <a
                href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "Your message")}`}
                className="flex items-center gap-1.5 rounded-lg bg-sage-700 px-4 py-2 text-sm font-medium text-white hover:bg-sage-900"
              >
                <Mail size={14} /> Reply via email
              </a>
              <button
                onClick={() => { setDeleteTarget(selected); setSelected(null); }}
                className="flex items-center gap-1.5 text-sm text-clay hover:underline"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Delete confirmation */}
      {deleteTarget ? (
        <Modal title="Delete message?" onClose={() => setDeleteTarget(null)}>
          <p className="text-sm text-muted">
            Delete the message from{" "}
            <span className="font-medium text-ink">{deleteTarget.name}</span>?
            This can't be undone.
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
