import { useState } from "react";
import { forgotPasswordApi } from "../../services/authApi";
import LandingLayout from "../../layouts/LandingLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr("");
    try {
      await forgotPasswordApi({ email });
      setMsg("Jika email terdaftar, tautan reset akan dikirim.");
    } catch (e) {
      setErr(e?.response?.data?.message || "Gagal memproses.");
    }
  };

  return (
    <LandingLayout>
      <div className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-4xl font-extrabold mb-8">Lupa Password</h1>
        <form onSubmit={submit} className="space-y-3 max-w-xl">
          <input className="w-full rounded border p-3" placeholder="Email"
            value={email} onChange={(e)=>setEmail(e.target.value)}/>
          <button className="w-full rounded bg-[var(--coffee)] py-3 text-white">Kirim</button>
        </form>
        {msg && <div className="mt-3 text-green-700">{msg}</div>}
        {err && <div className="mt-3 text-red-600">{err}</div>}
      </div>
    </LandingLayout>
  );
}
