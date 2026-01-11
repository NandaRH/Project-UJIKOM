import Cart from "../models/Cart.js";

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.json({ items: [], totalAmount: 0 });
    res.json(cart);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal mengambil keranjang", error: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { itemId, name, price, qty, type } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: "itemId wajib diisi" });
    }

    const parsedPrice = Number(price);
    const parsedQty = Number(qty);

    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ message: "Harga produk tidak valid" });
    }

    if (!Number.isFinite(parsedQty) || parsedQty <= 0) {
      return res.status(400).json({ message: "Qty produk tidak valid" });
    }

    const normalizedQty = Math.ceil(parsedQty);

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [], totalAmount: 0 });
    }

    const existing = cart.items.find(
      (i) => i.itemId.toString() === String(itemId)
    );
    if (existing) {
      existing.qty = Number(existing.qty || 0) + normalizedQty;
      existing.price = parsedPrice;
      existing.name = name ?? existing.name;
      existing.type = type === "service" ? "service" : "product";
    } else {
      cart.items.push({
        itemId,
        name,
        price: parsedPrice,
        qty: normalizedQty,
        type: type === "service" ? "service" : "product",
      });
    }

    cart.totalAmount = cart.items.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0),
      0
    );
    cart.updatedAt = new Date();
    await cart.save();

    res.json({ message: "Produk ditambahkan ke keranjang", cart });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menambah item", error: err.message });
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart)
      return res.status(404).json({ message: "Keranjang tidak ditemukan" });

    cart.items = cart.items.filter(
      (i) => i.itemId.toString() !== String(itemId)
    );
    cart.totalAmount = cart.items.reduce(
      (sum, i) => sum + Number(i.price || 0) * Number(i.qty || 0),
      0
    );

    cart.updatedAt = new Date();
    await cart.save();
    res.json({ message: "Item dihapus dari keranjang", cart });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Gagal menghapus item", error: err.message });
  }
};

