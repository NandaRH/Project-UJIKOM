import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "../../services/authApi";
import LandingLayout from "../../layouts/LandingLayout";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await registerApi(form);
      nav("/login");
    } catch (e) {
      setErr(e?.response?.data?.message || "Gagal daftar");
    }
  };

  return (
    <LandingLayout>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-4xl font-extrabold mb-8">Daftar</h1>
        <form onSubmit={submit} className="space-y-4 max-w-xl">
          <input
            className="w-full rounded border p-3"
            placeholder="Nama Lengkap"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <input
            className="w-full rounded border p-3"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="w-full rounded border p-3"
            type="password"
            placeholder="Kata sandi"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {err && <div className="text-sm text-red-600">{err}</div>}
          <button className="w-full rounded bg-[var(--coffee)] py-3 text-white">
            Buat Akun
          </button>
        </form>
        <div className="mt-3 text-sm">
          Sudah punya akun?{" "}
          <Link className="underline" to="/login">
            Masuk
          </Link>
        </div>
      </div>
    </LandingLayout>
  );
}
