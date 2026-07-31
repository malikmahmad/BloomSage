import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, CreditCard, Loader2, MapPin, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { formatPrice } from "../lib/format";

const SHIPPING_FEE = 200;
const FREE_SHIPPING_THRESHOLD = 3000;

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-sage-600 focus:ring-1 focus:ring-sage-600/20 transition-colors";

const PAYMENT_OPTIONS = [
  {
    value: "cod",
    label: "Cash on delivery",
    sub: "Pay when your order arrives at your door",
    icon: Truck,
  },
  {
    value: "card",
    label: "Card payment (demo)",
    sub: "No real charge — for demonstration only",
    icon: CreditCard,
  },
];

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  if (items.length === 0) {
    navigate("/cart");
    return null;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear field error on change
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setFieldErrors({});
    setSubmitting(true);
    try {
      const { order } = await api.placeOrder({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shipping: form,
        paymentMethod,
        notes,
      });
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(err.message);
      if (err.details) {
        const mapped = {};
        for (const d of err.details) {
          mapped[d.field.replace("shipping.", "")] = d.message;
        }
        setFieldErrors(mapped);
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold text-sage-900">Checkout</h1>

      {/* Breadcrumb */}
      <nav className="mt-2 flex items-center gap-2 text-xs text-ink/50">
        <Link to="/cart" className="hover:text-sage-700">Cart</Link>
        <span>›</span>
        <span className="font-medium text-ink">Shipping & Payment</span>
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error ? (
            <div className="flex items-start gap-3 rounded-xl border border-clay/20 bg-clay/5 px-4 py-3 text-sm text-clay">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* Shipping section */}
          <div className="rounded-xl border border-line bg-white p-6">
            <div className="flex items-center gap-2">
              <MapPin size={17} className="text-sage-600" />
              <h2 className="font-display text-lg font-semibold text-sage-900">Shipping details</h2>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink/60">Full name *</label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className={`${inputCls} ${fieldErrors.fullName ? "border-clay" : ""}`}
                  />
                  {fieldErrors.fullName && <p className="mt-1 text-xs text-clay">{fieldErrors.fullName}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink/60">Phone number *</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="03xxxxxxxxx"
                    autoComplete="tel"
                    className={`${inputCls} ${fieldErrors.phone ? "border-clay" : ""}`}
                  />
                  {fieldErrors.phone && <p className="mt-1 text-xs text-clay">{fieldErrors.phone}</p>}
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink/60">Street address *</label>
                <input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="House no., street, area"
                  autoComplete="street-address"
                  className={`${inputCls} ${fieldErrors.address ? "border-clay" : ""}`}
                />
                {fieldErrors.address && <p className="mt-1 text-xs text-clay">{fieldErrors.address}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink/60">City *</label>
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    autoComplete="address-level2"
                    className={`${inputCls} ${fieldErrors.city ? "border-clay" : ""}`}
                  />
                  {fieldErrors.city && <p className="mt-1 text-xs text-clay">{fieldErrors.city}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-ink/60">Postal code</label>
                  <input
                    name="postalCode"
                    value={form.postalCode}
                    onChange={handleChange}
                    autoComplete="postal-code"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-ink/60">
                  Order notes <span className="text-ink/30">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Delivery instructions, landmark, gate code…"
                  className={`${inputCls} resize-none`}
                />
              </div>
            </div>
          </div>

          {/* Payment section */}
          <div className="rounded-xl border border-line bg-white p-6">
            <div className="flex items-center gap-2">
              <CreditCard size={17} className="text-sage-600" />
              <h2 className="font-display text-lg font-semibold text-sage-900">Payment method</h2>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPaymentMethod(opt.value)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    paymentMethod === opt.value
                      ? "border-sage-700 bg-sage-50 ring-1 ring-sage-700/20"
                      : "border-line hover:border-sage-300"
                  }`}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    paymentMethod === opt.value ? "bg-sage-700 text-white" : "bg-sage-50 text-sage-600"
                  }`}>
                    <opt.icon size={15} />
                  </div>
                  <div>
                    <p className="font-medium text-ink text-sm">{opt.label}</p>
                    <p className="mt-0.5 text-xs text-ink/50">{opt.sub}</p>
                  </div>
                  {paymentMethod === opt.value ? (
                    <CheckCircle2 size={16} className="ml-auto mt-0.5 shrink-0 text-sage-700" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Place order button */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-4 text-sm font-semibold text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 size={16} className="animate-spin" /> Placing order…</>
            ) : (
              <>Place order · {formatPrice(subtotal + shippingFee)}</>
            )}
          </button>
          <p className="text-center text-xs text-ink/40">
            By placing your order you agree to our terms of service.
          </p>
        </form>

        {/* Order summary sidebar */}
        <div className="h-fit rounded-xl border border-line bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-sage-900">Order summary</h2>

          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={item.productId} className="flex items-start gap-3">
                <div className="relative">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-sage-700 text-[0.6rem] font-medium text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{item.name}</p>
                  <p className="text-xs text-ink/50">{formatPrice(item.price)} each</p>
                </div>
                <p className="shrink-0 text-sm font-medium text-ink">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="label-rule my-5" />

          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              {shippingFee === 0 ? (
                <span className="font-medium text-sage-700">Free</span>
              ) : (
                <span>{formatPrice(shippingFee)}</span>
              )}
            </div>
          </div>

          <div className="label-rule my-4" />

          <div className="flex justify-between text-base font-bold text-ink">
            <span>Total</span>
            <span>{formatPrice(subtotal + shippingFee)}</span>
          </div>

          <p className="mt-4 rounded-lg bg-sage-50 px-3 py-2.5 text-xs text-ink/60">
            {paymentMethod === "cod"
              ? "💵 Cash on delivery — pay when your order arrives."
              : "💳 Card demo — no real payment is processed."}
          </p>
        </div>
      </div>
    </div>
  );
}
