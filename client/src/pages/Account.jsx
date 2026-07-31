import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  Loader2,
  Package,
  Settings,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { formatDate, formatPrice } from "../lib/format";

const STATUS_STYLES = {
  pending: "bg-ochre-soft text-ochre",
  processing: "bg-sage-100 text-sage-700",
  shipped: "bg-sage-100 text-sage-700",
  delivered: "bg-sage-700/10 text-sage-700",
  cancelled: "bg-clay/10 text-clay",
};

const TABS = [
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "profile", label: "Profile", icon: Settings },
];

const inputCls =
  "w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm outline-none focus:border-sage-600";

export default function Account() {
  const { user, login, logout } = useAuth();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState("orders");

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  // Wishlist
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  // Profile edit
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    currentPassword: "",
    newPassword: "",
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    api
      .getMyOrders()
      .then((res) => setOrders(res.orders))
      .finally(() => setOrdersLoading(false));
  }, []);

  useEffect(() => {
    if (activeTab === "wishlist" && wishlistItems.length === 0) {
      setWishlistLoading(true);
      api
        .getWishlist()
        .then((res) => setWishlistItems(res.items))
        .finally(() => setWishlistLoading(false));
    }
  }, [activeTab]);

  async function handleCancelOrder(orderId) {
    if (!window.confirm("Cancel this order? Stock will be restored.")) return;
    setCancellingId(orderId);
    try {
      const { order } = await api.cancelOrder(orderId);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    } catch (err) {
      alert(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  async function handleRemoveWishlist(productId) {
    setRemovingId(productId);
    try {
      await api.removeFromWishlist(productId);
      setWishlistItems((prev) => prev.filter((i) => i.id !== productId));
    } finally {
      setRemovingId(null);
    }
  }

  function handleAddWishlistToCart(product) {
    addItem(product, 1);
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileSaving(true);
    try {
      const payload = { name: profileForm.name };
      if (profileForm.newPassword) {
        payload.currentPassword = profileForm.currentPassword;
        payload.newPassword = profileForm.newPassword;
      }
      await api.updateProfile(payload);
      setProfileSuccess("Profile updated successfully.");
      setProfileForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
    } catch (err) {
      setProfileError(err.message);
    } finally {
      setProfileSaving(false);
    }
  }

  return (
    <div className="container-page py-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-sage-900">My account</h1>
          <p className="mt-1 text-ink/60">
            {user?.name} · {user?.email}
          </p>
        </div>
        <button
          onClick={logout}
          className="rounded-full border border-line px-4 py-2 text-sm text-ink/60 hover:border-clay hover:text-clay"
        >
          Log out
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex gap-1 border-b border-line">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 border-b-2 px-4 pb-3 pt-1 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? "border-sage-700 text-sage-700"
                : "border-transparent text-ink/50 hover:text-ink"
            }`}
          >
            <tab.icon size={15} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders tab */}
      {activeTab === "orders" && (
        <div className="mt-6">
          {ordersLoading ? (
            <p className="text-ink/50">Loading your orders…</p>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line py-14 text-center">
              <Package size={32} className="mx-auto text-ink/20" />
              <p className="mt-3 text-ink/60">You haven't placed any orders yet.</p>
              <Link to="/shop" className="mt-2 inline-block text-sm text-sage-700 underline">
                Start shopping
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-line rounded-xl border border-line bg-white">
              {orders.map((order) => (
                <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <Link
                    to={`/order-confirmation/${order.id}`}
                    className="group flex-1"
                  >
                    <p className="font-medium text-ink group-hover:text-sage-700">
                      Order #{order.id}
                    </p>
                    <p className="text-sm text-ink/50">{formatDate(order.created_at)}</p>
                  </Link>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                        STATUS_STYLES[order.status] || "bg-sage-100 text-sage-700"
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="font-medium text-ink">{formatPrice(order.total_amount)}</span>
                    {order.status === "pending" ? (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        disabled={cancellingId === order.id}
                        className="flex items-center gap-1 text-xs text-clay hover:underline disabled:opacity-50"
                      >
                        {cancellingId === order.id ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <X size={12} />
                        )}
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Wishlist tab */}
      {activeTab === "wishlist" && (
        <div className="mt-6">
          {wishlistLoading ? (
            <p className="text-ink/50">Loading wishlist…</p>
          ) : wishlistItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-line py-14 text-center">
              <Heart size={32} className="mx-auto text-ink/20" />
              <p className="mt-3 text-ink/60">Your wishlist is empty.</p>
              <Link to="/shop" className="mt-2 inline-block text-sm text-sage-700 underline">
                Browse products
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {wishlistItems.map((item) => (
                <div
                  key={item.wishlist_id}
                  className="flex gap-4 rounded-xl border border-line bg-white p-4"
                >
                  <Link to={`/product/${item.slug}`}>
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <Link
                      to={`/product/${item.slug}`}
                      className="font-medium text-ink hover:text-sage-700"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-sm text-ink/60">{formatPrice(item.price)}</p>
                    <div className="mt-auto flex items-center gap-2 pt-2">
                      <button
                        onClick={() => handleAddWishlistToCart(item)}
                        disabled={item.stock <= 0}
                        className="flex-1 rounded-full bg-sage-700 px-3 py-1.5 text-xs font-medium text-white hover:bg-sage-900 disabled:opacity-40"
                      >
                        {item.stock <= 0 ? "Out of stock" : "Add to cart"}
                      </button>
                      <button
                        onClick={() => handleRemoveWishlist(item.id)}
                        disabled={removingId === item.id}
                        className="text-ink/30 hover:text-clay"
                        aria-label="Remove from wishlist"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="mt-6 max-w-md">
          <form onSubmit={handleProfileSave} className="space-y-4 rounded-xl border border-line bg-white p-6">
            <h3 className="font-display text-lg font-semibold text-sage-900">Edit profile</h3>

            {profileError ? (
              <p className="rounded-lg bg-clay/10 px-4 py-2.5 text-sm text-clay">{profileError}</p>
            ) : null}
            {profileSuccess ? (
              <p className="rounded-lg bg-sage-100 px-4 py-2.5 text-sm text-sage-700">
                {profileSuccess}
              </p>
            ) : null}

            <div>
              <label className="mb-1.5 block text-xs text-ink/60">Full name</label>
              <input
                required
                value={profileForm.name}
                onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                className={inputCls}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-ink/60">Email</label>
              <input
                value={user?.email}
                disabled
                className={`${inputCls} bg-sage-50 text-ink/40`}
              />
              <p className="mt-1 text-xs text-ink/40">Email cannot be changed.</p>
            </div>

            <div className="border-t border-line pt-4">
              <p className="mb-3 text-xs font-medium text-ink/60 uppercase tracking-wide">
                Change password
              </p>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-xs text-ink/60">Current password</label>
                  <input
                    type="password"
                    value={profileForm.currentPassword}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, currentPassword: e.target.value }))
                    }
                    placeholder="Required to change password"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs text-ink/60">New password</label>
                  <input
                    type="password"
                    value={profileForm.newPassword}
                    onChange={(e) =>
                      setProfileForm((p) => ({ ...p, newPassword: e.target.value }))
                    }
                    placeholder="At least 6 characters"
                    minLength={profileForm.newPassword ? 6 : undefined}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
            >
              {profileSaving ? <Loader2 size={16} className="animate-spin" /> : null}
              Save changes
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
