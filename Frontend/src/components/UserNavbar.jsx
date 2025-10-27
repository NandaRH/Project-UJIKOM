import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FiClock, FiLogOut, FiSettings, FiShoppingCart, FiUser } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import Logo from "../assets/images/logo-1612.png";

export default function UserNavbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [animateCart, setAnimateCart] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    if (items?.length) {
      setAnimateCart(true);
      const timer = setTimeout(() => setAnimateCart(false), 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [items]);

  return (
    <nav className="relative flex items-center justify-between border-b border-[#e5ded5] bg-[#fffaf5] px-10 py-4 shadow-sm">
      <button
        type="button"
        onClick={() => navigate("/user/dashboard")}
        className="flex items-center gap-3"
      >
        <img src={Logo} alt="1612 Coffee" className="h-10 w-10 object-contain" />
        <span className="text-2xl font-bold text-[var(--coffee)]">1612 Coffee</span>
      </button>

      <div className="relative flex items-center gap-6 text-[var(--coffee)]">
        <button
          type="button"
          onClick={() => navigate("/user/cart")}
          className={`relative rounded-lg border px-3 py-2 transition hover:bg-[var(--coffee)] hover:text-white ${
            animateCart ? "animate-bounce" : ""
          }`}
        >
          <FiShoppingCart size={18} />
          {items?.length ? (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--coffee)] text-xs text-white">
              {items.length}
            </span>
          ) : null}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center justify-center rounded-lg border px-3 py-2 transition hover:bg-[var(--coffee)] hover:text-white"
          >
            <FiUser size={18} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[#e5ded5] bg-white text-[var(--coffee)] shadow-lg">
              <div className="flex flex-col">
                <div className="px-4 py-3 text-sm">
                  <div className="font-semibold">{user?.full_name || user?.username || "Pengguna"}</div>
                  <div className="text-xs text-slate-500">{user?.email}</div>
                </div>
                <Link
                  to="/user/settings"
                  className="flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-[#f4ede7]"
                  onClick={() => setDropdownOpen(false)}
                >
                  <FiSettings size={16} /> Pengaturan
                </Link>
                <Link
                  to="/user/history"
                  className="flex items-center gap-2 px-4 py-2 text-sm transition hover:bg-[#f4ede7]"
                  onClick={() => setDropdownOpen(false)}
                >
                  <FiClock size={16} /> Riwayat Pembelian
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-left text-sm transition hover:bg-[#f4ede7]"
                >
                  <FiLogOut size={16} /> Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
