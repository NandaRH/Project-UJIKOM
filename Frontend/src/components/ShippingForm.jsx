import { useState } from "react";

export default function ShippingForm({ shipping, setShipping }) {
  const [address, setAddress] = useState(shipping.address);
  const [method, setMethod] = useState(shipping.method);

  const handleUpdate = () => {
    const cost = method === "cargo" ? 25000 : 12000;
    setShipping({ ...shipping, address, method, cost });
  };

  return (
    <div className="mt-5 p-4 border rounded-md bg-[#fff8f0]">
      <h3 className="font-semibold mb-2">Alamat Pengiriman</h3>
      <textarea
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        className="w-full rounded border p-2 text-sm"
        placeholder="Masukkan alamat lengkap..."
      />

      <h3 className="font-semibold mt-4 mb-2">Metode Pengiriman</h3>
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="regular"
            checked={method === "regular"}
            onChange={() => setMethod("regular")}
          />
          <span>JNE Regular (Rp 12.000)</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            value="cargo"
            checked={method === "cargo"}
            onChange={() => setMethod("cargo")}
          />
          <span>JNE Cargo (Rp 25.000)</span>
        </label>
      </div>

      <div className="mt-3">
        <button
          onClick={handleUpdate}
          className="rounded bg-[var(--coffee)] text-white px-4 py-2"
        >
          Simpan Pengiriman
        </button>
      </div>
    </div>
  );
}
