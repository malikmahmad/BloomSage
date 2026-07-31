import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Leaf, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sage-700 px-4">
      <div className="w-full max-w-sm rounded-xl bg-surface p-8 shadow-lg">
        <div className="flex items-center gap-2 text-sage-700">
          <Leaf size={22} />
          <span className="font-semibold">Bloomsage Admin</span>
        </div>
        <p className="mt-1 text-sm text-muted">Sign in to manage the store.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error ? (
            <div className="flex items-start gap-2 rounded-lg bg-clay/10 px-3.5 py-2.5 text-sm text-clay">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          ) : null}

          <div>
            <label className="mb-1.5 block text-xs text-muted">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-sage-600"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs text-muted">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-sage-600"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-sage-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-900 disabled:opacity-60"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            Sign in
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Admin access only. Contact your system administrator if you need access.
        </p>
      </div>
    </div>
  );
}
