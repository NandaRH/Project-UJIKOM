import { useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { toast } from "react-hot-toast";
import AdminLayout from "../../layouts/AdminLayout";
import api from "../../services/api";
import {
  convertCoordsPayload,
  parseCoordinateInput,
} from "../../utils/coordinates";

const schema = yup.object({
  storeProfile: yup.object({
    name: yup.string().required("Nama toko wajib diisi"),
    address: yup.string().nullable(),
    phone: yup.string().nullable(),
    email: yup.string().nullable(),
  }),
  payments: yup.object({
    bank: yup
      .array()
      .of(
        yup.object({
          bankName: yup.string().nullable(),
          accountName: yup.string().nullable(),
          accountNumber: yup.string().nullable(),
        })
      )
      .default([]),
    qris: yup.object({
      label: yup.string().nullable(),
      instructions: yup.string().nullable(),
    }),
  }),
  shipping: yup.object({
    originAddress: yup.string().nullable(),
    originCoords: yup.object({
      lat: yup
        .string()
        .nullable()
        .test(
          "lat-parse",
          "Latitude harus berupa angka desimal atau format DMS yang valid",
          (value, ctx) => {
            if (!value) return true;
            const parsed = parseCoordinateInput(value);
            if (parsed === null) return ctx.createError();
            if (parsed < -90 || parsed > 90) {
              return ctx.createError({
                message: "Latitude harus berada di antara -90 dan 90",
              });
            }
            return true;
          }
        ),
      lng: yup
        .string()
        .nullable()
        .test(
          "lng-parse",
          "Longitude harus berupa angka desimal atau format DMS yang valid",
          (value, ctx) => {
            if (!value) return true;
            const parsed = parseCoordinateInput(value);
            if (parsed === null) return ctx.createError();
            if (parsed < -180 || parsed > 180) {
              return ctx.createError({
                message: "Longitude harus berada di antara -180 dan 180",
              });
            }
            return true;
          }
        ),
    }),
    useJNECargo: yup.boolean().default(false),
    weightRules: yup.object({
      cargoMinKg: yup
        .number()
        .typeError("Minimal kg harus angka")
        .nullable()
        .min(0),
      cargoDefault: yup
        .number()
        .typeError("Default kg harus angka")
        .nullable()
        .min(0),
    }),
  }),
});

const defaultValues = {
  storeProfile: {
    name: "",
    address: "",
    phone: "",
    email: "",
  },
  payments: {
    bank: [],
    qris: {
      label: "",
      instructions: "",
    },
  },
  shipping: {
    originAddress: "",
    originCoords: {
      lat: "",
      lng: "",
    },
    useJNECargo: false,
    weightRules: {
      cargoMinKg: "",
      cargoDefault: "",
    },
  },
};

const tabs = [
  { key: "store", label: "Store" },
  { key: "payments", label: "Payments" },
  { key: "shipping", label: "Shipping" },
];

export default function SettingsAdmin() {
  const [activeTab, setActiveTab] = useState("store");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [envFlags, setEnvFlags] = useState({});

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    fields: bankFields,
    append: appendBank,
    remove: removeBank,
  } = useFieldArray({
    control,
    name: "payments.bank",
  });

  const watchedLat = watch("shipping.originCoords.lat");
  const watchedLng = watch("shipping.originCoords.lng");

  const parsedOriginLat = useMemo(
    () => parseCoordinateInput(watchedLat),
    [watchedLat]
  );
  const parsedOriginLng = useMemo(
    () => parseCoordinateInput(watchedLng),
    [watchedLng]
  );

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/admin/settings");
        if (data.settings) {
          reset({
            storeProfile: {
              name: data.settings.storeProfile?.name || "",
              address: data.settings.storeProfile?.address || "",
              phone: data.settings.storeProfile?.phone || "",
              email: data.settings.storeProfile?.email || "",
            },
            payments: {
              bank: data.settings.payments?.bank?.length
                ? data.settings.payments.bank
                : [],
              qris: {
                label: data.settings.payments?.qris?.label || "",
                instructions: data.settings.payments?.qris?.instructions || "",
              },
            },
            shipping: {
              originAddress: data.settings.shipping?.originAddress || "",
              originCoords: {
                lat:
                  data.settings.shipping?.originCoords?.lat !== undefined &&
                  data.settings.shipping.originCoords.lat !== null
                    ? String(data.settings.shipping.originCoords.lat)
                    : "",
                lng:
                  data.settings.shipping?.originCoords?.lng !== undefined &&
                  data.settings.shipping.originCoords.lng !== null
                    ? String(data.settings.shipping.originCoords.lng)
                    : "",
              },
              useJNECargo: Boolean(data.settings.shipping?.useJNECargo),
              weightRules: {
                cargoMinKg:
                  data.settings.shipping?.weightRules?.cargoMinKg ?? "",
                cargoDefault:
                  data.settings.shipping?.weightRules?.cargoDefault ?? "",
              },
            },
          });
        }
        setEnvFlags(data.envFlags || {});
      } catch (error) {
        toast.error(error?.response?.data?.message || "Gagal memuat pengaturan.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        ...values,
        shipping: {
          ...values.shipping,
          originCoords: convertCoordsPayload(values.shipping.originCoords),
        },
      };

      await api.put("/admin/settings", payload);
      toast.success("Pengaturan berhasil disimpan.");
      reset({
        ...payload,
        shipping: {
          ...payload.shipping,
          originCoords: {
            lat:
              payload.shipping.originCoords.lat !== null &&
              payload.shipping.originCoords.lat !== undefined
                ? String(payload.shipping.originCoords.lat)
                : values.shipping.originCoords.lat,
            lng:
              payload.shipping.originCoords.lng !== null &&
              payload.shipping.originCoords.lng !== undefined
                ? String(payload.shipping.originCoords.lng)
                : values.shipping.originCoords.lng,
          },
        },
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Gagal menyimpan pengaturan.");
    } finally {
      setSaving(false);
    }
  };

  const renderStoreTab = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label className="text-xs font-semibold text-slate-500">Nama Toko</label>
        <input
          type="text"
          {...register("storeProfile.name")}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          placeholder="1612 Coffee Roastery"
        />
        {errors.storeProfile?.name && (
          <p className="mt-1 text-xs text-red-500">
            {errors.storeProfile.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500">Email</label>
        <input
          type="email"
          {...register("storeProfile.email")}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500">Telepon</label>
        <input
          type="text"
          {...register("storeProfile.phone")}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="md:col-span-2">
        <label className="text-xs font-semibold text-slate-500">Alamat</label>
        <textarea
          rows={3}
          {...register("storeProfile.address")}
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-5">
      <section className="rounded border border-slate-200 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-[var(--coffee)]">
            Rekening Bank
          </h4>
          <button
            type="button"
            onClick={() =>
              appendBank({ bankName: "", accountName: "", accountNumber: "" })
            }
            className="rounded border border-[var(--coffee)] px-3 py-1 text-xs font-semibold text-[var(--coffee)] hover:bg-[var(--coffee)] hover:text-white"
          >
            Tambah Bank
          </button>
        </div>

        <div className="mt-3 space-y-4">
          {bankFields.length === 0 && (
            <p className="text-xs text-slate-400">
              Belum ada rekening bank, tambahkan jika diperlukan.
            </p>
          )}

          {bankFields.map((field, index) => (
            <div
              key={field.id}
              className="grid gap-3 rounded border border-slate-200 p-3 md:grid-cols-3"
            >
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Bank
                </label>
                <input
                  type="text"
                  {...register(`payments.bank.${index}.bankName`)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="BCA"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Atas Nama
                </label>
                <input
                  type="text"
                  {...register(`payments.bank.${index}.accountName`)}
                  className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                  placeholder="PT 1612 Coffee"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500">
                  Nomor Rekening
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    {...register(`payments.bank.${index}.accountNumber`)}
                    className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
                    placeholder="1234567890"
                  />
                  <button
                    type="button"
                    onClick={() => removeBank(index)}
                    className="mt-1 rounded border border-red-200 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-[var(--coffee)]">QRIS</h4>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs font-semibold text-slate-500">Label</label>
            <input
              type="text"
              {...register("payments.qris.label")}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="QRIS 1612 Coffee"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">
              Instruksi
            </label>
            <textarea
              rows={3}
              {...register("payments.qris.instructions")}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Tunjukkan bukti pembayaran ke admin..."
            />
          </div>
        </div>
      </section>
    </div>
  );

  const renderShippingTab = () => (
    <div className="space-y-5">
      <section className="rounded border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-[var(--coffee)]">
          Titik Asal Pengiriman
        </h4>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-slate-500">
              Alamat Asal
            </label>
            <textarea
              rows={3}
              {...register("shipping.originAddress")}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder="Alamat lengkap roastery"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Latitude
            </label>
            <input
              type="text"
              {...register("shipping.originCoords.lat")}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder={'Contoh: -6.96694 atau 6°58\'0.97" S'}
              />
            {parsedOriginLat !== null && (
              <p className="mt-1 text-xs text-slate-500">
                Decimal: {parsedOriginLat.toFixed(6)}
              </p>
            )}
            {errors.shipping?.originCoords?.lat && (
              <p className="mt-1 text-xs text-red-500">
                {errors.shipping.originCoords.lat.message}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Longitude
            </label>
            <input
              type="text"
              {...register("shipping.originCoords.lng")}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
              placeholder={'Contoh: 107.57834 atau 107°34\'42.02" E'}
            />
            {parsedOriginLng !== null && (
              <p className="mt-1 text-xs text-slate-500">
                Decimal: {parsedOriginLng.toFixed(6)}
              </p>
            )}
            {errors.shipping?.originCoords?.lng && (
              <p className="mt-1 text-xs text-red-500">
                {errors.shipping.originCoords.lng.message}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-[var(--coffee)]">
          Pengaturan Cargo
        </h4>
        <div className="mt-3 grid gap-4 md:grid-cols-3 md:items-center">
          <div className="md:col-span-3 flex items-center gap-2">
            <input
              type="checkbox"
              {...register("shipping.useJNECargo")}
              id="useJNECargo"
              className="accent-[var(--coffee)]"
            />
            <label htmlFor="useJNECargo" className="text-sm text-slate-600">
              Aktifkan JNE Cargo
            </label>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Minimal kg
            </label>
            <input
              type="number"
              step="0.1"
              {...register("shipping.weightRules.cargoMinKg")}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">
              Default kg
            </label>
            <input
              type="number"
              step="0.1"
              {...register("shipping.weightRules.cargoDefault")}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </section>

      <section className="rounded border border-slate-200 p-4">
        <h4 className="text-sm font-semibold text-[var(--coffee)]">Env Flags</h4>
        <div className="mt-2 grid gap-2 text-xs text-slate-600">
          <div className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
            <span>LOCATIONIQ key tersedia</span>
            <span className={envFlags.hasLocationIqKey ? "text-green-600" : "text-red-500"}>
              {envFlags.hasLocationIqKey ? "YA" : "TIDAK"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
            <span>JWT secret tersedia</span>
            <span className={envFlags.hasJwtSecret ? "text-green-600" : "text-red-500"}>
              {envFlags.hasJwtSecret ? "YA" : "TIDAK"}
            </span>
          </div>
          <div className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
            <span>Mongo URI tersedia</span>
            <span className={envFlags.hasMongoUri ? "text-green-600" : "text-red-500"}>
              {envFlags.hasMongoUri ? "YA" : "TIDAK"}
            </span>
          </div>
        </div>
      </section>
    </div>
  );

  return (
    <AdminLayout
      title="Settings"
      actions={
        <button
          type="submit"
          form="settings-form"
          disabled={saving || !isDirty}
          className="rounded bg-[var(--coffee)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5c3217] disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {saving ? "Menyimpan..." : "Simpan"}
        </button>
      }
    >
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-2 border-b border-slate-200 px-5 py-4">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded px-3 py-2 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? "bg-[var(--coffee)] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form
          id="settings-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6 px-5 py-6"
        >
          {loading ? (
            <div className="text-sm text-slate-500">Memuat pengaturan...</div>
          ) : (
            <>
              {activeTab === "store" && renderStoreTab()}
              {activeTab === "payments" && renderPaymentsTab()}
              {activeTab === "shipping" && renderShippingTab()}
            </>
          )}
        </form>
      </div>
    </AdminLayout>
  );
}
