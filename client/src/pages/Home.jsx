import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Leaf, Star } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ui/ProductCard";

const TESTIMONIALS = [
  {
    name: "Sana A.",
    text: "The Niacinamide serum genuinely cleared my pores in two weeks. I've tried dozens of brands — Bloomsage is the one I actually kept buying.",
    rating: 5,
  },
  {
    name: "Ayesha K.",
    text: "I have reactive skin and every other cleanser I tried stripped it raw. The Oat Milk Cleanser is the first one that doesn't leave my face tight.",
    rating: 5,
  },
  {
    name: "Zara M.",
    text: "The ingredient lists are honest and actually short. Refreshing in a market where everything claims to do everything.",
    rating: 5,
  },
];

const CATEGORIES_IMG = {
  Cleansers: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80",
  Serums: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80",
  Moisturizers: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80",
  Masks: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&q=80",
  "Body Care": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80",
  "Sun Care": "https://images.unsplash.com/photo-1526758097130-bab247274f58?w=400&q=80",
};

const TRUST_BADGES = [
  { icon: "🌿", title: "Plant-based", sub: "Every formula" },
  { icon: "🔬", title: "Dermatologist tested", sub: "Reviewed by experts" },
  { icon: "📦", title: "Free delivery", sub: "On orders over Rs 3,000" },
  { icon: "↩️", title: "Easy returns", sub: "7-day return policy" },
];

function StarRow({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= rating ? "fill-ochre text-ochre" : "fill-line text-line"}
        />
      ))}
    </div>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          api.getProducts({ featured: "1", pageSize: 4 }),
          api.getCategories(),
        ]);
        if (!cancelled) {
          setFeatured(productsRes.products);
          setCategories(categoriesRes.categories);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  function handleSubscribe(e) {
    e.preventDefault();
    if (email.trim()) setSubscribed(true);
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="border-b border-line bg-sage-50">
        <div className="container-page grid gap-10 py-16 sm:py-24 md:grid-cols-2 md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-ochre-soft px-3 py-1 font-mono text-xs text-ochre">
              <Leaf size={13} /> Small-batch, plant-based
            </span>
            <h1 className="mt-5 max-w-lg font-display text-4xl font-semibold leading-[1.1] text-sage-900 sm:text-5xl">
              Skincare formulated like it still matters what's in it.
            </h1>
            <p className="mt-5 max-w-md text-ink/70">
              Bloomsage makes cleansers, serums, and moisturizers with ingredient lists you can
              actually read — no filler, no guesswork, just what your skin needs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 rounded-full bg-sage-700 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-sage-900"
              >
                Shop all products <ChevronRight size={16} />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center rounded-full border border-sage-700/30 px-6 py-3 text-sm font-medium text-sage-900 transition-colors hover:bg-white"
              >
                Our story
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <img
              src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=600&q=80"
              alt="Bloomsage cleanser"
              className="aspect-[3/4] rounded-xl object-cover"
            />
            <img
              src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600&q=80"
              alt="Bloomsage serum"
              className="mt-8 aspect-[3/4] rounded-xl object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Trust badges ── */}
      <section className="border-b border-line">
        <div className="container-page grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
          {TRUST_BADGES.map((b) => (
            <div key={b.title} className="flex items-center gap-3">
              <span className="text-2xl">{b.icon}</span>
              <div>
                <p className="text-sm font-medium text-ink">{b.title}</p>
                <p className="text-xs text-ink/50">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="container-page py-16">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold text-sage-900">Shop by category</h2>
          <Link
            to="/shop"
            className="flex items-center gap-1 text-sm text-sage-700 hover:text-sage-900"
          >
            All products <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.slug}`}
              className="group flex flex-col items-center gap-2 rounded-xl border border-line bg-white p-4 text-center transition-shadow hover:shadow-md"
            >
              <div className="h-16 w-16 overflow-hidden rounded-full bg-sage-50">
                <img
                  src={
                    CATEGORIES_IMG[cat.name] ||
                    "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200&q=70"
                  }
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">{cat.name}</p>
                <p className="text-xs text-ink/40">{cat.product_count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured / Best sellers ── */}
      <section className="border-y border-line bg-sage-50 py-16">
        <div className="container-page">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-sage-900">Best sellers</h2>
            <Link
              to="/shop?featured=1"
              className="flex items-center gap-1 text-sm text-sage-700 hover:text-sage-900"
            >
              View all <ChevronRight size={15} />
            </Link>
          </div>
          {loading ? (
            <p className="mt-8 text-ink/50">Loading products…</p>
          ) : (
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Why Bloomsage ── */}
      <section className="container-page py-16">
        <h2 className="text-center font-display text-2xl font-semibold text-sage-900">
          Why Bloomsage?
        </h2>
        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "Ingredients you can read",
              body: "Every formula lists its actives in plain language on the front of the label, not buried in fine print on the back.",
              icon: "📋",
            },
            {
              title: "Small batches, tested properly",
              body: "We produce in small runs so nothing sits on a shelf for years before it reaches you.",
              icon: "⚗️",
            },
            {
              title: "No filler claims",
              body: "If a product doesn't do something, we don't say it does. Skincare marketing has enough of that already.",
              icon: "✓",
            },
          ].map((v) => (
            <div key={v.title} className="rounded-xl border border-line bg-white p-6">
              <span className="text-2xl">{v.icon}</span>
              <h3 className="mt-3 font-display text-lg font-semibold text-sage-900">{v.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/60">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="border-t border-line bg-sage-50 py-16">
        <div className="container-page">
          <h2 className="text-center font-display text-2xl font-semibold text-sage-900">
            What customers say
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-xl border border-line bg-white p-6">
                <StarRow rating={t.rating} />
                <p className="mt-3 text-sm leading-relaxed text-ink/70">"{t.text}"</p>
                <p className="mt-4 text-sm font-medium text-ink">— {t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="border-t border-line bg-sage-900 py-14 text-sage-50">
        <div className="container-page max-w-xl text-center">
          <Leaf size={24} className="mx-auto text-sage-100/60" />
          <h2 className="mt-4 font-display text-2xl font-semibold">
            Get 10% off your first order
          </h2>
          <p className="mt-2 text-sm text-sage-100/70">
            Join our list for formulation news, restocks, and early access to new drops.
          </p>
          {subscribed ? (
            <p className="mt-6 rounded-full bg-white/10 px-5 py-3 text-sm font-medium">
              ✓ You're on the list — your 10% code is on its way.
            </p>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="mt-6 flex overflow-hidden rounded-full border border-white/20 bg-white/10"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 bg-transparent px-5 py-3 text-sm text-white placeholder-white/40 outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-sage-900 transition-colors hover:bg-sage-100"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
