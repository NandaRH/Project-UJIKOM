import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginAdminApi } from "../../services/authApi";
import LandingLayout from "../../layouts/LandingLayout";
import { useAuth } from "../../context/AuthContext";

export default function LoginAdmin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await loginAdminApi(form);
      login(data.user, data.token);
      const fallback = "/admin/dashboard";
      const redirectTo = location.state?.from || fallback;
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login gagal, periksa kredensial Anda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LandingLayout>
      <div className="mx-auto max-w-md px-6 py-20">
        <h1 className="mb-6 text-4xl font-extrabold text-[var(--coffee)]">
          Masuk Admin
        </h1>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder="Email Admin"
            className="w-full rounded border p-3"
            value={form.email}
            onChange={handleChange("email")}
            required
          />
          <input
            type="password"
            placeholder="Kata sandi"
            className="w-full rounded border p-3"
            value={form.password}
            onChange={handleChange("password")}
            required
          />

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[var(--coffee)] py-3 text-white transition hover:bg-[#5c3217] disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? "Memproses..." : "Masuk Admin"}
          </button>
        </form>
      </div>
    </LandingLayout>
  );
}

