import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

const schema = yup.object({
  name: yup.string().required("Nama produk wajib diisi"),
  description: yup.string().nullable(),
  beanType: yup
    .string()
    .oneOf(["arabika", "robusta"], "Pilih jenis biji kopi")
    .required("Jenis kopi wajib diisi"),
  process: yup
    .string()
    .oneOf(["natural", "fullwash", "honey", "eksperimental"], "Proses tidak valid")
    .required("Proses wajib diisi"),
  price: yup
    .number()
    .typeError("Harga harus angka")
    .min(0, "Harga minimal 0")
    .required("Harga wajib diisi"),
  stock: yup
    .number()
    .typeError("Stok harus angka")
    .integer("Stok harus bilangan bulat")
    .min(0, "Stok minimal 0")
    .default(0),
  tags: yup.string().nullable(),
  active: yup.boolean().default(true),
  image: yup
    .mixed()
    .test("fileSize", "Ukuran gambar maksimal 2MB", (fileList) => {
      if (!fileList || fileList.length === 0) return true;
      return fileList[0].size <= 2 * 1024 * 1024;
    })
    .test("fileType", "Format gambar harus JPEG/PNG/WebP", (fileList) => {
      if (!fileList || fileList.length === 0) return true;
      return ["image/jpeg", "image/png", "image/webp"].includes(fileList[0].type);
    }),
});

const defaultValues = {
  name: "",
  description: "",
  beanType: "arabika",
  process: "natural",
  price: 0,
  stock: 0,
  tags: "",
  active: true,
  image: null,
};

const processes = [
  { value: "natural", label: "Natural" },
  { value: "fullwash", label: "Fullwash" },
  { value: "honey", label: "Honey" },
  { value: "eksperimental", label: "Eksperimental" },
];

