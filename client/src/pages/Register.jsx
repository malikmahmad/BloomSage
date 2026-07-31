import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Leaf, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const inputCls =
  "w-full rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-sage-600 focus:ring-1 focus:ring-sage-600/20 transition-colors";

const BENEFITS = [
  "Track your orders in real time",
  "Save products to your wishlist",
  "Faster checkout with saved details",
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength =
    password.length === 0 ? null
    : password.length < 6 ? "weak"
    : password.length < 10 ? "fair"
    : "strong";

  const strengthConfig = {
    weak:   { label: "Too short",  color: "bg-clay",   width: "w-1/4" },
    fair:   { label: "Fair",       color: "bg-ochre",  width: "w-2/4" },
    strong: { label: "Strong",     color: "bg-sage-600", width: "w-full" },
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/");
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
          <h1 className="font-display text-2xl font-semibold text-sage-900">Create your account</h1>
          <p className="mt-1 text-sm text-ink/60">Join thousands of skincare enthusiasts.</p>

          {/* Benefits */}
          <div className="mt-4 space-y-1.5">
            {BENEFITS.map((b) => (
              <div key={b} className="flex items-center gap-2 text-xs text-ink/60">
                <CheckCircle2 size={13} className="text-sage-600" />
                {b}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {error ? (
              <div className="flex items-start gap-2 rounded-lg bg-clay/10 px-4 py-3 text-sm text-clay">
                <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
              </div>
            ) : null}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink/60">Full name</label>
              <input
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputCls}
              />
            </div>
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
              <label className="mb-1.5 block text-xs font-medium text-ink/60">Password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
              {/* Password strength indicator */}
              {passwordStrength ? (
                <div className="mt-2">
                  <div className="h-1 w-full overflow-hidden rounded-full bg-line">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strengthConfig[passwordStrength].color} ${strengthConfig[passwordStrength].width}`}
                    />
                  </div>
                  <p className="mt-1 text-xs text-ink/40">{strengthConfig[passwordStrength].label}</p>
                </div>
              ) : (
                <p className="mt-1 text-xs text-ink/40">At least 6 characters required.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              Create account
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-ink/60">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-sage-700 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
