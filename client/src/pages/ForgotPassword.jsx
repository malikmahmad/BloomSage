import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle2, Leaf, Loader2, Mail } from "lucide-react";
import { api } from "../lib/api";

const inputCls =
  "w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-sage-600 focus:ring-1 focus:ring-sage-600/20 transition-colors";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.forgotPassword(email);
      setSent(true);
      if (res.resetUrl) setResetUrl(res.resetUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 font-display text-lg font-semibold text-sage-900">
          <Leaf size={20} className="text-sage-600" />
          Bloomsage
        </Link>

        <div className="mt-8 rounded-2xl border border-line bg-white p-8 shadow-sm">
          {sent ? (
            <div className="text-center">
              <CheckCircle2 size={40} className="mx-auto text-sage-600" />
              <h2 className="mt-4 font-display text-xl font-semibold text-sage-900">
                Reset link ready
              </h2>
              <p className="mt-2 text-sm text-ink/60">
                Click the link below to reset your password:
              </p>

              <div className="mt-4 rounded-lg border border-sage-200 bg-sage-50 p-3">
                <a
                  href={resetUrl}
                  className="break-all text-xs text-sage-700 hover:underline"
                >
                  {resetUrl}
                </a>
              </div>

              <p className="mt-3 text-xs text-ink/40">
                This link expires in 1 hour.
              </p>

              <Link
                to="/login"
                className="mt-5 inline-block text-sm text-sage-700 hover:underline"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-sage-900">
                Forgot password?
              </h1>
              <p className="mt-1 text-sm text-ink/60">
                Enter your email and we'll generate a reset link.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error ? (
                  <div className="flex items-start gap-2 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                  </div>
                ) : null}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink/60">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className={`${inputCls} pl-9`}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Get reset link
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-ink/60">
                Remember it?{" "}
                <Link to="/login" className="font-medium text-sage-700 hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
