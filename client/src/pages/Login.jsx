import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Leaf, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const inputCls =
  "w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-sage-600 focus:ring-1 focus:ring-sage-600/20 transition-colors";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

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
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center gap-2 font-display text-lg font-semibold text-sage-900">
          <Leaf size={20} className="text-sage-600" />
          Bloomsage
        </Link>

        <div className="mt-8 rounded-2xl border border-line bg-white p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold text-sage-900">Welcome back</h1>
          <p className="mt-1 text-sm text-ink/60">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error ? (
              <div className="flex items-start gap-2 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink/60">Email address</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-ink/60">Password</label>
                <Link to="/forgot-password" className="text-xs text-sage-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Sign in
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/60">
            Don't have an account?{" "}
            <Link to="/register" className="font-medium text-sage-700 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
