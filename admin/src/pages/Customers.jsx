import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { api } from "../lib/api";
import { formatDate, formatPrice } from "../lib/format";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    api.getCustomers()
      .then((res) => setCustomers(res.customers))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.email.toLowerCase().includes(search.toLowerCase())
      )
    : customers;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-ink">Customers</h1>
      <p className="mt-1 text-sm text-muted">
        Everyone who has registered an account in the store.
      </p>

      <div className="relative mt-5 max-w-xs">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded-lg border border-line bg-surface py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sage-600"
        />
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-line bg-surface">
        <table>
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium">Orders</th>
              <th className="px-4 py-3 font-medium">Total spent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">Loading…</td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">No customers found.</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="text-sm">
                  <td className="px-4 py-3 font-medium text-ink">{c.name}</td>
                  <td className="px-4 py-3 text-muted">{c.email}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3 text-ink">{c.order_count}</td>
                  <td className="px-4 py-3 text-ink">{formatPrice(c.total_spent)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
