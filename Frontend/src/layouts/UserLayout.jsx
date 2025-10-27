import UserNavbar from "../components/UserNavbar";
import Footer from "../components/Footer";

export default function UserLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fffaf5] text-[var(--coffee)]">
      {/* Navbar tetap di atas setiap halaman user */}
      <UserNavbar />

      {/* Konten halaman utama */}
      <main className="flex-1">{children}</main>

      {/* Footer di bawah */}
      <Footer />
    </div>
  );
}
