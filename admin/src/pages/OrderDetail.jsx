import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  function load() {
    api.getOrder(id)
      .then((res) => setOrder(res.order))
      .finally(() => setLoading(false));
  }

  useEffect(load, [id]);

  async function handleStatusChange(newStatus) {
    setUpdating(true);
    try {
      const { order } = await api.updateOrderStatus(id, newStatus);
      setOrder(order);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!order) return <p className="text-clay">Order not found.</p>;

  return (
    <div>
      <Link
        to="/orders"
        className="flex items-center gap-1.5 text-sm text-muted hover:text-sage-700"
      >
        <ArrowLeft size={15} /> Back to orders
      </Link>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-ink">Order #{order.id}</h1>
        <select
          value={order.status}
          disabled={updating}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="rounded-lg border border-line bg-surface px-3.5 py-2 text-sm capitalize outline-none focus:border-sage-600"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <p className="mt-1 text-sm text-muted">Placed {formatDate(order.created_at)}</p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Line items + totals */}
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold text-ink">Items</h2>
          <div className="mt-3 divide-y divide-line">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between py-2.5 text-sm">
                <span className="text-ink">
                  {item.product_name} × {item.quantity}
                </span>
                <span className="text-muted">{formatPrice(item.unit_price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 space-y-1.5 border-t border-line pt-3 text-sm">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span>{formatPrice(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between font-medium text-ink">
              <span>Total</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>
        </div>

        {/* Shipping + payment info */}
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold text-ink">Shipping details</h2>
          <div className="mt-3 space-y-1.5 text-sm text-muted">
            <p className="text-ink">{order.shipping_name}</p>
            <p>{order.shipping_address}</p>
            <p>
              {order.shipping_city}
              {order.shipping_postal_code ? ` ${order.shipping_postal_code}` : ""}
            </p>
            <p>{order.shipping_phone}</p>
          </div>

          <div className="mt-4 border-t border-line pt-3 text-sm">
            <p className="text-muted">Payment method</p>
            <p className="capitalize text-ink">
              {order.payment_method === "cod" ? "Cash on delivery" : order.payment_method}
            </p>
          </div>

          {order.notes ? (
            <div className="mt-4 border-t border-line pt-3 text-sm">
              <p className="text-muted">Customer notes</p>
              <p className="text-ink">{order.notes}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
