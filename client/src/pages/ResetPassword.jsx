import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Leaf, Loader2 } from "lucide-react";
import { api } from "../lib/api";

const inputCls =
  "w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-sage-600 focus:ring-1 focus:ring-sage-600/20 transition-colors";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="container-page flex min-h-[70vh] items-center justify-center py-16 text-center">
        <div>
          <p className="text-lg text-ink/60">Invalid reset link.</p>
          <Link to="/forgot-password" className="mt-3 inline-block text-sm text-sage-700 underline">
            Request a new one
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 font-display text-lg font-semibold text-sage-900">
          <Leaf size={20} className="text-sage-600" />
          Bloomsage
        </Link>

        <div className="mt-8 rounded-2xl border border-line bg-white p-8 shadow-sm">
          {done ? (
            <div className="text-center">
              <CheckCircle2 size={40} className="mx-auto text-sage-600" />
              <h2 className="mt-4 font-display text-xl font-semibold text-sage-900">
                Password reset!
              </h2>
              <p className="mt-2 text-sm text-ink/60">
                Redirecting to login…
              </p>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-semibold text-sage-900">
                Set new password
              </h1>
              <p className="mt-1 text-sm text-ink/60">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {error ? (
                  <div className="flex items-start gap-2 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
                  </div>
                ) : null}

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink/60">
                    New password
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink/60">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    className={inputCls}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                  Reset password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
