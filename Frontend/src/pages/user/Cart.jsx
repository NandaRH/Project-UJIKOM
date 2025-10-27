import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";

export default function Cart() {
  const { items, removeItem, clear } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [destination, setDestination] = useState("");
  const [type, setType] = useState("regular");
  const [shipping, setShipping] = useState(null);
  const [loading, setLoading] = useState(false);

  const jasaItems = items.filter((item) => item.type === "service");
  const produkItems = items.filter((item) => item.type !== "service");

  const subtotalJasa = jasaItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const subtotalProduk = produkItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  const subtotal = subtotalJasa + subtotalProduk;
  const shippingCost = shipping?.summary?.totalCost || 0;
  const total = shipping ? subtotal + shippingCost : subtotal;

  const requestShipping = async () => {
    if (!destination.trim()) {
      alert("Masukkan alamat atau koordinat pembeli terlebih dahulu.");
      return;
    }

    setLoading(true);
    setShipping(null);
    try {
      const hasService = items.some((item) => item.type === "service");

      const response = await api.post("/shipping/calculate", {
        orderId: `ORD-${Date.now()}`,
        customerAddress: destination,
        weight: items.length > 0 ? items.length * 10 : 10,
        type,
        hasService,
      });

      setShipping(response.data);
    } catch (error) {
      console.error("Gagal menghitung ongkir:", error);
      alert("Gagal menghitung ongkir, periksa koneksi backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!shipping) {
      alert("Hitung ongkir terlebih dahulu sebelum checkout!");
      return;
    }

    if (items.length === 0) {
      alert("Keranjang Anda masih kosong!");
      return;
    }

    setLoading(true);
    try {
      const cleanItems = items.map((item) => ({
        productId: item.productId,
        serviceId: item.serviceId,
        name: item.name,
        price: item.price,
        qty: item.qty,
        type: item.type || "product",
      }));

      const payload = {
        orderId: shipping.shipments?.[0]?.orderId || `ORD-${Date.now()}`,
        customerName: user?.full_name || user?.username || user?.email || "Customer",
        address: destination,
        items: cleanItems,
        total,
        shipping: shipping.summary,
      };

      const response = await api.post("/order/create", payload);

      clear();
      navigate(`/user/invoice/${response.data.order.orderId}`, { state: response.data });
    } catch (error) {
      console.error("Gagal membuat pesanan:", error);
      alert("Gagal membuat pesanan. Periksa koneksi backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserLayout>
      <div className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <h1 className="text-3xl font-extrabold text-[var(--coffee)]">Keranjang</h1>

        {items.length === 0 ? (
          <p className="text-slate-600">Keranjang Anda masih kosong.</p>
        ) : (
          <>
            <div className="space-y-4 rounded-lg border bg-white p-4">
              {items.map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between border-b pb-2"
                >
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-600">
                      {item.qty}x @Rp {item.price.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.key)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              ))}
            </div>

            <div className="rounded-lg border bg-[#fffaf5] p-6">
              <h2 className="mb-4 text-lg font-semibold">Ringkasan Pembelian</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal Jasa</span>
                  <span>Rp {subtotalJasa.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal Produk</span>
                  <span>Rp {subtotalProduk.toLocaleString("id-ID")}</span>
                </div>

                <div className="mt-4 space-y-2">
                  <label className="block text-sm">Alamat / Koordinat Pembeli</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    placeholder="Contoh: Jl. Tomang Raya No.11, Jakarta Barat"
                    className="w-full rounded border p-2 text-sm"
                  />

                  <label className="mt-2 block text-sm">Jenis Pengiriman</label>
                  <select
                    value={type}
                    onChange={(event) => setType(event.target.value)}
                    className="w-full rounded border p-2 text-sm"
                  >
                    <option value="regular">JNE Reguler</option>
                    <option value="cargo">JNE Cargo</option>
                  </select>

                  <button
                    onClick={requestShipping}
                    disabled={loading}
                    className="mt-2 w-full rounded bg-[var(--coffee)] py-2 text-white transition hover:bg-[#5c3217] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Menghitung..." : "Hitung Ongkir"}
                  </button>
                </div>

                {shipping && (
                  <div className="mt-3 rounded border bg-white p-3 text-sm">
                    <p>
                      Mode Pengiriman:{" "}
                      <b>
                        {shipping.summary.mode === "two_way"
                          ? "Dua Arah (Service)"
                          : "Satu Arah (Produk)"}
                      </b>
                    </p>
                    <p>
                      Layanan: <b>{shipping.summary.service.toUpperCase()}</b>
                    </p>
                    <p>
                      Total Jarak: <b>{shipping.summary.totalDistance}</b>
                    </p>
                    <p>
                      Ongkir Total:{" "}
                      <b>Rp {shipping.summary.totalCost.toLocaleString("id-ID")}</b>
                    </p>
                  </div>
                )}

                <div className="mt-4 flex justify-between border-t pt-3 text-lg font-semibold">
                  <span>Total</span>
                  <span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  onClick={() => navigate("/user/dashboard")}
                  className="rounded border border-[var(--coffee)] px-4 py-2 text-[var(--coffee)] transition hover:bg-[var(--coffee)] hover:text-white"
                >
                  Lanjutkan Belanja
                </button>

                <button
                  onClick={clear}
                  className="rounded border border-red-500 px-4 py-2 text-red-500 transition hover:bg-red-500 hover:text-white"
                >
                  Kosongkan
                </button>

                <button
                  disabled={items.length === 0 || !shipping || loading}
                  onClick={handleCheckout}
                  className="rounded bg-[var(--coffee)] px-4 py-2 text-white transition hover:bg-[#5c3217] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Memproses..." : "Checkout Sekarang"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
}