function ProductFormModal({
  open,
  onClose,
  onSubmit,
  mode,
  register,
  handleSubmit,
  errors,
  previewUrl,
  setPreviewUrl,
  reset,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-10">
      <div className="w-full max-w-2xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-[var(--coffee)]">
              {mode === "create" ? "Tambah Produk" : "Edit Produk"}
            </h3>
            <button
              type="button"
              onClick={() => {
                reset();
                setPreviewUrl((prev) => {
                  if (prev && prev.startsWith("blob:")) {
                    URL.revokeObjectURL(prev);
                  }
                  return "";
                });
                onClose();
              }}
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
              <label className="text-sm font-medium text-slate-600">Proses</label>
              <select
                {...register("process")}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              >
                {processes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.process && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.process.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">Harga</label>
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

            <div>
              <label className="text-sm font-medium text-slate-600">Stok</label>
              <input
                type="number"
                {...register("stock")}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              />
              {errors.stock && (
                <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-slate-600">
                Tag (pisahkan dengan koma)
              </label>
              <input
                type="text"
                {...register("tags")}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                placeholder="contoh: single origin, signature"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">
              Deskripsi
            </label>
            <textarea
              rows={3}
              {...register("description")}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Highlight produk, catatan rasa, dll."
            />
          </div>

  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div>
              <label className="text-sm font-medium text-slate-600">
                Gambar Produk
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("image")}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setPreviewUrl((prev) => {
                      if (prev && prev.startsWith("blob:")) {
                        URL.revokeObjectURL(prev);
                      }
                      return URL.createObjectURL(file);
                    });
                  } else {
                    setPreviewUrl((prev) => {
                      if (prev && prev.startsWith("blob:")) {
                        URL.revokeObjectURL(prev);
                      }
                      return "";
                    });
                  }
                }}
                className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[var(--coffee)] file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
              />
              {errors.image && (
                <p className="mt-1 text-xs text-red-500">{errors.image.message}</p>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <input type="checkbox" {...register("active")} />
              Aktif
            </label>
          </div>

          {previewUrl && (
            <div>
              <p className="text-xs font-semibold text-slate-500">Preview</p>
              <img
                src={previewUrl}
                alt="Preview produk"
                className="mt-2 h-32 w-full rounded object-cover"
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                reset();
                setPreviewUrl((prev) => {
                  if (prev && prev.startsWith("blob:")) {
                    URL.revokeObjectURL(prev);
                  }
                  return "";
                });
                onClose();
              }}
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

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [modal, setModal] = useState({ open: false, mode: "create" });
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const clearPreview = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) {
        URL.revokeObjectURL(prev);
      }
      return "";
    });
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/products", {
        params: {
          page,
          q: debouncedSearch || undefined,
        },
      });
      setProducts(data.data || []);
      setMeta(data.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal memuat produk.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "image" && value.image && value.image.length === 0) {
        clearPreview();
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, clearPreview]);

  useEffect(
    () => () => {
      clearPreview();
    },
    [clearPreview]
  );

  const openCreateModal = () => {
    setModal({ open: true, mode: "create" });
    setSelectedProduct(null);
    clearPreview();
    reset(defaultValues);
  };

  const openEditModal = (product) => {
    clearPreview();
    setSelectedProduct(product);
    setModal({ open: true, mode: "edit" });
    setPreviewUrl(product.imageURL || product.imageUrl || "");
    reset({
      name: product.name,
      description: product.description || "",
      beanType: product.beanType,
      process: product.process,
      price: product.price,
      stock: product.stock,
      tags: (product.tags || []).join(", "),
      active: product.active,
      image: null,
    });
  };

  const closeModal = () => {
    setModal({ open: false, mode: "create" });
    setSelectedProduct(null);
    reset(defaultValues);
    clearPreview();
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Hapus produk ${product.name}?`)) return;
    try {
      await api.delete(`/admin/products/${product._id}`);
      toast.success("Produk dihapus.");
      fetchProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal menghapus produk.");
    }
  };

  const submitProduct = async (formValues) => {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", formValues.name);
    formData.append("description", formValues.description || "");
    formData.append("beanType", formValues.beanType);
    formData.append("process", formValues.process);
    formData.append("price", String(formValues.price));
    formData.append("stock", String(formValues.stock ?? 0));
    formData.append("tags", formValues.tags || "");
    formData.append("active", String(formValues.active));

    const file = formValues.image?.[0];
    if (file) {
      formData.append("image", file);
    } else if (modal.mode === "edit") {
      const existingUrl = selectedProduct?.imageUrl || selectedProduct?.imageURL;
      if (existingUrl) {
        formData.append("imageURL", existingUrl);
      }
    }

    try {
      if (modal.mode === "create") {
        await api.post("/admin/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Produk berhasil ditambahkan.");
      } else if (selectedProduct) {
        await api.put(`/admin/products/${selectedProduct._id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Produk diperbarui.");
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal menyimpan produk.");
    } finally {
      setSubmitting(false);
    }
  };

  const tableContent = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
            Memuat data produk...
          </td>
        </tr>
      );
    }

    if (!products.length) {
      return (
        <tr>
          <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
            Belum ada data produk.
          </td>
        </tr>
      );
    }

    return products.map((product) => (
      <tr key={product._id} className="border-b text-sm last:border-0">
        <td className="px-4 py-3">
          {product.imageUrl || product.imageURL ? (
            <img
              src={product.imageUrl || product.imageURL}
              alt={product.name}
              className="h-14 w-14 rounded object-cover"
            />
          ) : (
            <span className="text-xs text-slate-400">No image</span>
          )}
        </td>
        <td className="px-4 py-3">
          <div className="font-semibold text-slate-700">{product.name}</div>
          <div className="text-xs text-slate-500">
            {product.beanType.toUpperCase()} / {product.process.toUpperCase()}
          </div>
        </td>
        <td className="px-4 py-3 text-sm font-semibold text-[var(--coffee)]">
          Rp {new Intl.NumberFormat("id-ID").format(product.price)}
        </td>
        <td className="px-4 py-3 text-center text-sm">{product.stock}</td>
        <td className="px-4 py-3 text-center text-sm">
          <span
            className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
              product.active
                ? "bg-green-100 text-green-700"
                : "bg-slate-200 text-slate-500"
            }`}
          >
            {product.active ? "Aktif" : "Nonaktif"}
          </span>
        </td>
        <td className="px-4 py-3 text-right text-sm">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => openEditModal(product)}
              className="rounded border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(product)}
              className="rounded border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Hapus
            </button>
          </div>
        </td>
      </tr>
    ));
  }, [loading, products]);

  return (
    <AdminLayout
      title="Products"
      actions={
        <button
          onClick={openCreateModal}
          className="rounded bg-[var(--coffee)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5c3217]"
        >
          Tambah Produk
        </button>
      }
    >
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-[var(--coffee)]">
              Katalog Produk
            </h3>
            <p className="text-xs text-slate-500">
              Kelola produk dan status ketersediaan.
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
              placeholder="Cari nama atau tag..."
              className="w-full rounded border border-slate-300 px-3 py-2 text-sm sm:w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Harga</th>
                <th className="px-4 py-3 text-center">Stok</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>{tableContent}</tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row">
          <div>
            {`Halaman ${meta.page} dari ${meta.totalPages} | Total ${meta.total} produk`}
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

      <ProductFormModal
        open={modal.open}
        onClose={closeModal}
        onSubmit={submitProduct}
        mode={modal.mode}
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        previewUrl={previewUrl}
        setPreviewUrl={setPreviewUrl}
        reset={reset}
        loading={submitting}
      />
    </AdminLayout>
  );
}
