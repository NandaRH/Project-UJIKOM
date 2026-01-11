import { useState } from "react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    const productId = product?._id ?? product?.id ?? null;
    const cartKeyBase =
      product?.slug ??
      productId ??
      (product?.name ? product.name.toLowerCase().replace(/\s+/g, "-") : "item");
    addItem({
      key: `prod:${cartKeyBase}`,
      type: "product",
      productId,
      name: product.name,
      price: Number(product.price ?? 0),
      qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 700);
  };

  const imageSrc = product?.imageUrl || product?.image || null;
  const beanLabel = product?.beanType
    ? product.beanType.toString().toUpperCase()
    : "-";
  const priceLabel = Number(product?.price ?? 0).toLocaleString("id-ID");

  return (
    <div className="flex flex-col justify-between rounded-lg border bg-white p-3 shadow-sm">
      <div>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="mb-2 h-40 w-full rounded object-cover"
          />
        ) : (
          <div className="mb-2 flex h-40 w-full items-center justify-center rounded bg-slate-100 text-xs text-slate-400">
            no image
          </div>
        )}
        <h3 className="font-semibold text-[var(--coffee)]">{product.name}</h3>
        <p className="text-sm text-slate-600">{beanLabel}</p>
        <p className="font-bold text-[var(--coffee)]">
          Rp {priceLabel}
        </p>
      </div>

      <div className="mt-3">
        <div className="mb-3 flex items-center justify-center">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="rounded-l border px-2"
          >
            -
          </button>
          <input
            type="text"
            value={qty}
            readOnly
            className="w-10 border-t border-b text-center"
          />
          <button
            onClick={() => setQty(qty + 1)}
            className="rounded-r border px-2"
          >
            +
          </button>
        </div>

        <button
          onClick={addToCart}
          className={`w-full rounded py-2 text-white transition ${
            added ? "bg-green-600 scale-105" : "bg-[var(--coffee)] hover:bg-[#5c3217]"
          }`}
        >
          {added ? "Ditambahkan!" : "Tambah"}
        </button>
      </div>
    </div>
  );
}
