import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import { getOrderHistoryApi } from "../../services/orderApi";

const STATUS_OPTIONS = [
  { value: "all", label: "Semua status" },
  { value: "pending", label: "Belum dibayar" },
  { value: "processing", label: "Sedang diproses" },
  { value: "completed", label: "Selesai" },
  { value: "cancelled", label: "Dibatalkan" },
];

const STATUS_LABELS = {
  pending: "Belum dibayar",
  processing: "Sedang diproses",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700 border border-amber-200",
  processing: "bg-blue-100 text-blue-700 border border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border border-rose-200",
};

const formatCurrency = (value) =>
  typeof value === "number"
    ? `Rp ${value.toLocaleString("id-ID")}`
    : "-";

export default function History() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let ignore = false;

    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      try {
        const params = statusFilter === "all" ? undefined : { status: statusFilter };
        const res = await getOrderHistoryApi(params);
        if (!ignore) {
          setOrders(Array.isArray(res.data?.orders) ? res.data.orders : []);
        }
      } catch (err) {
        if (ignore) return;
        const message =
          err?.response?.data?.message ||
          "Gagal memuat riwayat pesanan. Coba lagi beberapa saat.";
        setError(message);
        setOrders([]);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchHistory();

    return () => {
      ignore = true;
    };
  }, [statusFilter, refreshCount]);

  const handleRefresh = () => setRefreshCount((prev) => prev + 1);

  const handleViewInvoice = (order) => {
    navigate(`/user/invoice/${order.orderId}`, {
      state: { order, shipping: order.shipping },
    });
  };

  return (
    <UserLayout>
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">History Checkout</h1>
            <p className="text-sm text-slate-600">
              Lihat semua pesanan yang pernah kamu buat melalui 1612 Roastery.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-[#e5ded5] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--coffee)]"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="rounded-lg border border-[var(--coffee)] px-4 py-2 text-sm font-medium text-[var(--coffee)] transition hover:bg-[var(--coffee)] hover:text-white disabled:cursor-not-allowed disabled:border-opacity-60 disabled:text-opacity-60"
            >
              {loading ? "Memuat..." : "Segarkan"}
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-lg border border-[#e5ded5] bg-white p-6 text-sm text-slate-600">
            Memuat riwayat checkout...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
            <p>{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 inline-flex items-center gap-2 rounded border border-rose-300 px-3 py-1 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
            >
              Coba lagi
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="rounded-lg border border-[#e5ded5] bg-white p-6 text-slate-600">
            Belum ada riwayat transaksi. Yuk mulai checkout untuk melihat pesananmu di sini.
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order) => {
              const createdAt = order.createdAt
                ? new Date(order.createdAt)
                : null;
              const createdLabel = createdAt
                ? `${createdAt.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })} - ${createdAt.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "-";

              const statusClass =
                STATUS_STYLES[order.status] ||
                "bg-slate-100 text-slate-700 border border-slate-200";

              const statusLabel = STATUS_LABELS[order.status] || order.status || "-";

              const visibleItems = Array.isArray(order.items)
                ? order.items.slice(0, 3)
                : [];

              const remainingItems =
                Array.isArray(order.items) && order.items.length > visibleItems.length
                  ? order.items.length - visibleItems.length
                  : 0;

              return (
                <div
                  key={order._id || order.orderId}
                  className="rounded-xl border border-[#e5ded5] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-slate-500">
                        ID Pesanan
                      </p>
                      <p className="text-lg font-semibold text-[var(--coffee)]">
                        {order.orderId}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{order.address}</p>
                      <p className="mt-1 text-xs text-slate-500">{createdLabel}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}
                      >
                        {statusLabel}
                      </span>
                      <p className="mt-3 text-sm text-slate-500">Total Pembayaran</p>
                      <p className="text-lg font-bold text-[var(--coffee)]">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 border-t border-[#f1d7bd] pt-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Ringkasan Item
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      {visibleItems.map((item, index) => (
                        <li key={item._id || index} className="flex justify-between gap-4">
                          <span className="truncate">
                            {item.qty}x {item.name}
                          </span>
                          <span>{formatCurrency(item.price * item.qty)}</span>
                        </li>
                      ))}
                    </ul>
                    {remainingItems > 0 && (
                      <p className="mt-1 text-xs text-slate-500">
                        +{remainingItems} item lainnya
                      </p>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 border-t border-[#f1d7bd] pt-4 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
                    <div>
                      {order.shipping ? (
                        <>
                          <p>
                            <span className="font-medium">Pengiriman:</span>{" "}
                            {order.shipping.service?.toUpperCase() || "-"}
                          </p>
                          <p>
                            <span className="font-medium">Ongkir:</span>{" "}
                            {formatCurrency(order.shipping.totalCost)}
                          </p>
                        </>
                      ) : (
                        <p>Informasi pengiriman belum tersedia.</p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleViewInvoice(order)}
                        className="rounded-lg bg-[var(--coffee)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5c3217]"
                      >
                        Lihat Invoice
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
