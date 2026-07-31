import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  DollarSign,
  Mail,
  Package,
  ShoppingCart,
  Users,
} from "lucide-react";
import { api } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";

const STATUS_STYLES = {
  pending:    "bg-amber/15 text-amber",
  processing: "bg-sage-50 text-sage-700",
  shipped:    "bg-sage-50 text-sage-700",
  delivered:  "bg-sage-700/10 text-sage-700",
  cancelled:  "bg-clay/10 text-clay",
};

function StatCard({ icon: Icon, label, value, tone = "sage" }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${
          tone === "clay" ? "bg-clay/10 text-clay" : "bg-sage-50 text-sage-700"
        }`}>
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStats().then(setStats).finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-muted">Loading dashboard…</p>;
  if (!stats) return <p className="text-clay">Couldn't load dashboard data.</p>;

  // Truncate long product names for the bar chart labels
  const topProductsData = stats.topProducts.map((p) => ({
    name: p.name.length > 16 ? `${p.name.slice(0, 16)}…` : p.name,
    units: p.units_sold,
  }));

  // Trim the date to MM-DD so it fits on the x-axis
  const trendData = stats.revenueTrend.map((d) => ({
    day: d.day.slice(5),
    revenue: d.revenue,
    orders: d.orders,
  }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Here's how the store is doing.</p>

      {/* KPI cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Total revenue"  value={formatPrice(stats.revenue)} />
        <StatCard icon={ShoppingCart} label="Total orders"  value={stats.orderCount} />
        <StatCard icon={Package}      label="Products"      value={stats.productCount} />
        <StatCard icon={Users}        label="Customers"     value={stats.customerCount} />
      </div>

      {/* Alert tiles */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber/15 text-amber">
            <ShoppingCart size={16} />
          </span>
          <div>
            <p className="text-sm text-muted">Pending orders</p>
            <p className="font-semibold text-ink">{stats.pendingCount} awaiting action</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-clay/10 text-clay">
            <AlertTriangle size={16} />
          </span>
          <div>
            <p className="text-sm text-muted">Low stock</p>
            <p className="font-semibold text-ink">
              {stats.lowStockCount} product{stats.lowStockCount !== 1 ? "s" : ""} at 5 units or fewer
            </p>
          </div>
        </div>
      </div>

      {/* Revenue area chart */}
      {trendData.length > 0 ? (
        <div className="mt-6 rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold text-ink">Revenue — last 14 days</h2>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ left: 0, right: 10, top: 5 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3a5641" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3a5641" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e3e6eb" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#667085" }} />
                <YAxis
                  tick={{ fontSize: 11, fill: "#667085" }}
                  tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}k`}
                  width={60}
                />
                <Tooltip
                  formatter={(v) => [`Rs ${Number(v).toLocaleString("en-PK")}`, "Revenue"]}
                  contentStyle={{ fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3a5641"
                  strokeWidth={2}
                  fill="url(#revenueGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* Unread messages alert */}
      {stats.unreadMessages > 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-line bg-surface p-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sage-50 text-sage-700">
            <Mail size={16} />
          </span>
          <div className="flex-1">
            <p className="text-sm text-muted">Unread messages</p>
            <p className="font-semibold text-ink">
              {stats.unreadMessages} new from the contact form
            </p>
          </div>
          <Link to="/messages" className="text-sm text-sage-700 hover:underline">
            View
          </Link>
        </div>
      ) : null}

      {/* Charts row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* Top products bar chart */}
        <div className="rounded-xl border border-line bg-surface p-5">
          <h2 className="font-semibold text-ink">Top-selling products</h2>
          {topProductsData.length === 0 ? (
            <p className="mt-6 text-sm text-muted">No sales recorded yet.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topProductsData} layout="vertical" margin={{ left: 10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e3e6eb" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: "#667085" }} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 12, fill: "#667085" }}
                  />
                  <Tooltip cursor={{ fill: "#eef2ec" }} />
                  <Bar dataKey="units" fill="#3a5641" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent orders feed */}
        <div className="rounded-xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-ink">Recent orders</h2>
            <Link to="/orders" className="text-sm text-sage-700 hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 divide-y divide-line">
            {stats.recentOrders.length === 0 ? (
              <p className="py-6 text-sm text-muted">No orders yet.</p>
            ) : (
              stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={`/orders/${order.id}`}
                  className="flex items-center justify-between py-3 text-sm hover:bg-paper"
                >
                  <div>
                    <p className="font-medium text-ink">
                      #{order.id} · {order.customer_name}
                    </p>
                    <p className="text-xs text-muted">{formatDate(order.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="font-medium text-ink">{formatPrice(order.total_amount)}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
