import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

const roastOptions = [
  { value: "lite", label: "Lite" },
  { value: "medium", label: "Medium" },
  { value: "dark", label: "Dark" },
];

const schema = yup.object({
  name: yup.string().required("Nama layanan wajib diisi"),
  description: yup.string().nullable(),
  beanType: yup
    .string()
    .oneOf(["arabika", "robusta"], "Jenis kopi tidak valid")
    .required("Jenis kopi wajib diisi"),
  price: yup
    .number()
    .typeError("Harga harus angka")
    .min(0, "Harga minimal 0")
    .required("Harga wajib diisi"),
  roastProfiles: yup
    .array()
    .of(yup.string().oneOf(roastOptions.map((item) => item.value)))
    .min(1, "Pilih minimal satu profil sangrai"),
  minWeightKg: yup
    .number()
    .typeError("Berat minimal harus angka")
    .min(0, "Minimal 0 kg")
    .default(1),
  maxWeightKg: yup
    .number()
    .min(yup.ref("minWeightKg"), "Berat maksimal tidak boleh lebih kecil dari berat minimal")
    .default(50),
  imageURL: yup.string().nullable(),
  active: yup.boolean().default(true),
});

const defaultValues = {
  name: "",
  description: "",
  beanType: "arabika",
  price: 0,
  roastProfiles: ["lite", "medium", "dark"],
  minWeightKg: 1,
  maxWeightKg: 50,
  imageURL: "",
  active: true,
};

