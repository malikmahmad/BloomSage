import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Star,
  Trash2,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { formatPrice, formatDate } from "../lib/format";

function StarRow({ rating, interactive = false, onRate }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={interactive ? 22 : 14}
          className={`transition-colors ${
            n <= (interactive ? hover || rating : rating)
              ? "fill-ochre text-ochre"
              : "fill-line text-line"
          } ${interactive ? "cursor-pointer" : ""}`}
          onClick={() => interactive && onRate && onRate(n)}
          onMouseEnter={() => interactive && setHover(n)}
          onMouseLeave={() => interactive && setHover(0)}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Wishlist state
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewAvg, setReviewAvg] = useState(null);
  const [reviewCount, setReviewCount] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myBody, setMyBody] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  // Load product
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    api
      .getProduct(slug)
      .then((res) => {
        if (!cancelled) {
          setProduct(res.product);
          setQuantity(1);
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Load reviews when product is known
  const loadReviews = useCallback((productId) => {
    api.getReviews(productId).then((res) => {
      setReviews(res.reviews);
      setReviewAvg(res.average);
      setReviewCount(res.count);
      // Pre-fill if user already reviewed
      if (user) {
        const mine = res.reviews.find((r) => r.user_id === user.id);
        if (mine) {
          setMyRating(mine.rating);
          setMyBody(mine.body || "");
        }
      }
    });
  }, [user]);

  useEffect(() => {
    if (product) loadReviews(product.id);
  }, [product, loadReviews]);

  // Load wishlist
  useEffect(() => {
    if (user) {
      api.getWishlist().then((res) => setWishlist(res.items.map((i) => i.id)));
    }
  }, [user]);

  if (loading) return <div className="container-page py-24 text-center text-ink/50">Loading…</div>;

  if (error || !product) {
    return (
      <div className="container-page py-24 text-center">
        <p className="text-lg text-ink/60">We couldn't find that product.</p>
        <Link to="/shop" className="mt-3 inline-block text-sm text-sage-700 underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const isWishlisted = wishlist.includes(product.id);

  function handleAddToCart() {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    navigate("/cart");
  }

  async function handleWishlistToggle() {
    if (!user) {
      navigate("/login");
      return;
    }
    setWishlistLoading(true);
    try {
      if (isWishlisted) {
        await api.removeFromWishlist(product.id);
        setWishlist((prev) => prev.filter((id) => id !== product.id));
      } else {
        await api.addToWishlist(product.id);
        setWishlist((prev) => [...prev, product.id]);
      }
    } finally {
      setWishlistLoading(false);
    }
  }

  async function handleReviewSubmit(e) {
    e.preventDefault();
    if (!myRating) {
      setReviewError("Please select a star rating.");
      return;
    }
    setReviewError("");
    setReviewSubmitting(true);
    try {
      const res = await api.submitReview(product.id, { rating: myRating, body: myBody });
      setReviews(res.reviews);
      setReviewAvg(res.average);
      setReviewCount(res.count);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleDeleteReview() {
    try {
      await api.deleteReview(product.id);
      loadReviews(product.id);
      setMyRating(0);
      setMyBody("");
    } catch {
      // ignore
    }
  }

  const alreadyReviewed = user && reviews.some((r) => r.user_id === user.id);

  return (
    <div className="container-page py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-ink/50">
        <Link to="/shop" className="hover:text-sage-700">Shop</Link>
        <ChevronRight size={12} />
        {product.category_name ? (
          <>
            <Link to={`/shop?category=${product.category_slug}`} className="hover:text-sage-700">
              {product.category_name}
            </Link>
            <ChevronRight size={12} />
          </>
        ) : null}
        <span className="text-ink/70">{product.name}</span>
      </nav>

      {/* Product grid */}
      <div className="mt-6 grid gap-10 md:grid-cols-2">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden rounded-xl bg-sage-50">
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          {product.compare_at_price ? (
            <span className="absolute left-4 top-4 rounded-full bg-clay px-3 py-1 text-xs font-medium text-white">
              Sale
            </span>
          ) : null}
        </div>

        {/* Details */}
        <div>
          {product.category_name ? (
            <span className="font-mono text-xs uppercase tracking-wide text-sage-600">
              {product.category_name}
            </span>
          ) : null}
          <h1 className="mt-1 font-display text-3xl font-semibold text-sage-900">{product.name}</h1>

          {/* Rating summary */}
          {reviewCount > 0 ? (
            <div className="mt-2 flex items-center gap-2">
              <StarRow rating={Math.round(reviewAvg)} />
              <span className="text-sm text-ink/60">
                {reviewAvg.toFixed(1)} ({reviewCount} review{reviewCount !== 1 ? "s" : ""})
              </span>
            </div>
          ) : null}

          {/* Price */}
          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold text-ink">{formatPrice(product.price)}</span>
            {product.compare_at_price ? (
              <span className="text-base text-ink/40 line-through">
                {formatPrice(product.compare_at_price)}
              </span>
            ) : null}
          </div>

          <div className="label-rule my-5" />

          <p className="leading-relaxed text-ink/70">{product.description}</p>

          {/* Meta */}
          <dl className="mt-6 grid grid-cols-2 gap-3 font-mono text-xs text-ink/50">
            <div>
              <dt className="uppercase">SKU</dt>
              <dd className="mt-0.5 text-ink/80">{product.sku || "—"}</dd>
            </div>
            <div>
              <dt className="uppercase">Availability</dt>
              <dd className={`mt-0.5 ${outOfStock ? "text-clay" : "text-sage-700"}`}>
                {outOfStock ? "Out of stock" : `${product.stock} in stock`}
              </dd>
            </div>
          </dl>

          {!outOfStock ? (
            <>
              <div className="mt-7 flex items-center gap-3">
                {/* Quantity picker */}
                <div className="flex items-center rounded-full border border-line">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-ink/60 hover:text-sage-700"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={15} />
                  </button>
                  <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="flex h-10 w-10 items-center justify-center text-ink/60 hover:text-sage-700"
                    aria-label="Increase quantity"
                  >
                    <Plus size={15} />
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 rounded-full border border-sage-700 px-6 py-2.5 text-sm font-medium text-sage-700 transition-colors hover:bg-sage-50"
                >
                  {added ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={16} /> Added
                    </span>
                  ) : (
                    "Add to cart"
                  )}
                </button>

                {/* Wishlist */}
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors ${
                    isWishlisted
                      ? "border-clay bg-clay/10 text-clay"
                      : "border-line text-ink/40 hover:border-clay hover:text-clay"
                  }`}
                >
                  <Heart size={18} className={isWishlisted ? "fill-clay" : ""} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="mt-3 w-full rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-900 sm:w-auto sm:px-10"
              >
                Buy now
              </button>
            </>
          ) : (
            <p className="mt-7 rounded-lg bg-sage-50 px-4 py-3 text-sm text-ink/60">
              This product is currently out of stock. Check back soon.
            </p>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <section className="mt-16 border-t border-line pt-12">
        <h2 className="font-display text-2xl font-semibold text-sage-900">
          Customer reviews
          {reviewCount > 0 ? (
            <span className="ml-3 font-body text-base font-normal text-ink/50">
              ({reviewCount})
            </span>
          ) : null}
        </h2>

        {reviewCount > 0 ? (
          <div className="mt-3 flex items-center gap-3">
            <StarRow rating={Math.round(reviewAvg)} />
            <span className="text-sm text-ink/60">{reviewAvg.toFixed(1)} out of 5</span>
          </div>
        ) : (
          <p className="mt-2 text-sm text-ink/50">No reviews yet — be the first.</p>
        )}

        {/* Write a review */}
        {user ? (
          <div className="mt-8 rounded-xl border border-line bg-white p-6">
            <h3 className="font-display text-lg font-semibold text-sage-900">
              {alreadyReviewed ? "Your review" : "Write a review"}
            </h3>
            <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
              {reviewError ? (
                <p className="text-sm text-clay">{reviewError}</p>
              ) : null}
              <div>
                <label className="mb-1.5 block text-xs text-ink/60">Rating</label>
                <StarRow rating={myRating} interactive onRate={setMyRating} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-ink/60">
                  Comment <span className="text-ink/30">(optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={myBody}
                  onChange={(e) => setMyBody(e.target.value)}
                  placeholder="What did you think of this product?"
                  className="w-full resize-none rounded-lg border border-line px-3.5 py-2.5 text-sm outline-none focus:border-sage-600"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="flex items-center gap-2 rounded-full bg-sage-700 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-900 disabled:opacity-60"
                >
                  {reviewSubmitting ? <Loader2 size={14} className="animate-spin" /> : null}
                  {alreadyReviewed ? "Update review" : "Submit review"}
                </button>
                {alreadyReviewed ? (
                  <button
                    type="button"
                    onClick={handleDeleteReview}
                    className="flex items-center gap-1.5 text-sm text-clay hover:underline"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                ) : null}
              </div>
            </form>
          </div>
        ) : (
          <p className="mt-6 text-sm text-ink/60">
            <Link to="/login" className="text-sage-700 hover:underline">
              Log in
            </Link>{" "}
            to leave a review.
          </p>
        )}

        {/* Review list */}
        {reviews.length > 0 ? (
          <div className="mt-8 divide-y divide-line">
            {reviews.map((review) => (
              <div key={review.id} className="py-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink">{review.reviewer_name}</p>
                    <p className="mt-0.5 text-xs text-ink/40">{formatDate(review.created_at)}</p>
                  </div>
                  <StarRow rating={review.rating} />
                </div>
                {review.body ? (
                  <p className="mt-3 text-sm leading-relaxed text-ink/70">{review.body}</p>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
