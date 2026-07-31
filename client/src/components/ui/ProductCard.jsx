import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { formatPrice } from "../../lib/format";
import { useCart } from "../../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  function handleAddToCart(e) {
    e.preventDefault(); // don't navigate
    if (outOfStock) return;
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <Link
      to={`/product/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-shadow hover:shadow-md"
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-sage-50">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Sale badge */}
        {product.compare_at_price ? (
          <span className="absolute left-3 top-3 rounded-full bg-clay px-2.5 py-1 text-xs font-medium text-white">
            Sale
          </span>
        ) : null}

        {/* Out of stock overlay */}
        {outOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink/60 shadow-sm">
              Out of stock
            </span>
          </div>
        ) : null}

        {/* Quick add button — appears on hover */}
        {!outOfStock ? (
          <button
            onClick={handleAddToCart}
            className={`absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium shadow-md transition-all duration-200 ${
              added
                ? "bg-sage-700 text-white opacity-100"
                : "bg-white text-sage-700 opacity-0 group-hover:opacity-100 hover:bg-sage-700 hover:text-white"
            }`}
            aria-label="Add to cart"
          >
            {added ? (
              <><CheckCircle2 size={13} /> Added</>
            ) : (
              <><ShoppingBag size={13} /> Add</>
            )}
          </button>
        ) : null}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        {product.category_name ? (
          <span className="font-mono text-[0.65rem] uppercase tracking-wide text-sage-600">
            {product.category_name}
          </span>
        ) : null}

        <h3 className="mt-1 font-display text-base font-semibold leading-snug text-ink group-hover:text-sage-700 transition-colors">
          {product.name}
        </h3>

        <div className="label-rule my-2.5" />

        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-medium text-ink">{formatPrice(product.price)}</span>
            {product.compare_at_price ? (
              <span className="text-xs text-ink/40 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            ) : null}
          </div>
          {product.stock > 0 && product.stock <= 5 ? (
            <span className="text-[0.65rem] font-medium text-clay">Only {product.stock} left</span>
          ) : product.sku ? (
            <span className="font-mono text-[0.6rem] text-ink/25">{product.sku}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
