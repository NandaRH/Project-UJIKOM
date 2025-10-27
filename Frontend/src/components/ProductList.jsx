import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const normalizeProduct = (item, index) => {
  const fallbackId = `product-${index}`;
  if (!item || typeof item !== "object") {
    return {
      id: fallbackId,
      name: "Produk Kopi",
      beanType: "",
      process: "",
      price: 0,
      imageUrl: "",
    };
  }

  return {
    id: item._id || item.id || item.slug || fallbackId,
    name: item.name || "Produk Kopi",
    beanType: item.beanType || "",
    process: item.process || "",
    price: Number(item.price ?? 0),
    imageUrl: item.imageUrl || item.imageURL || item.image || "",
  };
};

function ProductList({ className = "", fallbackItems = [], limit }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    let ignore = false;

    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (!response.ok) {
          throw new Error(`Gagal memuat produk (status ${response.status})`);
        }
        const data = await response.json();
        const normalized = Array.isArray(data)
          ? data.map((item, idx) => normalizeProduct(item, idx))
          : [];
        if (!ignore) {
          setItems(normalized);
        }
      } catch (err) {
        console.error(err);
        if (!ignore) {
          setItems([]);
          setError(err.message || "Gagal memuat produk");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      ignore = true;
    };
  }, []);

  const normalizedFallback = fallbackItems.map((item, idx) =>
    normalizeProduct(item, idx)
  );

  if (loading) {
    return <div className="p-6 text-center">Memuat produk...</div>;
  }

  const hasApiItems = items.length > 0;
  const displayItems = hasApiItems ? items : normalizedFallback;
  const finalItems =
    typeof limit === "number" && limit > 0
      ? displayItems.slice(0, limit)
      : displayItems;

  const handleAddToCart = (product) => {
    if (!user) {
      navigate("/login");
      return;
    }

    addItem({
      key: `prod:${product.id}`,
      type: "product",
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: 1,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <div className={className}>
      {error && !hasApiItems && (
        <div className="mb-4 rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          {error}.{" "}
          {normalizedFallback.length
            ? "Menampilkan produk contoh sementara backend tidak tersedia."
            : "Pastikan backend berjalan dan endpoint tersedia."}
        </div>
      )}

      {finalItems.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          Belum ada produk aktif.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {finalItems.map((product) => {
            const imageSrc = product.imageUrl;
            const beanLabel = product.beanType
              ? product.beanType.toString().toUpperCase()
              : "";
            const processLabel = product.process
              ? product.process.toString().toUpperCase()
              : "-";
            const priceLabel = "Rp " + Number(product.price || 0).toLocaleString("id-ID");

            return (
              <div
                key={product.id}
                className="flex flex-col overflow-hidden rounded-lg border bg-white shadow transition hover:shadow-lg"
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">no image</span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-sm font-semibold text-[var(--coffee)]">
                      {product.name}
                    </h3>
                    <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                      {processLabel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{beanLabel}</p>
                  <div className="text-base font-bold text-[#6b3e1f]">
                    {priceLabel}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="mt-auto rounded bg-[#6b3e1f] py-2 text-sm text-white transition hover:bg-[#502d16]"
                  >
                    Tambah ke Keranjang
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProductList;

// Jangan slice atau limit; tampilkan semua produk aktif dari backend.
