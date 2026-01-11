import { useEffect, useMemo, useRef, useState } from "react";
import UserLayout from "../../layouts/UserLayout";
import { useAuth } from "../../context/AuthContext";
import { updateProfileApi } from "../../services/userApi";

const genderOptions = ["Pria", "Wanita"];

const profileToForm = (profile) => ({
  full_name: profile?.full_name || "",
  username: profile?.username || "",
  email: profile?.email || "",
  phone: profile?.phone || "",
  gender: profile?.gender || "",
  birthDate: profile?.birthDate
    ? new Date(profile.birthDate).toISOString().slice(0, 10)
    : "",
  address: profile?.address || "",
});

export default function Settings() {
  const { user, refreshProfile } = useAuth();
  const [form, setForm] = useState(() => profileToForm(user));
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const userRef = useRef(user);

  const isDirty = useMemo(() => {
    if (!user) return false;
    const baseline = profileToForm(user);
    return Object.keys(baseline).some((key) => baseline[key] !== form[key]);
  }, [form, user]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      setLoadingProfile(true);
      try {
        const profile = await refreshProfile();
        if (!active) return;
        const source = profile || userRef.current;
        if (source) {
          setForm(profileToForm(source));
        }
        setError("");
      } catch (err) {
        if (!active) return;
        setError(
          err?.response?.data?.message || "Gagal memuat data profil pengguna.",
        );
        if (userRef.current) {
          setForm(profileToForm(userRef.current));
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    };

    loadProfile();
    return () => {
      active = false;
    };
  }, [refreshProfile]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const payload = {
        ...form,
        birthDate: form.birthDate ? form.birthDate : null,
        gender: form.gender || "",
      };
      const res = await updateProfileApi(payload);
      const latest = await refreshProfile();
      if (latest) {
        setForm(profileToForm(latest));
      }
      setSuccess(res.data?.message || "Profil berhasil diperbarui.");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Gagal memperbarui data profil Anda.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <UserLayout>
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[var(--coffee)]">
            Pengaturan Akun
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Kelola informasi profil Anda untuk pengalaman pemesanan yang lebih
            personal.
          </p>
        </div>

        {loadingProfile ? (
          <div className="rounded-2xl border border-[#f1d7bd] bg-white p-6 text-sm text-slate-600 shadow-sm">
            Memuat data profil...
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-8 rounded-2xl border border-[#f1d7bd] bg-white p-6 shadow-sm"
          >
            {error && (
              <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {success}
              </div>
            )}

            <section>
              <h2 className="text-lg font-semibold text-[var(--coffee)]">
                Informasi Dasar
              </h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <label className="flex flex-col text-sm">
                  <span className="mb-2 font-medium text-[var(--coffee)]">
                    Nama Lengkap
                  </span>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={handleChange("full_name")}
                    className="rounded-lg border border-[#e5ded5] px-4 py-2 focus:border-[var(--coffee)] focus:outline-none"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </label>
                <label className="flex flex-col text-sm">
                  <span className="mb-2 font-medium text-[var(--coffee)]">
                    Username
                  </span>
                  <input
                    type="text"
                    value={form.username}
                    onChange={handleChange("username")}
                    className="rounded-lg border border-[#e5ded5] px-4 py-2 focus:border-[var(--coffee)] focus:outline-none"
                    placeholder="Nama panggilan / username"
                  />
                </label>
                <label className="flex flex-col text-sm">
                  <span className="mb-2 font-medium text-[var(--coffee)]">
                    Email
                  </span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    className="rounded-lg border border-[#e5ded5] px-4 py-2 focus:border-[var(--coffee)] focus:outline-none"
                    placeholder="Alamat email aktif"
                    required
                  />
                </label>
                <label className="flex flex-col text-sm">
                  <span className="mb-2 font-medium text-[var(--coffee)]">
                    No. Telepon
                  </span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange("phone")}
                    className="rounded-lg border border-[#e5ded5] px-4 py-2 focus:border-[var(--coffee)] focus:outline-none"
                    placeholder="Contoh 08XXXXXXXXXX"
                  />
                </label>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-[var(--coffee)]">
                Detail Tambahan
              </h2>
              <div className="mt-4 grid gap-5 md:grid-cols-2">
                <label className="flex flex-col text-sm">
                  <span className="mb-2 font-medium text-[var(--coffee)]">
                    Gender
                  </span>
                  <select
                    value={form.gender}
                    onChange={handleChange("gender")}
                    className="rounded-lg border border-[#e5ded5] px-4 py-2 focus:border-[var(--coffee)] focus:outline-none"
                  >
                    <option value="">Pilih gender</option>
                    {genderOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col text-sm">
                  <span className="mb-2 font-medium text-[var(--coffee)]">
                    Tanggal Lahir
                  </span>
                  <input
                    type="date"
                    value={form.birthDate}
                    onChange={handleChange("birthDate")}
                    className="rounded-lg border border-[#e5ded5] px-4 py-2 focus:border-[var(--coffee)] focus:outline-none"
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </label>
              </div>
              <label className="mt-4 flex flex-col text-sm">
                <span className="mb-2 font-medium text-[var(--coffee)]">
                  Alamat
                </span>
                <textarea
                  value={form.address}
                  onChange={handleChange("address")}
                  className="min-h-[120px] rounded-lg border border-[#e5ded5] px-4 py-3 text-sm focus:border-[var(--coffee)] focus:outline-none"
                  placeholder="Alamat lengkap untuk keperluan pengiriman"
                />
              </label>
            </section>

            <div className="flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  if (user) {
                    setForm(profileToForm(user));
                    setError("");
                    setSuccess("");
                  }
                }}
                className="rounded-full border border-[#e5ded5] px-5 py-2 text-sm font-medium text-[var(--coffee)] transition hover:bg-[#f4ede7]"
                disabled={saving || !isDirty}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving || !isDirty}
                className="rounded-full bg-[var(--coffee)] px-6 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#5c3217] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        )}
      </div>
    </UserLayout>
  );
}
