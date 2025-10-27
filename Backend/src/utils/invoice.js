import PDFDocument from "pdfkit";

const formatCurrency = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value || 0);

export const streamInvoice = (res, order, settings = {}) => {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `invoice-${order.orderId || order._id}.pdf`;

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

  doc.on("error", (err) => {
    console.error("Invoice generation error:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Gagal membuat invoice" }));
    } else {
      res.end();
    }
  });

  doc.pipe(res);

  const storeProfile = settings.storeProfile || {};

  doc.fontSize(20).text(storeProfile.name || "1612 Coffee Roastery", {
    align: "left",
  });
  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .text(storeProfile.address || "Alamat belum diatur", { align: "left" });
  if (storeProfile.phone) doc.text(`Telp: ${storeProfile.phone}`);
  if (storeProfile.email) doc.text(`Email: ${storeProfile.email}`);

  doc.moveDown(1);
  doc
    .fontSize(16)
    .text(`Invoice #${order.orderId || order._id}`, { align: "left" });
  doc.moveDown(0.5);
  doc.fontSize(10).text(`Tanggal: ${new Date(order.createdAt).toLocaleString("id-ID")}`);
  doc.text(`Status: ${(order.status || "").toUpperCase()}`);

  doc.moveDown(1);
  doc.fontSize(12).text("Data Pelanggan", { underline: true });
  doc.fontSize(10);
  doc.text(`Nama: ${order.customerName || "-"}`);
  doc.text(`Alamat: ${order.address || "-"}`);

  doc.moveDown(1);
  doc.fontSize(12).text("Item Pesanan", { underline: true });
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const itemCols = [
    { label: "Nama", width: 240 },
    { label: "Qty", width: 60, align: "center" },
    { label: "Harga", width: 120, align: "right" },
    { label: "Subtotal", width: 120, align: "right" },
  ];

  doc.fontSize(10).fillColor("#333333");
  let x = doc.x;
  itemCols.forEach((col) => {
    doc.text(col.label, x, tableTop, { width: col.width, align: col.align || "left" });
    x += col.width;
  });

  doc.moveDown(0.5);
  doc.strokeColor("#cccccc").lineWidth(1).moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke();
  doc.moveDown(0.5);

  let totalQty = 0;
  let subtotal = 0;
  (order.items || []).forEach((item) => {
    const lineY = doc.y;
    const qty = item.qty || 0;
    const price = item.price || 0;
    const lineTotal = qty * price;
    totalQty += qty;
    subtotal += lineTotal;

    let columnX = doc.x;
    doc.text(item.name || "-", columnX, lineY, { width: itemCols[0].width });
    columnX += itemCols[0].width;

    doc.text(String(qty), columnX, lineY, {
      width: itemCols[1].width,
      align: "center",
    });
    columnX += itemCols[1].width;

    doc.text(formatCurrency(price), columnX, lineY, {
      width: itemCols[2].width,
      align: "right",
    });
    columnX += itemCols[2].width;

    doc.text(formatCurrency(lineTotal), columnX, lineY, {
      width: itemCols[3].width,
      align: "right",
    });

    doc.moveDown(0.5);
  });

  doc.moveDown(1);
  doc.fontSize(12).text("Ringkasan", { underline: true });
  doc.fontSize(10);
  doc.text(`Total Item: ${totalQty}`);
  doc.text(`Subtotal: ${formatCurrency(subtotal)}`);

  if (order.shipping?.totalCost) {
    doc.text(`Ongkir: ${formatCurrency(order.shipping.totalCost)}`);
  }

  doc.fontSize(12).moveDown(0.5).text(`Total: ${formatCurrency(order.total)}`);

  doc.end();
};

