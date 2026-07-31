import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/format";

export default function Wishlist() {
  const { addItem } = useCart();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    api
      .getWishlist()
      .then((res) => setItems(res.items))
      .finally(() => setLoading(false));
  }, []);

  async function handleRemove(productId) {
    setRemovingId(productId);
    try {
      await api.removeFromWishlist(productId);
      setItems((prev) => prev.filter((i) => i.id !== productId));
    } finally {
      setRemovingId(null);
    }
  }

  function handleAddToCart(item) {
    addItem(item, 1);
  }

  if (loading) {
    return <div className="container-page py-24 text-center text-ink/50">Loading wishlist…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <Heart size={40} className="mx-auto text-ink/20" />
        <p className="mt-4 text-lg text-ink/60">Your wishlist is empty.</p>
        <Link
          to="/shop"
          className="mt-5 inline-block rounded-full bg-sage-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-900"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-3xl font-semibold text-sage-900">
        Wishlist
        <span className="ml-3 font-body text-base font-normal text-ink/40">
          ({items.length} item{items.length !== 1 ? "s" : ""})
        </span>
      </h1>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.wishlist_id}
            className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white"
          >
            <Link to={`/product/${item.slug}`} className="relative aspect-square bg-sage-50">
              <img
                src={item.image_url}
                alt={item.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              {item.stock <= 0 ? (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/50 text-sm font-medium text-white">
                  Out of stock
                </span>
              ) : null}
              {item.compare_at_price ? (
                <span className="absolute left-3 top-3 rounded-full bg-clay px-2.5 py-1 text-xs font-medium text-white">
                  Sale
                </span>
              ) : null}
            </Link>

            <div className="flex flex-1 flex-col p-4">
              {item.category_name ? (
                <span className="font-mono text-[0.65rem] uppercase tracking-wide text-sage-600">
                  {item.category_name}
                </span>
              ) : null}
              <Link
                to={`/product/${item.slug}`}
                className="mt-1 font-display text-base font-semibold leading-snug text-ink hover:text-sage-700"
              >
                {item.name}
              </Link>

              <div className="label-rule my-2.5" />

              <div className="mt-auto flex items-center gap-2">
                <div className="flex-1 text-sm font-medium text-ink">
                  {formatPrice(item.price)}
                  {item.compare_at_price ? (
                    <span className="ml-1.5 text-xs text-ink/40 line-through">
                      {formatPrice(item.compare_at_price)}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.stock <= 0}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-sage-700 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-40"
                >
                  <ShoppingBag size={13} />
                  {item.stock <= 0 ? "Out of stock" : "Add to cart"}
                </button>
                <button
                  onClick={() => handleRemove(item.id)}
                  disabled={removingId === item.id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-line text-ink/30 hover:border-clay hover:text-clay"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
