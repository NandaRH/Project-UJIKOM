export default function ShippingSummary({ jasaTotal, produkTotal, shipping, total, clear }) {
  return (
    <section className="rounded-lg border bg-white p-5">
      <h2 className="text-xl font-semibold mb-3">Ringkasan Pembelian</h2>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal Jasa</span>
          <span>Rp {jasaTotal.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Subtotal Produk</span>
          <span>Rp {produkTotal.toLocaleString("id-ID")}</span>
        </div>
        <div className="flex justify-between">
          <span>Ongkir ({shipping.method.toUpperCase()})</span>
          <span>Rp {shipping.cost.toLocaleString("id-ID")}</span>
        </div>
      </div>

      <hr className="my-3" />

      <div className="flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span>Rp {total.toLocaleString("id-ID")}</span>
      </div>

      <div className="flex justify-end mt-5 gap-3">
        <button
          onClick={clear}
          className="rounded border border-red-400 text-red-500 px-4 py-2 hover:bg-red-50"
        >
          Kosongkan
        </button>
        <button className="rounded bg-[var(--coffee)] text-white px-5 py-2 hover:bg-[#5c3217] transition">
          Checkout Sekarang
        </button>
      </div>
    </section>
  );
}
