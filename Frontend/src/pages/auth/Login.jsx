import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUserApi } from "../../services/authApi";
import LandingLayout from "../../layouts/LandingLayout";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const res = await loginUserApi(form);

      if (res.data?.token && res.data?.user) {
        // simpan token & user di context + localStorage
        login(res.data.user, res.data.token);

        // arahkan langsung ke dashboard user
        nav("/user/dashboard", { replace: true });
      } else {
        setErr("Login gagal: token tidak diterima dari server");
      }
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          "Login gagal, periksa kembali email & password Anda",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LandingLayout>
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="text-4xl font-extrabold mb-6 text-[var(--coffee)]">Masuk</h1>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full rounded border p-3"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Kata sandi"
            className="w-full rounded border p-3"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {err && <div className="text-red-600 text-sm">{err}</div>}

          <button
            disabled={loading}
            className="w-full rounded bg-[var(--coffee)] py-3 text-white hover:bg-[#5c3217] transition"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        <div className="mt-3 text-sm">
          <Link className="underline" to="/forgot-password">
            Lupa password?
          </Link>
          <br />
          Belum punya akun?{" "}
          <Link className="underline" to="/register">
            Daftar
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
}
