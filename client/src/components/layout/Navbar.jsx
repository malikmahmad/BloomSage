import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Leaf, Menu, ShoppingBag, User, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const NAV_LINKS = [
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between sm:h-20">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 font-display text-xl font-semibold text-sage-900"
        >
          <Leaf size={20} className="text-sage-600" />
          Bloomsage
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-sm text-ink/80 transition-colors hover:text-sage-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-1">
          {/* Wishlist — only visible when logged in */}
          {user ? (
            <Link
              to="/wishlist"
              className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-sage-100"
              aria-label="Wishlist"
            >
              <Heart size={20} className="text-sage-900" />
            </Link>
          ) : null}

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-sage-100"
            aria-label="Cart"
          >
            <ShoppingBag size={20} className="text-sage-900" />
            {itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[0.65rem] font-medium text-white">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            ) : null}
          </Link>

          {/* User menu — desktop */}
          {user ? (
            <div className="hidden items-center gap-3 pl-2 sm:flex">
              <Link
                to="/account"
                className="flex items-center gap-1.5 text-sm text-ink/80 hover:text-sage-700"
              >
                <User size={17} />
                {user.name.split(" ")[0]}
              </Link>
              {user.role === "admin" ? (
                <a
                  href="/admin"
                  className="rounded-full border border-sage-700 px-3 py-1 text-xs font-medium text-sage-700 hover:bg-sage-50"
                >
                  Admin Panel
                </a>
              ) : null}
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="text-sm text-ink/50 hover:text-clay"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 hidden rounded-full bg-sage-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sage-900 sm:inline-flex"
            >
              Log in
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            className="ml-1 flex h-10 w-10 items-center justify-center rounded-full hover:bg-sage-100 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen ? (
        <div className="border-t border-line bg-paper md:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm text-ink/80 hover:bg-sage-50"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm text-ink/80 hover:bg-sage-50"
                >
                  My account
                </Link>
                <Link
                  to="/wishlist"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2.5 text-sm text-ink/80 hover:bg-sage-50"
                >
                  Wishlist
                </Link>
                {user.role === "admin" ? (
                  <a
                    href="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg px-2 py-2.5 text-sm font-medium text-sage-700 hover:bg-sage-50"
                  >
                    Admin Panel
                  </a>
                ) : null}
                <button
                  onClick={() => {
                    logout();
                    setMenuOpen(false);
                    navigate("/");
                  }}
                  className="rounded-lg px-2 py-2.5 text-left text-sm text-clay"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="rounded-lg px-2 py-2.5 text-sm font-medium text-sage-700"
              >
                Log in
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
