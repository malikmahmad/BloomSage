import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";

const STATUS_STYLES = {
  pending:    "bg-amber/15 text-amber",
  processing: "bg-sage-50 text-sage-700",
  shipped:    "bg-sage-50 text-sage-700",
  delivered:  "bg-sage-700/10 text-sage-700",
  cancelled:  "bg-clay/10 text-clay",
};

const STATUSES = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .getOrders(statusFilter === "all" ? undefined : statusFilter)
      .then((res) => setOrders(res.orders))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  const filtered = search.trim()
    ? orders.filter(
        (o) =>
          String(o.id).includes(search) ||
          o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
          o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
          o.shipping_city?.toLowerCase().includes(search.toLowerCase())
      )
    : orders;

  const statusCounts = STATUSES.reduce((acc, s) => {
    acc[s] = s === "all" ? orders.length : orders.filter((o) => o.status === s).length;
    return acc;
  }, {});

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Orders</h1>
          <p className="mt-1 text-sm text-muted">Track and update customer orders.</p>
        </div>
        {!loading && (
          <p className="text-sm text-muted">
            {filtered.length} of {orders.length} order{orders.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Status filter tabs */}
      <div className="mt-5 flex flex-wrap gap-2">
        {STATUSES.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors ${
              statusFilter === status
                ? "border-sage-700 bg-sage-700 text-white"
                : "border-line text-muted hover:border-sage-600"
            }`}
          >
            {status}
            {statusCounts[status] > 0 && (
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[0.65rem] ${
                statusFilter === status ? "bg-white/20 text-white" : "bg-line text-muted"
              }`}>
                {statusCounts[status]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mt-4 max-w-xs">
        <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order #, name, email…"
          className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sage-600"
        />
      </div>

      {/* Table */}
      <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-surface">
        <table>
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Payment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">Loading…</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No orders found.</td></tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="text-sm hover:bg-paper">
                  <td className="px-4 py-3">
                    <Link
                      to={`/orders/${order.id}`}
                      className="font-mono font-medium text-sage-700 hover:underline"
                    >
                      #{String(order.id).padStart(5, "0")}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-ink">{order.customer_name}</p>
                    <p className="text-xs text-muted">{order.customer_email}</p>
                  </td>
                  <td className="px-4 py-3 text-muted">{formatDate(order.created_at)}</td>
                  <td className="px-4 py-3 font-medium text-ink">{formatPrice(order.total_amount)}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs capitalize text-muted">
                      {order.payment_method === "cod" ? "COD" : "Card"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status] || ""}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