function ServiceFormModal({
  open,
  mode,
  onClose,
  onSubmit,
  register,
  handleSubmit,
  errors,
  watch,
  setValue,
  loading,
}) {
  if (!open) return null;

  const selectedProfiles = watch("roastProfiles") || [];

  const toggleRoastProfile = (profile) => {
    const exists = selectedProfiles.includes(profile);
    const next = exists
      ? selectedProfiles.filter((item) => item !== profile)
      : [...selectedProfiles, profile];
    setValue("roastProfiles", next, { shouldValidate: true });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--coffee)]">
              {mode === "create" ? "Tambah Layanan" : "Edit Layanan"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-slate-500 hover:text-red-500"
            >
              Tutup
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-slate-600">Nama</label>
              <input
                type="text"
                {...register("name")}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Jenis Biji</label>
              <select
                {...register("beanType")}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="arabika">Arabika</option>
                <option value="robusta">Robusta</option>
              </select>
              {errors.beanType && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.beanType.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Harga per Kg
              </label>
              <input
                type="number"
                step="1000"
                {...register("price")}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              {errors.price && (
                <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Min (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("minWeightKg")}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
                {errors.minWeightKg && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.minWeightKg.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">
                  Max (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  {...register("maxWeightKg")}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                />
                {errors.maxWeightKg && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.maxWeightKg.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">
              Profil Sangrai
            </label>
            <div className="mt-2 flex flex-wrap gap-3">
              {roastOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 rounded border px-3 py-2 text-sm ${
                    selectedProfiles.includes(option.value)
                      ? "border-[var(--coffee)] bg-[var(--coffee)]/5 text-[var(--coffee)]"
                      : "border-slate-300 text-slate-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedProfiles.includes(option.value)}
                    onChange={() => toggleRoastProfile(option.value)}
                    className="accent-[var(--coffee)]"
                  />
                  {option.label}
                </label>
              ))}
            </div>
            {errors.roastProfiles && (
              <p className="mt-1 text-xs text-red-500">
                {errors.roastProfiles.message}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">
              Deskripsi
            </label>
            <textarea
              rows={3}
              {...register("description")}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Tuliskan detail layanan atau catatan tambahan."
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[2fr_auto] md:items-end">
            <div>
              <label className="text-sm font-medium text-slate-600">
                URL Gambar (opsional)
              </label>
              <input
                type="url"
                {...register("imageURL")}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <input type="checkbox" {...register("active")} />
              Aktif
            </label>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-[var(--coffee)] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#5c3217] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ServicesAdmin() {
  const [services, setServices] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "create" });
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/services", {
        params: { page, q: debouncedSearch || undefined },
      });
      setServices(data.data || []);
      setMeta(data.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal memuat layanan.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const openCreate = () => {
    setModal({ open: true, mode: "create" });
    setSelected(null);
    reset(defaultValues);
  };

  const openEdit = (service) => {
    setSelected(service);
    setModal({ open: true, mode: "edit" });
    reset({
      name: service.name,
      description: service.description || "",
      beanType: service.beanType,
      price: service.price,
      roastProfiles: service.roastProfiles || ["lite", "medium", "dark"],
      minWeightKg: service.minWeightKg ?? 1,
      maxWeightKg: service.maxWeightKg ?? 50,
      imageURL: service.imageURL || "",
      active: service.active,
    });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "create" });
    setSelected(null);
    reset(defaultValues);
  };

  const handleDelete = async (service) => {
    if (!window.confirm(`Hapus layanan ${service.name}?`)) return;
    try {
      await api.delete(`/admin/services/${service._id}`);
      toast.success("Layanan dihapus.");
      fetchServices();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal menghapus layanan.");
    }
  };

  const submitService = async (values) => {
    setSubmitting(true);
    const payload = {
      ...values,
      price: Number(values.price),
      minWeightKg: Number(values.minWeightKg),
      maxWeightKg: Number(values.maxWeightKg),
      roastProfiles: values.roastProfiles,
      active: Boolean(values.active),
    };

    try {
      if (modal.mode === "create") {
        await api.post("/admin/services", payload);
        toast.success("Layanan ditambahkan.");
      } else if (selected) {
        await api.put(`/admin/services/${selected._id}`, payload);
        toast.success("Layanan diperbarui.");
      }
      closeModal();
      fetchServices();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal menyimpan layanan.");
    } finally {
      setSubmitting(false);
    }
  };

  const tableContent = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
            Memuat data layanan...
          </td>
        </tr>
      );
    }

    if (!services.length) {
      return (
        <tr>
          <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
            Belum ada layanan.
          </td>
        </tr>
      );
    }

    return services.map((service) => (
      <tr key={service._id} className="border-b text-sm last:border-0">
        <td className="px-4 py-3">
          <div className="font-semibold text-slate-700">{service.name}</div>
          <div className="text-xs text-slate-500">
            {service.beanType?.toUpperCase()} / Rp 
            {new Intl.NumberFormat("id-ID").format(service.price)}
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="text-xs text-slate-500">
            {service.roastProfiles?.map((profile) => profile.toUpperCase()).join(", ")}
          </div>
        </td>
        <td className="px-4 py-3 text-center text-sm">
          {service.minWeightKg ?? 1} - {service.maxWeightKg ?? 50} kg
        </td>
        <td className="px-4 py-3 text-center text-sm">
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
              service.active
                ? "bg-green-100 text-green-700"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {service.active ? "Aktif" : "Nonaktif"}
          </span>
        </td>
        <td className="px-4 py-3 text-sm">
          {service.imageURL ? (
            <a
              href={service.imageURL}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-[var(--coffee)] underline"
            >
              Lihat gambar
            </a>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          )}
        </td>
        <td className="px-4 py-3 text-right text-sm">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => openEdit(service)}
              className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(service)}
              className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Hapus
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [loading, services]);

  return (
    <AdminLayout
      title="Services"
      actions={
        <button
          onClick={openCreate}
          className="rounded bg-[var(--coffee)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5c3217]"
        >
          Tambah Layanan
        </button>
      }
    >
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--coffee)]">
              Layanan Roastery
            </h3>
            <p className="text-xs text-slate-500">
              Kelola layanan roasting dan pengaturan berat.
            </p>
          </div>
          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(event) => {
                setPage(1);
                setSearch(event.target.value);
              }}
              placeholder="Cari nama layanan..."
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Profil Sangrai</th>
                <th className="px-4 py-3 text-center">Rentang Berat</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Media</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>{tableContent}</tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row">
          <div>
            {`Halaman ${meta.page} dari ${meta.totalPages} | Total ${meta.total} layanan`}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={meta.page <= 1}
              className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sebelumnya
            </button>
            <button
              onClick={() =>
                setPage((prev) =>
                  meta.page < meta.totalPages ? prev + 1 : meta.totalPages
                )
              }
              disabled={!meta.hasNext}
              className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      <ServiceFormModal
        open={modal.open}
        mode={modal.mode}
        onClose={closeModal}
        onSubmit={submitService}
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        watch={watch}
        setValue={setValue}
        loading={submitting}
      />
    </AdminLayout>
  );
}

