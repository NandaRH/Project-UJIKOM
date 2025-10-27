import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/services", label: "Services" },
  { to: "/admin/settings", label: "Settings" },
];

export default function AdminLayout({ title, actions, children }) {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-shrink-0 border-r bg-white lg:block">
          <div className="border-b px-6 py-5">
            <h1 className="text-2xl font-bold text-[var(--coffee)]">
              Admin Panel
            </h1>
            <p className="text-xs text-slate-500">
              {user?.full_name || "Administrator"}
            </p>
          </div>

          <nav className="px-4 py-6 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "flex items-center rounded px-3 py-2 text-sm font-medium transition",
                    isActive
                      ? "bg-[var(--coffee)] text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[var(--coffee)]",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur">
            <div className="flex items-center justify-between px-4 py-4 lg:px-8">
              <div>
                <h2 className="text-xl font-semibold text-[var(--coffee)]">
                  {title}
                </h2>
                <p className="text-xs text-slate-500">
                  {new Date().toLocaleDateString("id-ID", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {actions}
                <button
                  onClick={logout}
                  className="rounded border border-[var(--coffee)] px-3 py-2 text-sm font-medium text-[var(--coffee)] transition hover:bg-[var(--coffee)] hover:text-white"
                >
                  Keluar
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 py-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

