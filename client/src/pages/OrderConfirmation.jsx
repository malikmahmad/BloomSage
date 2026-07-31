import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, MapPin, Package, Phone, Truck } from "lucide-react";
import { api } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";

const STATUS_CONFIG = {
  pending:    { label: "Pending",    style: "bg-ochre-soft text-ochre",        icon: "🕐" },
  processing: { label: "Processing", style: "bg-sage-100 text-sage-700",       icon: "⚙️" },
  shipped:    { label: "Shipped",    style: "bg-sage-100 text-sage-700",       icon: "🚚" },
  delivered:  { label: "Delivered",  style: "bg-sage-700/10 text-sage-700",    icon: "✅" },
  cancelled:  { label: "Cancelled",  style: "bg-clay/10 text-clay",            icon: "❌" },
};

const ORDER_STEPS = ["pending", "processing", "shipped", "delivered"];

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getOrder(id)
      .then((res) => setOrder(res.order))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="container-page py-24 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-sage-100 border-t-sage-700" />
        <p className="mt-4 text-ink/50">Loading order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-lg text-ink/60">We couldn't find that order.</p>
        <Link to="/account" className="mt-3 inline-block text-sm text-sage-700 underline">
          Back to my orders
        </Link>
      </div>
    );
  }

  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const isCancelled = order.status === "cancelled";
  const currentStep = isCancelled ? -1 : ORDER_STEPS.indexOf(order.status);

  return (
    <div className="container-page max-w-2xl py-14">
      {/* Success header */}
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sage-100">
          <CheckCircle2 size={32} className="text-sage-600" />
        </div>
        <h1 className="mt-4 font-display text-3xl font-semibold text-sage-900">
          {isCancelled ? "Order Cancelled" : "Order Confirmed!"}
        </h1>
        <p className="mt-1 text-ink/60">
          Order <span className="font-mono font-medium text-ink">#{String(order.id).padStart(5, "0")}</span>
          {" · "}
          {formatDate(order.created_at)}
        </p>
      </div>

      {/* Order status + progress */}
      <div className="mt-8 rounded-xl border border-line bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">Order status</h2>
          <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${config.style}`}>
            {config.icon} {config.label}
          </span>
        </div>

        {!isCancelled ? (
          <div className="mt-5">
            <div className="flex items-center">
              {ORDER_STEPS.map((step, idx) => (
                <div key={step} className="flex flex-1 items-center">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    idx <= currentStep
                      ? "bg-sage-700 text-white"
                      : "bg-line text-ink/30"
                  }`}>
                    {idx < currentStep ? "✓" : idx + 1}
                  </div>
                  {idx < ORDER_STEPS.length - 1 ? (
                    <div className={`h-0.5 flex-1 transition-colors ${idx < currentStep ? "bg-sage-700" : "bg-line"}`} />
                  ) : null}
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-ink/50">
              {ORDER_STEPS.map((step) => (
                <span key={step} className="capitalize">{step}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {/* Items */}
      <div className="mt-4 rounded-xl border border-line bg-white p-6">
        <h2 className="font-semibold text-ink">Items ordered</h2>
        <div className="mt-4 space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sage-50 text-xs font-medium text-sage-700">
                  {item.quantity}×
                </div>
                <span className="text-ink/80">{item.product_name}</span>
              </div>
              <span className="shrink-0 font-medium text-ink">
                {formatPrice(item.unit_price * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="label-rule my-4" />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-ink/60">
            <span>Subtotal</span><span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-ink/60">
            <span>Shipping</span>
            {order.shipping_fee === 0
              ? <span className="text-sage-700">Free</span>
              : <span>{formatPrice(order.shipping_fee)}</span>}
          </div>
          <div className="flex justify-between pt-1 text-base font-bold text-ink">
            <span>Total</span><span>{formatPrice(order.total_amount)}</span>
          </div>
        </div>
      </div>

      {/* Shipping & payment */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-line bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <MapPin size={15} className="text-sage-600" /> Shipping to
          </div>
          <div className="mt-3 space-y-0.5 text-sm text-ink/70">
            <p className="font-medium text-ink">{order.shipping_name}</p>
            <p>{order.shipping_address}</p>
            <p>{order.shipping_city}{order.shipping_postal_code ? ` ${order.shipping_postal_code}` : ""}</p>
            <p className="flex items-center gap-1.5 pt-1">
              <Phone size={12} /> {order.shipping_phone}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Truck size={15} className="text-sage-600" /> Payment & delivery
          </div>
          <div className="mt-3 space-y-2 text-sm text-ink/70">
            <p>
              <span className="text-ink/40">Payment: </span>
              <span className="capitalize">{order.payment_method === "cod" ? "Cash on delivery" : "Card (demo)"}</span>
            </p>
            {order.notes ? (
              <p>
                <span className="text-ink/40">Notes: </span>
                <span>{order.notes}</span>
              </p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          to="/account"
          className="rounded-full border border-line px-6 py-2.5 text-sm text-ink/70 transition-colors hover:bg-sage-50"
        >
          <span className="flex items-center gap-1.5"><Package size={15} /> View all orders</span>
        </Link>
        <Link
          to="/shop"
          className="rounded-full bg-sage-700 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-900"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
