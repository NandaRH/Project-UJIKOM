import { useState } from "react";

const initialFormState = {
  name: "",
  description: "",
  beanType: "arabika",
  process: "natural",
  price: "",
  stock: "",
  tags: "",
  active: true,
};

function AddProductAdmin() {
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState("");

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setPreview("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setServerMsg("");

    const body = new FormData();
    body.append("name", formData.name);
    body.append("description", formData.description);
    body.append("beanType", formData.beanType);
    body.append("process", formData.process);
    body.append("price", formData.price);
    body.append("stock", formData.stock);
    body.append("tags", formData.tags);
    body.append("active", String(formData.active));

    if (imageFile) {
      body.append("image", imageFile); // key wajib "image"
    }

    try {
      const response = await fetch("http://localhost:5000/api/admin/products", {
        method: "POST",
        body,
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Gagal menyimpan produk");
      }

      setServerMsg("Produk berhasil disimpan");
      setFormData(initialFormState);
      setImageFile(null);
      setPreview("");
    } catch (error) {
      setServerMsg(`Gagal menyimpan produk: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Tambah Produk Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama Produk</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded border p-2"
            placeholder="Nama kopi spesial"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Deskripsi</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full rounded border p-2"
            rows={3}
            placeholder="Catatan rasa, origin, dsb."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Jenis Biji</label>
            <select
              name="beanType"
              value={formData.beanType}
              onChange={handleChange}
              className="w-full rounded border p-2"
            >
              <option value="arabika">Arabika</option>
              <option value="robusta">Robusta</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Proses</label>
            <select
              name="process"
              value={formData.process}
              onChange={handleChange}
              className="w-full rounded border p-2"
            >
              <option value="natural">Natural</option>
              <option value="fullwash">Fullwash</option>
              <option value="honey">Honey</option>
              <option value="eksperimental">Eksperimental</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Harga</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="w-full rounded border p-2"
              placeholder="45000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Stok</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className="w-full rounded border p-2"
              placeholder="10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="w-full rounded border p-2"
            placeholder="fruity, chocolate, light roast"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            name="active"
            checked={formData.active}
            onChange={handleChange}
            className="h-4 w-4"
          />
          <label htmlFor="active" className="text-sm font-medium">
            Aktif / tampilkan produk
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Upload Gambar</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview Produk"
              className="mt-3 w-32 h-32 object-cover rounded border"
            />
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-[#6b3e1f] hover:bg-[#502d16] text-white px-4 py-2 rounded w-full disabled:opacity-70"
        >
          {loading ? "Menyimpan..." : "Simpan Produk"}
        </button>

        {serverMsg && (
          <div className="text-center text-sm text-gray-700">{serverMsg}</div>
        )}
      </form>
    </div>
  );
}

export default AddProductAdmin;
