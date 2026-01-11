import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

const statusOptions = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

const statusLabels = {
  pending: "Pending",
  paid: "Paid",
  processing: "Processing",
  shipped: "Shipped",
  completed: "Completed",
  cancelled: "Cancelled",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "-";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/orders", {
        params: {
          page,
          q: debouncedSearch || undefined,
          status: status || undefined,
          from: from || undefined,
          to: to || undefined,
        },
      });
      setOrders(data.data || []);
      setMeta(data.meta || { page: 1, totalPages: 1, total: 0 });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal memuat pesanan.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, from, to]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openDetail = async (order) => {
    setDetailLoading(true);
    setSelectedOrder(null);
    try {
      const { data } = await api.get(`/admin/orders/${order._id}`);
      setSelectedOrder(data.order);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal memuat detail pesanan.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedOrder(null);
  };

  const changeStatus = async (orderId, nextStatus) => {
    setUpdatingStatus(true);
    try {
      const { data } = await api.patch(`/admin/orders/${orderId}/status`, {
        status: nextStatus,
      });
      toast.success("Status pesanan diperbarui.");
      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? data.order : order))
      );
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(data.order);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal memperbarui status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const response = await api.get(`/admin/orders/${orderId}/invoice`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal mengunduh invoice.");
    }
  };

  const exportCsv = async () => {
    try {
      const response = await api.get("/admin/orders/export.csv", {
        params: {
          status: status || undefined,
          from: from || undefined,
          to: to || undefined,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "orders-export.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Export CSV berhasil.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal mengunduh CSV.");
    }
  };

  const tableContent = useMemo(() => {
    if (loading) {
      return (
        <tr>
          <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
            Memuat data pesanan...
          </td>
        </tr>
      );
    }

    if (!orders.length) {
      return (
        <tr>
          <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
            Belum ada pesanan sesuai filter.
          </td>
        </tr>
      );
    }

    return orders.map((order) => (
      <tr
        key={order._id}
        className="cursor-pointer border-b text-sm last:border-0 hover:bg-slate-50"
        onClick={() => openDetail(order)}
      >
        <td className="px-4 py-3 font-semibold text-[var(--coffee)]">
          {order.orderId}
        </td>
        <td className="px-4 py-3">
          <div className="font-medium text-slate-700">{order.customerName}</div>
          <div className="text-xs text-slate-500">{order.address}</div>
        </td>
        <td className="px-4 py-3">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
            {statusLabels[order.status] || order.status || "-"}
          </span>
        </td>
        <td className="px-4 py-3 font-semibold text-slate-700">
          {formatCurrency(order.total)}
        </td>
        <td className="px-4 py-3">
          {formatDateTime(order.createdAt)}
        </td>
        <td
          className="px-4 py-3 text-right text-xs text-[var(--coffee)] underline"
          onClick={(event) => {
            event.stopPropagation();
            openDetail(order);
          }}
        >
          Detail
        </td>
      </tr>
    ));
  }, [loading, orders]);

  const detailPanel = selectedOrder && (
    <aside className="w-full max-w-md border-l border-slate-200 bg-white shadow-lg">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--coffee)]">
            {selectedOrder.orderId}
          </h3>
          <p className="text-xs text-slate-500">
            {`${selectedOrder.customerName || "-"} | ${formatDateTime(selectedOrder.createdAt)}`}
          </p>
        </div>
        <button
          onClick={closeDetail}
          className="text-xs text-slate-500 hover:text-red-500"
        >
          Tutup
        </button>
      </div>

      <div className="space-y-5 px-5 py-4 text-sm text-slate-600">
        <div className="flex items-center justify-between gap-3">
          <span>Status</span>
          <select
            value={selectedOrder.status}
            onChange={(event) => changeStatus(selectedOrder._id, event.target.value)}
            disabled={updatingStatus}
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {statusLabels[option]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[var(--coffee)]">Alamat</h4>
          <p className="mt-1 text-xs text-slate-500">
            {selectedOrder.address || "-"}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-[var(--coffee)]">
            Item Pesanan
          </h4>
          <div className="mt-2 space-y-2 text-xs">
            {selectedOrder.items?.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center justify-between rounded border border-slate-200 px-3 py-2"
              >
                <div>
                  <div className="font-semibold text-slate-700">{item.name}</div>
                  <div className="text-[10px] text-slate-500">
                    {item.type?.toUpperCase()} / {item.qty} pcs
                  </div>
                </div>
                <div className="text-right">
                  <div>{formatCurrency(item.price)}</div>
                  <div className="text-[10px] text-slate-500">
                    Total {formatCurrency(item.price * item.qty)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-center justify-between text-xs">
            <span>Subtotal</span>
            <span>
              {formatCurrency(
                selectedOrder.items?.reduce(
                  (sum, item) => sum + item.price * item.qty,
                  0
                ) || 0
              )}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span>Ongkir</span>
            <span>{formatCurrency(selectedOrder.shipping?.totalCost || 0)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm font-semibold text-[var(--coffee)]">
            <span>Total</span>
            <span>{formatCurrency(selectedOrder.total)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => downloadInvoice(selectedOrder._id)}
            className="w-full rounded border border-[var(--coffee)] px-3 py-2 text-xs font-semibold text-[var(--coffee)] transition hover:bg-[var(--coffee)] hover:text-white"
          >
            Unduh Invoice (PDF)
          </button>
          <button
            onClick={closeDetail}
            className="w-full rounded border border-slate-200 px-3 py-2 text-xs text-slate-500 hover:bg-slate-100"
          >
            Selesai
          </button>
        </div>
      </div>

      {detailLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs text-slate-500">
          Memuat detail...
        </div>
      )}
    </aside>
  );

  return (
    <AdminLayout
      title="Orders"
      actions={
        <button
          onClick={exportCsv}
          className="rounded border border-[var(--coffee)] px-4 py-2 text-sm font-semibold text-[var(--coffee)] transition hover:bg-[var(--coffee)] hover:text-white"
        >
          Export CSV
        </button>
      }
    >
      <div className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white shadow-sm lg:flex-row">
        <section className="flex-1">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Cari order
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(event) => {
                    setPage(1);
                    setSearch(event.target.value);
                  }}
                  placeholder="Order ID atau nama customer"
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) => {
                    setPage(1);
                    setStatus(event.target.value);
                  }}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-xs"
                >
                  <option value="">Semua</option>
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {statusLabels[option]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Dari
                </label>
                <input
                  type="date"
                  value={from}
                  onChange={(event) => {
                    setPage(1);
                    setFrom(event.target.value);
                  }}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Sampai
                </label>
                <input
                  type="date"
                  value={to}
                  onChange={(event) => {
                    setPage(1);
                    setTo(event.target.value);
                  }}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>{tableContent}</tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 text-sm text-slate-600 sm:flex-row">
            <div>
              {`Halaman ${meta.page} dari ${meta.totalPages} | Total ${meta.total} orders`}
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
        </section>

        {detailPanel}
      </div>
    </AdminLayout>
  );
}


