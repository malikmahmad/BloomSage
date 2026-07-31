import { Link } from "react-router-dom";
import { Leaf, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-sage-900 text-sage-50">
      <div className="container-page grid gap-10 py-14 sm:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-1">
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <Leaf size={18} className="text-sage-100/70" /> Bloomsage
          </div>
          <p className="mt-3 max-w-xs text-sm text-sage-100/60">
            Plant-based skincare in small batches, with ingredient lists you can actually
            pronounce.
          </p>
        </div>

        {/* Shop links */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wide text-sage-100/50">Shop</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-sage-100/75">
            <Link to="/shop" className="hover:text-white">All products</Link>
            <Link to="/shop?featured=1" className="hover:text-white">Best sellers</Link>
            <Link to="/shop?category=serums" className="hover:text-white">Serums</Link>
            <Link to="/shop?category=moisturizers" className="hover:text-white">Moisturizers</Link>
            <Link to="/cart" className="hover:text-white">My cart</Link>
          </div>
        </div>

        {/* Company */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wide text-sage-100/50">Company</h3>
          <div className="mt-3 flex flex-col gap-2 text-sm text-sage-100/75">
            <Link to="/about" className="hover:text-white">Our story</Link>
            <Link to="/contact" className="hover:text-white">Contact us</Link>
            <Link to="/account" className="hover:text-white">My account</Link>
            <Link to="/wishlist" className="hover:text-white">Wishlist</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-mono text-xs uppercase tracking-wide text-sage-100/50">Get in touch</h3>
          <div className="mt-3 flex flex-col gap-2.5 text-sm text-sage-100/75">
            <a href="mailto:hello@bloomsage.com" className="flex items-center gap-2 hover:text-white">
              <Mail size={14} /> hello@bloomsage.com
            </a>
            <span className="flex items-center gap-2">
              <Phone size={14} /> +92 300 1234567
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={14} /> Multan, Pakistan
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 text-xs text-sage-100/40">
          <p>© {new Date().getFullYear()} Bloomsage. Original skincare brand — built by Malik Muhammad Ahmad.</p>
          <p>Prices in Pakistani Rupees (Rs). Demo store — no real payments processed.</p>
        </div>
      </div>
    </footer>
  );
}
