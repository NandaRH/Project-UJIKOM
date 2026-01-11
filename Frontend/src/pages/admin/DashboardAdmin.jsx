import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";

const initialOverview = {
  todayOrders: 0,
  todayRevenue: 0,
  monthRevenue: 0,
  lowStockCount: 0,
  topProducts: [],
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

export default function DashboardAdmin() {
  const [overview, setOverview] = useState(initialOverview);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchOverview = async () => {
      try {
        const { data } = await api.get("/admin/reports/overview");
        if (active) setOverview({ ...initialOverview, ...data });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Gagal memuat laporan.");
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchOverview();
    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      title: "Pesanan Hari Ini",
      value: overview.todayOrders,
      description: "Total order masuk sejak pukul 00:00.",
    },
    {
      title: "Pendapatan Hari Ini",
      value: formatCurrency(overview.todayRevenue),
      description: "Sudah termasuk order berstatus paid ke atas.",
    },
    {
      title: "Pendapatan Bulan Ini",
      value: formatCurrency(overview.monthRevenue),
      description: "Akumulasi bulan berjalan.",
    },
    {
      title: "Produk Stok Rendah",
      value: overview.lowStockCount,
      description: "Jumlah SKU dengan stok <= 10.",
      link: "/admin/products",
    },
  ];

  return (
    <AdminLayout
      title="Dashboard"
      actions={
        <Link
          to="/admin/orders"
          className="rounded bg-[var(--coffee)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5c3217]"
        >
          Kelola Orders
        </Link>
      }
    >
      {loading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500">
          Memuat ringkasan...
        </div>
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="text-sm font-medium text-slate-500">
                  {card.title}
                </div>
                <div className="mt-2 text-2xl font-semibold text-[var(--coffee)]">
                  {card.value}
                </div>
                <p className="mt-3 text-xs text-slate-500">{card.description}</p>
                {card.link && (
                  <Link
                    to={card.link}
                    className="mt-3 inline-flex text-xs font-semibold text-[var(--coffee)]"
                  >
                    Lihat detail &gt;
                  </Link>
                )}
              </div>
            ))}
          </section>

          <section className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--coffee)]">
                Aktivitas Cepat
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Link
                  to="/admin/products"
                  className="rounded border border-dashed border-[var(--coffee)] p-4 text-sm font-semibold text-[var(--coffee)] transition hover:bg-[var(--coffee)] hover:text-white"
                >
                  Tambah Produk
                </Link>
                <Link
                  to="/admin/services"
                  className="rounded border border-dashed border-[var(--coffee)] p-4 text-sm font-semibold text-[var(--coffee)] transition hover:bg-[var(--coffee)] hover:text-white"
                >
                  Atur Layanan
                </Link>
                <Link
                  to="/admin/settings"
                  className="rounded border border-dashed border-[var(--coffee)] p-4 text-sm font-semibold text-[var(--coffee)] transition hover:bg-[var(--coffee)] hover:text-white"
                >
                  Pengaturan Toko
                </Link>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-[var(--coffee)]">
                Top Produk Bulan Ini
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-600">
                {overview.topProducts?.length ? (
                  overview.topProducts.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center justify-between rounded border border-slate-100 px-3 py-2"
                    >
                      <span className="font-medium text-slate-700">
                        {item.name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {item.qty} pcs
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-400">
                    Belum ada data penjualan produk.
                  </li>
                )}
              </ul>
            </div>
          </section>
        </>
      )}
    </AdminLayout>
  );
}



