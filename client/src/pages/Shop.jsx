import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { api } from "../lib/api";
import ProductCard from "../components/ui/ProductCard";

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-lg border border-line bg-white">
      <div className="aspect-square bg-sage-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 w-16 rounded bg-sage-100" />
        <div className="h-4 w-3/4 rounded bg-sage-100" />
        <div className="h-px bg-sage-100" />
        <div className="h-4 w-1/2 rounded bg-sage-100" />
      </div>
    </div>
  );
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const activeCategory = searchParams.get("category") || "";
  const activeSort = searchParams.get("sort") || "newest";
  const activeSearch = searchParams.get("search") || "";
  const activeFeatured = searchParams.get("featured") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const hasActiveFilters = activeCategory || activeSearch || activeFeatured || activeSort !== "newest";

  useEffect(() => {
    api.getCategories().then((res) => setCategories(res.categories));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getProducts({ category: activeCategory, sort: activeSort, search: activeSearch, featured: activeFeatured, page, pageSize: 12 })
      .then((res) => {
        if (!cancelled) {
          setProducts(res.products);
          setPagination(res.pagination);
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activeCategory, activeSort, activeSearch, activeFeatured, page]);

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    updateParam("search", searchInput.trim());
  }

  function clearAllFilters() {
    setSearchInput("");
    setSearchParams({});
  }

  return (
    <div className="container-page py-10">
      {/* Header */}
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="font-display text-3xl font-semibold text-sage-900">
          {activeFeatured ? "Best sellers" : activeCategory ? categories.find(c => c.slug === activeCategory)?.name || "Products" : "Shop all products"}
        </h1>
        {!loading && pagination ? (
          <p className="text-sm text-ink/50">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""}
          </p>
        ) : null}
      </div>

      {/* Search + Sort row */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full rounded-full border border-line bg-white py-2.5 pl-9 pr-4 text-sm outline-none focus:border-sage-600"
          />
          {searchInput ? (
            <button
              type="button"
              onClick={() => { setSearchInput(""); updateParam("search", ""); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink"
            >
              <X size={14} />
            </button>
          ) : null}
        </form>

        <div className="flex items-center gap-2 sm:ml-auto">
          <SlidersHorizontal size={15} className="text-ink/40" />
          <select
            value={activeSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="rounded-full border border-line bg-white px-4 py-2.5 text-sm text-ink/80 outline-none focus:border-sage-600"
          >
            <option value="newest">Newest</option>
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
            <option value="name">Name: A–Z</option>
          </select>
        </div>
      </div>

      {/* Category chips */}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => updateParam("category", "")}
          className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
            !activeCategory
              ? "border-sage-700 bg-sage-700 text-white"
              : "border-line text-ink/70 hover:border-sage-600 hover:text-sage-700"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParam("category", cat.slug)}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              activeCategory === cat.slug
                ? "border-sage-700 bg-sage-700 text-white"
                : "border-line text-ink/70 hover:border-sage-600 hover:text-sage-700"
            }`}
          >
            {cat.name}
            <span className="ml-1 text-[0.7rem] opacity-60">({cat.product_count})</span>
          </button>
        ))}

        {hasActiveFilters ? (
          <button
            onClick={clearAllFilters}
            className="ml-1 flex items-center gap-1 rounded-full border border-clay/40 px-3.5 py-1.5 text-sm text-clay hover:bg-clay/5"
          >
            <X size={12} /> Clear filters
          </button>
        ) : null}
      </div>

      {/* Products grid */}
      {loading ? (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <div className="mt-20 text-center">
          <Filter size={36} className="mx-auto text-ink/20" />
          <p className="mt-4 text-lg text-ink/60">No products match your filters.</p>
          <p className="mt-1 text-sm text-ink/40">Try removing a filter or searching for something else.</p>
          <button onClick={clearAllFilters} className="mt-4 rounded-full bg-sage-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-sage-900">
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 ? (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => updateParam("page", String(page - 1))}
                disabled={page <= 1}
                className="rounded-full border border-line px-4 py-2 text-sm text-ink/60 hover:bg-sage-50 disabled:opacity-30"
              >
                ← Prev
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - page) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-ink/30">…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => updateParam("page", String(p))}
                      className={`h-9 w-9 rounded-full text-sm font-medium transition-colors ${
                        p === page
                          ? "bg-sage-700 text-white"
                          : "text-ink/60 hover:bg-sage-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => updateParam("page", String(page + 1))}
                disabled={page >= pagination.totalPages}
                className="rounded-full border border-line px-4 py-2 text-sm text-ink/60 hover:bg-sage-50 disabled:opacity-30"
              >
                Next →
              </button>
            </div>
          ) : null}

          {/* Results info */}
          {pagination ? (
            <p className="mt-4 text-center text-xs text-ink/40">
              Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, pagination.total)} of {pagination.total} products
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}
