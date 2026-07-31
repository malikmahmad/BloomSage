import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Leaf,
  LogOut,
  Mail,
  Menu,
  Package,
  ShoppingCart,
  Tags,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV_ITEMS = [
  { label: "Dashboard",  to: "/",          icon: LayoutDashboard, end: true },
  { label: "Products",   to: "/products",  icon: Package },
  { label: "Categories", to: "/categories",icon: Tags },
  { label: "Inventory",  to: "/inventory", icon: Warehouse },
  { label: "Orders",     to: "/orders",    icon: ShoppingCart },
  { label: "Customers",  to: "/customers", icon: Users },
  { label: "Messages",   to: "/messages",  icon: Mail },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  // Shared sidebar markup — used in both desktop and mobile drawer
  const sidebar = (
    <>
      <Link
        to="/"
        className="flex items-center gap-2 px-5 py-5 font-semibold text-white"
        onClick={() => setSidebarOpen(false)}
      >
        <Leaf size={20} className="text-sage-50" />
        Bloomsage
        <span className="font-mono text-xs font-normal text-white/50">admin</span>
      </Link>

      <nav className="flex-1 space-y-0.5 px-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <item.icon size={17} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="truncate text-sm text-white">{user?.name}</p>
        <p className="truncate text-xs text-white/50">{user?.email}</p>
        <button
          onClick={handleLogout}
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white"
        >
          <LogOut size={16} /> Log out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-paper lg:flex">
      {/* Desktop sidebar — always visible on large screens */}
      <aside className="hidden w-64 shrink-0 flex-col bg-sage-700 lg:flex">
        {sidebar}
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-line bg-sage-700 px-4 py-3 lg:hidden">
        <Link to="/" className="flex items-center gap-2 font-semibold text-white">
          <Leaf size={18} /> Bloomsage admin
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-white"
          aria-label="Open navigation"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile drawer */}
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex w-64 flex-col bg-sage-700">{sidebar}</div>
          <button
            className="flex-1 bg-black/40"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={22} className="ml-3 mt-3 text-white" />
          </button>
        </div>
      ) : null}

      <main className="flex-1 p-5 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
}
