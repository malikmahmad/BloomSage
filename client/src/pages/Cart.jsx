import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice } from "../lib/format";

const SHIPPING_FEE = 200;
const FREE_SHIPPING_THRESHOLD = 3000;

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const amountToFreeShipping = FREE_SHIPPING_THRESHOLD - subtotal;

  if (items.length === 0) {
    return (
      <div className="container-page py-24 text-center">
        <ShoppingBag size={48} className="mx-auto text-ink/15" />
        <h2 className="mt-5 font-display text-2xl font-semibold text-sage-900">Your cart is empty</h2>
        <p className="mt-2 text-ink/60">
          Looks like you haven't added anything yet.
        </p>
        <Link
          to="/shop"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-white hover:bg-sage-900"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold text-sage-900">
          Your cart
          <span className="ml-2 font-body text-lg font-normal text-ink/40">
            ({items.reduce((s, i) => s + i.quantity, 0)} item{items.reduce((s, i) => s + i.quantity, 0) !== 1 ? "s" : ""})
          </span>
        </h1>
        <Link to="/shop" className="flex items-center gap-1 text-sm text-ink/50 hover:text-sage-700">
          <ArrowLeft size={14} /> Continue shopping
        </Link>
      </div>

      {/* Free shipping progress */}
      {amountToFreeShipping > 0 ? (
        <div className="mt-5 rounded-lg border border-ochre-soft bg-ochre-soft/40 px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ochre">
              Add <strong>{formatPrice(amountToFreeShipping)}</strong> more for free shipping
            </span>
            <span className="font-mono text-xs text-ochre/70">
              {Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-ochre/20">
            <div
              className="h-full rounded-full bg-ochre transition-all duration-500"
              style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-lg border border-sage-100 bg-sage-50 px-4 py-3 text-sm text-sage-700">
          ✓ You qualify for free shipping!
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Cart items */}
        <div className="divide-y divide-line rounded-xl border border-line bg-white">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 p-4 sm:gap-5">
              <Link to={`/product/${item.slug}`} className="shrink-0">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-22 w-22 rounded-lg object-cover sm:h-24 sm:w-24"
                />
              </Link>
              <div className="flex flex-1 flex-col min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    to={`/product/${item.slug}`}
                    className="font-medium text-ink hover:text-sage-700 line-clamp-2"
                  >
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="shrink-0 text-ink/25 hover:text-clay transition-colors"
                    aria-label={`Remove ${item.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="mt-0.5 text-sm text-ink/50">{formatPrice(item.price)} each</p>

                {item.stock <= 5 && item.stock > 0 ? (
                  <p className="mt-1 text-xs text-clay">Only {item.stock} left in stock</p>
                ) : null}

                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <div className="flex items-center rounded-full border border-line">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center text-ink/60 hover:text-sage-700"
                      aria-label="Decrease quantity"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, Math.min(item.stock, item.quantity + 1))}
                      disabled={item.quantity >= item.stock}
                      className="flex h-8 w-8 items-center justify-center text-ink/60 hover:text-sage-700 disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                  <span className="font-semibold text-ink">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {/* Clear cart */}
          <div className="flex justify-end p-4">
            <button
              onClick={() => { if (window.confirm("Remove all items from cart?")) clearCart(); }}
              className="text-xs text-ink/40 hover:text-clay"
            >
              Clear cart
            </button>
          </div>
        </div>

        {/* Order summary */}
        <div className="h-fit rounded-xl border border-line bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-sage-900">Order summary</h2>

          {/* Items breakdown */}
          <div className="mt-4 max-h-40 space-y-1.5 overflow-y-auto text-sm">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between text-ink/60">
                <span className="truncate pr-2">{item.name} × {item.quantity}</span>
                <span className="shrink-0">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="label-rule my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink/70">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-ink/70">
              <span>Shipping</span>
              {shippingFee === 0 ? (
                <span className="text-sage-700 font-medium">Free</span>
              ) : (
                <span>{formatPrice(shippingFee)}</span>
              )}
            </div>
          </div>

          <div className="label-rule my-4" />

          <div className="flex justify-between text-base font-semibold text-ink">
            <span>Total</span>
            <span>{formatPrice(subtotal + shippingFee)}</span>
          </div>

          <button
            onClick={() => navigate(user ? "/checkout" : "/login")}
            className="mt-6 w-full rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-900"
          >
            {user ? "Proceed to checkout" : "Log in to checkout"}
          </button>

          {!user ? (
            <p className="mt-3 text-center text-xs text-ink/50">
              or{" "}
              <Link to="/register" className="text-sage-700 hover:underline">
                create an account
              </Link>
              {" "}to save your orders
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap justify-center gap-3 text-xs text-ink/40">
            <span>🔒 Secure checkout</span>
            <span>📦 Fast delivery</span>
            <span>↩️ Easy returns</span>
          </div>
        </div>
      </div>
    </div>
  );
}
