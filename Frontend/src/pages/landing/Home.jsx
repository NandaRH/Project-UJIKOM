import { motion } from "framer-motion";
import LandingLayout from "../../layouts/LandingLayout";
import { FaInstagram, FaLeaf, FaMugHot, FaTiktok } from "react-icons/fa";
import { TbCoffee, TbTruckDelivery } from "react-icons/tb";
import { BiSliderAlt } from "react-icons/bi";

import hero from "../../assets/images/hero-bg.webp";
import ProductList from "../../components/ProductList";
import robustaImg from "../../assets/images/robusta.webp";
import naturalImg from "../../assets/images/arabika-natural.webp";
import fullwashImg from "../../assets/images/arabika-fullwash.webp";
import honeyImg from "../../assets/images/arabika-honey.webp";
import eksperImg from "../../assets/images/arabika-eksperimental.webp";

const features = [
  {
    icon: TbCoffee,
    title: "Seleksi Green Beans",
    description:
      "Kami kurasi biji kopi terbaik langsung dari petani untuk menjaga kualitas rasa.",
  },
  {
    icon: FaMugHot,
    title: "Profil Sangrai Presisi",
    description:
      "Profil lite, medium, hingga dark sangrai untuk menonjolkan karakter setiap origin.",
  },
  {
    icon: FaLeaf,
    title: "Transparansi Asal",
    description:
      "Informasi varietas, proses pascapanen, dan elevasi jelas pada setiap batch.",
  },
  {
    icon: TbTruckDelivery,
    title: "Pengiriman Terjadwal",
    description:
      "Batch roasting terencana, siap kirim cepat ke kedai atau home brewer Anda.",
  },
];

const processSteps = [
  {
    title: "Konsultasi Rasa",
    description:
      "Diskusikan kebutuhan roastery Anda bersama roaster kami sesuai menu yang ingin ditonjolkan.",
  },
  {
    title: "Roasting & Cupping",
    description:
      "Kami roasting sesuai profil pilihan, lengkap dengan cupping sheet dan catatan flavor.",
  },
  {
    title: "Delivery & Support",
    description:
      "Pengiriman tepat waktu dengan panduan brew yang memudahkan tim barista Anda.",
  },
];

const stats = [
  { value: "10+", label: "Varian origin Nusantara" },
  { value: "4.9/5", label: "Rata-rata penilaian pelanggan" },
  { value: "1kg", label: "Minimum order roasting" },
];

