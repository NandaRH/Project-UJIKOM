import { useLocation } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";

export default function Invoice() {
  const { state } = useLocation();
  const order = state?.order;
  const shipping = order?.shipping || state?.shipping;
  const waNumber = "085155306045"; // ganti dengan nomor WhatsApp admin

  if (!order) {
    return (
      <UserLayout>
        <div className="mt-20 text-center text-slate-600">
          <p>Invoice tidak ditemukan.</p>
        </div>
      </UserLayout>
    );
  }

  const waMessageLines = [
    "Halo, saya ingin konfirmasi pesanan:",
    `ID Pesanan: ${order.orderId}`,
    `Nama: ${order.customerName}`,
    `Alamat: ${order.address}`,
    `Total: Rp ${order.total.toLocaleString("id-ID")}`,
  ];

  if (shipping) {
    waMessageLines.push(
      `Pengiriman: ${shipping.service?.toUpperCase() || "REGULER"}`,
      `Jarak: ${shipping.totalDistance || "-"}`,
      `Ongkir: Rp ${Number(shipping.totalCost || 0).toLocaleString("id-ID")}`
    );
  }

  waMessageLines.push("Mohon konfirmasi untuk proses selanjutnya.");

  const waText = encodeURIComponent(waMessageLines.join("\n"));
  const waLink = `https://wa.me/${waNumber}?text=${waText}`;

  return (
    <UserLayout>
      <div className="mx-auto mt-10 max-w-4xl space-y-6 rounded-xl bg-white p-8 shadow">
        <h1 className="mb-6 text-center text-3xl font-bold text-[var(--coffee)]">
          Invoice Pesanan
        </h1>

        <div className="space-y-2 border-b pb-4">
          <p>
            <b>ID Pesanan:</b> {order.orderId}
          </p>
          <p>
            <b>Nama Pembeli:</b> {order.customerName}
          </p>
          <p>
            <b>Alamat:</b> {order.address}
          </p>
          <p>
            <b>Status Pembayaran:</b> Belum Dibayar
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-[var(--coffee)]">
            Rincian Pesanan
          </h2>
          {order.items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex justify-between text-sm">
              <span>
                {item.qty}x {item.name}
              </span>
              <span>Rp {(item.price * item.qty).toLocaleString("id-ID")}</span>
            </div>
          ))}

          <div className="mt-2 flex justify-between border-t pt-3 font-semibold">
            <span>Subtotal Produk</span>
            <span>Rp {order.total.toLocaleString("id-ID")}</span>
          </div>

          {shipping && (
            <div className="mt-3 space-y-1 border-t pt-3 text-sm">
              <p>
                <b>Layanan:</b> {shipping.service?.toUpperCase()}
              </p>
              <p>
                <b>Jarak Total:</b> {shipping.totalDistance || "-"}
              </p>
              <p>
                <b>Ongkir:</b> Rp {Number(shipping.totalCost || 0).toLocaleString("id-ID")}
              </p>
              <p>
                <b>Mode:</b>{" "}
                {shipping.mode === "two_way" ? "Dua Arah (Service)" : "Satu Arah (Produk)"}
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total Pembayaran</span>
            <span>Rp {order.total.toLocaleString("id-ID")}</span>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block rounded-lg bg-green-600 px-6 py-3 text-white transition hover:bg-green-700"
          >
            Konfirmasi via WhatsApp
          </a>
        </div>
      </div>
    </UserLayout>
  );
}
