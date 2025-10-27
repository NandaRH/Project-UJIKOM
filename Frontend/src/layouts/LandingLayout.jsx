import { useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function LandingLayout({ children }) {
    const { pathname } = useLocation();

    // Deteksi halaman login, register, atau forgot password
    const isAuthPage =
        pathname.includes("/login") ||
        pathname.includes("/register") ||
        pathname.includes("/forgot-password") ||
        pathname.includes("/login/admin");

  return (
    <div className="flex flex-col min-h-screen bg-[#fffaf5] text-[var(--coffee)]">
      {/* Navbar di atas */}
      <Navbar isAuthPage={isAuthPage} />

      {/* Konten halaman utama */}
      <main className="flex-1">{children}</main>

      {/* Footer selalu di bawah */}
      <Footer />
    </div>
  );
}
