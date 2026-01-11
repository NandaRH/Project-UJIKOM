import { Link, useLocation } from "react-router-dom";
import { FiUser } from "react-icons/fi";
import Logo from "../assets/images/logo-1612.png";

export default function Navbar() {
  const location = useLocation();
  const isAuthPage = ["/login", "/register", "/forgot-password", "/login/admin"].includes(
    location.pathname
  );

  return (
    <nav className="flex items-center justify-between border-b border-[#e5ded5] bg-[#fffaf5] px-10 py-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-3">
          <img src={Logo} alt="1612 Coffee" className="h-10 w-10 object-contain" />
          <span className="text-2xl font-bold text-[var(--coffee)]">1612 Coffee</span>
        </Link>
      </div>

      {!isAuthPage && (
        <div className="flex flex-1 justify-center">
          <div className="flex items-center gap-8 text-sm font-medium text-[var(--coffee)]">
            <a href="#about" className="transition hover:text-[#5c3217]">
              Tentang
            </a>
            <a href="#services" className="transition hover:text-[#5c3217]">
              Jasa
            </a>
            <a href="#products" className="transition hover:text-[#5c3217]">
              Produk
            </a>
            <a href="#social" className="transition hover:text-[#5c3217]">
              Sosial
            </a>
          </div>
        </div>
      )}

      {!isAuthPage && (
        <div className="flex items-center">
          <Link
            to="/login"
            className="flex items-center gap-2 rounded-lg border border-[var(--coffee)] px-4 py-2 text-[var(--coffee)] transition-all hover:bg-[var(--coffee)] hover:text-white"
          >
            <FiUser className="text-lg" />
            <span className="font-medium">Get Started</span>
          </Link>
        </div>
      )}
    </nav>
  );
}
