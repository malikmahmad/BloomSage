import { useState } from "react";
import { CheckCircle2, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { api } from "../lib/api";

const inputCls =
  "w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-sage-600";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await api.sendContactMessage(form);
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-14">
      <h1 className="font-display text-3xl font-semibold text-sage-900">Get in touch</h1>
      <p className="mt-2 max-w-lg text-ink/60">
        Questions about an order, a formula, or your skin type? We read every message and
        reply within one business day.
      </p>

      <div className="mt-10 grid gap-10 md:grid-cols-[1fr_1.4fr]">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-50 text-sage-700">
              <Mail size={17} />
            </span>
            <div>
              <p className="font-medium text-ink">Email</p>
              <p className="mt-0.5 text-sm text-ink/60">hello@bloomsage.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-50 text-sage-700">
              <Phone size={17} />
            </span>
            <div>
              <p className="font-medium text-ink">Phone</p>
              <p className="mt-0.5 text-sm text-ink/60">+92 300 1234567</p>
              <p className="mt-0.5 text-xs text-ink/40">Mon – Fri, 9 am – 5 pm PKT</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sage-50 text-sage-700">
              <MapPin size={17} />
            </span>
            <div>
              <p className="font-medium text-ink">Location</p>
              <p className="mt-0.5 text-sm text-ink/60">Multan, Punjab, Pakistan</p>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-sage-50 p-5">
            <p className="text-sm font-medium text-sage-900">Response time</p>
            <p className="mt-1 text-sm text-ink/60">
              We aim to respond to all messages within 24 hours during business days.
            </p>
          </div>
        </div>

        {/* Form */}
        {sent ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-line bg-white p-10 text-center">
            <CheckCircle2 size={44} className="text-sage-600" />
            <h2 className="mt-4 font-display text-xl font-semibold text-sage-900">
              Message received!
            </h2>
            <p className="mt-2 text-sm text-ink/60">
              Thanks for reaching out. We'll get back to you within one business day.
            </p>
            <button
              onClick={() => {
                setSent(false);
                setForm({ name: "", email: "", subject: "", message: "" });
              }}
              className="mt-6 rounded-full border border-line px-5 py-2 text-sm text-ink/70 hover:bg-sage-50"
            >
              Send another message
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-xl border border-line bg-white p-6"
          >
            {error ? (
              <p className="rounded-lg bg-clay/10 px-4 py-2.5 text-sm text-clay">{error}</p>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-ink/60">Name</label>
                <input
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-ink/60">Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-ink/60">
                Subject <span className="text-ink/30">(optional)</span>
              </label>
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. Order inquiry, Product question…"
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-ink/60">Message</label>
              <textarea
                name="message"
                required
                rows={5}
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us what's on your mind…"
                className={`${inputCls} resize-none`}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