const fallbackProducts = [
  {
    slug: "robusta-classic",
    name: "Robusta Classic",
    beanType: "robusta",
    process: "natural",
    price: 65000,
    image: robustaImg,
  },
  {
    slug: "arabika-natural",
    name: "Arabika Natural",
    beanType: "arabika",
    process: "natural",
    price: 90000,
    image: naturalImg,
  },
  {
    slug: "arabika-fullwash",
    name: "Arabika Fullwash",
    beanType: "arabika",
    process: "fullwash",
    price: 95000,
    image: fullwashImg,
  },
  {
    slug: "arabika-honey",
    name: "Arabika Honey",
    beanType: "arabika",
    process: "honey",
    price: 97000,
    image: honeyImg,
  },
  {
    slug: "arabika-eksperimental",
    name: "Arabika Eksperimental",
    beanType: "arabika",
    process: "eksperimental",
    price: 120000,
    image: eksperImg,
  },
];

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function Home() {
  return (
    <LandingLayout>
      <section
        className="relative flex min-h-[75vh] items-center overflow-hidden bg-cover bg-center py-32"
        style={{ backgroundImage: `url(${hero})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/30" />
        <motion.div
          className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6 text-center text-white"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm uppercase tracking-widest">
            <BiSliderAlt className="text-lg" />
            Roastery & Specialty Coffee
          </span>
          <h1
            className="mb-4 text-4xl font-extrabold sm:text-5xl lg:text-6xl"
            style={{ fontFamily: "var(--font-aesthetic)" }}
          >
            1612 Coffee
          </h1>
          <p className="max-w-2xl text-lg text-white/85">
            Jasa roasting kopi dan produk siap seduh dengan profil rasa yang
            konsisten. Dari biji pilihan langsung ke cangkir pelanggan Anda.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              className="rounded-full bg-[var(--coffee)] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#5c3217]"
              href="/login"
            >
              Mulai Konsultasi
            </a>
            <a
              className="rounded-full border border-white/60 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white hover:text-[var(--coffee)]"
              href="#products"
            >
              Jelajahi Produk
            </a>
          </div>
        </motion.div>
        <div className="pointer-events-none absolute -bottom-12 left-1/2 hidden w-[120%] max-w-5xl -translate-x-1/2 rounded-3xl bg-white/90 p-6 backdrop-blur sm:block">
          <div className="grid gap-6 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center text-center text-[var(--coffee)]"
              >
                <span className="text-3xl font-extrabold lg:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-2 text-sm font-medium text-slate-600">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-16 w-full px-6 sm:hidden">
          <div className="grid gap-4 rounded-3xl bg-white/90 p-6 text-[var(--coffee)] shadow">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="text-2xl font-extrabold">{stat.value}</span>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="about"
        className="border-t bg-[#fff8ef] pb-20 pt-24 sm:pt-36"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-6 lg:flex-row lg:items-start">
          <motion.div
            className="relative flex-1 overflow-hidden rounded-3xl shadow-xl"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <img
              src={naturalImg}
              alt="Roasting coffee beans"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--coffee)] shadow">
              Roastery in Action
            </div>
          </motion.div>
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeIn}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h2
              className="text-3xl font-bold text-[var(--coffee)] sm:text-4xl"
              style={{ fontFamily: "var(--font-aesthetic)" }}
            >
              Tentang 1612 Coffee
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Kami berdiri sebagai partner roasting yang menghadirkan rasa
              otentik Nusantara. Setiap batch kami proses dengan pendekatan
              artisan agar profil rasa tetap konsisten sekaligus mudah
              direplikasi oleh tim barista Anda.
            </p>
            <div className="mt-6 grid gap-4 text-left sm:grid-cols-2">
              {features.slice(0, 2).map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-[#f1d7bd] bg-white p-5 shadow-sm"
                >
                  <feature.icon className="mb-3 text-2xl text-[var(--coffee)]" />
                  <h3 className="text-lg font-semibold text-[var(--coffee)]">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section id="services" className="border-t bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[var(--coffee)] sm:text-4xl">
              Layanan Roastery
            </h2>
            <p className="mt-4 text-slate-600">
              Profil roasting: lite, medium, dark dengan harga mulai Rp
              35.000/kg (minimum 1 kg per batch).
            </p>
          </motion.div>
          <motion.div
            className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex h-full flex-col rounded-3xl border border-[#f2e2cf] bg-[#fff8ef] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <feature.icon className="text-3xl text-[var(--coffee)]" />
                <h3 className="mt-4 text-lg font-semibold text-[var(--coffee)]">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="process" className="border-t bg-[#fff5e9] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[var(--coffee)] sm:text-4xl">
              Alur Kerja Bersama Kami
            </h2>
            <p className="mt-4 text-slate-600">
              Tiga langkah mudah untuk menghadirkan kopi dengan cita rasa
              istimewa di kedai Anda.
            </p>
          </motion.div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.title}
                className="relative rounded-3xl border border-[#f2d9bd] bg-white p-6 text-center shadow-sm"
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.3 }}
                variants={fadeIn}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--coffee)] text-lg font-bold text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--coffee)]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-slate-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section id="products" className="border-t bg-white py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.div
            className="text-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeIn}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-[var(--coffee)] sm:text-4xl">
              Produk Single Origin
            </h2>
            <p className="mt-4 text-slate-600">
              Pilih varian arabika dan robusta premium dengan karakter proses
              natural, honey, hingga full wash.
            </p>
          </motion.div>
          <ProductList
            className="mt-10"
            fallbackItems={fallbackProducts}
            limit={5}
          />
        </div>
      </section>

      <section id="cta" className="border-t bg-[#2f1607] py-20 text-white">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-6 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Siap meluncurkan racikan kopi terbaik Anda?
          </h2>
          <p className="max-w-2xl text-white/80">
            Jadwalkan sesi konsultasi dengan roaster kami dan dapatkan
            rekomendasi profil sangrai yang paling sesuai untuk kedai atau brand
            Anda.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-wide text-[var(--coffee)] transition hover:bg-[#f5e4d3]"
              href="/register"
            >
              Daftar Sekarang
            </a>
            <a
              className="rounded-full border border-white/70 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-white/10"
              href="#social"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>

      <section id="social" className="border-t bg-[#fff5e9] py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h3 className="text-2xl font-bold text-[var(--coffee)]">
            Temukan cerita kami di media sosial
          </h3>
          <p className="mt-3 text-slate-600">
            Update roasting terbaru, jadwal cupping, hingga promo kejutan ada di
            sini.
          </p>
          <div className="mt-6 flex justify-center gap-6 text-3xl text-[var(--coffee)]">
            <a
              href="https://www.instagram.com/1612.coffee/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform duration-200 hover:scale-110 hover:text-[#8B4513]"
            >
              <FaInstagram />
            </a>
            <a
              href="https://www.tiktok.com/@1612.coffee"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform duration-200 hover:scale-110 hover:text-[#8B4513]"
            >
              <FaTiktok />
            </a>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
}
