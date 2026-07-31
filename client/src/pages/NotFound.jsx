import { Link } from "react-router-dom";
import { Leaf } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center justify-center py-32 text-center">
      <Leaf size={36} className="text-sage-300" />
      <h1 className="mt-5 font-display text-6xl font-semibold text-sage-900">404</h1>
      <p className="mt-3 text-lg text-ink/60">We couldn't find that page.</p>
      <p className="mt-1 max-w-sm text-sm text-ink/40">
        It may have moved, or the link might be wrong. Try heading back to the store.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          to="/"
          className="rounded-full bg-sage-700 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sage-900"
        >
          Go home
        </Link>
        <Link
          to="/shop"
          className="rounded-full border border-line px-6 py-2.5 text-sm text-ink/70 transition-colors hover:bg-sage-50"
        >
          Browse products
        </Link>
      </div>
    </div>
  );
}
