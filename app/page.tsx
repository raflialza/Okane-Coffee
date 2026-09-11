"use client";
import { useState, useEffect } from "react";
import { Product, CartItem, Order } from "../types";

// Contoh data menu statis (bisa ditambah sesuai menu kedai)
const MENU: Product[] = [
  { id: "1", name: "Kopi Susu Gula Aren", price: 18000 },
  { id: "2", name: "Americano", price: 15000 },
  { id: "3", name: "Cafe Latte", price: 20000 },
];

export default function CashierSystem() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);

  // Mengambil history dari localStorage saat web pertama dibuka
  useEffect(() => {
    const savedHistory = localStorage.getItem("shiftHistory");
    if (savedHistory) {
      setOrderHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Logika menambahkan item ke keranjang
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  // Menghitung subtotal keranjang saat ini
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Menghitung total penjualan hari ini (Shift 16:00 - 00:00)
  const todayTotalSales = orderHistory.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  // Logika Checkout
  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Karena payment via barcode terpisah, kasir cukup memverifikasi
    // pembayaran, lalu menekan tombol ini untuk mencatat pesanan.
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      timestamp: new Date().toLocaleString("id-ID"),
      items: cart,
      total: cartTotal,
    };

    const updatedHistory = [...orderHistory, newOrder];
    setOrderHistory(updatedHistory);

    // Simpan ke localStorage agar history aman
    localStorage.setItem("shiftHistory", JSON.stringify(updatedHistory));

    // Kosongkan keranjang untuk pelanggan berikutnya
    setCart([]);
  };

  const handleResetShift = () => {
    if (
      confirm(
        "Apakah Anda yakin ingin menutup shift dan mereset data hari ini?",
      )
    ) {
      setOrderHistory([]);
      localStorage.removeItem("shiftHistory");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      {/* KIRI: Area Menu */}
      <div className="w-2/3 p-6 border-r">
        <h1 className="text-2xl font-bold mb-6">Menu Kedai Kopi</h1>
        <div className="grid grid-cols-3 gap-4">
          {MENU.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="p-4 bg-white shadow rounded-lg hover:bg-blue-50 text-left transition"
            >
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-gray-500">
                Rp {product.price.toLocaleString("id-ID")}
              </p>
            </button>
          ))}
        </div>

        {/* BAWAH: Area History & Laporan Penjualan */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">
            Laporan Shift (16:00 - 00:00)
          </h2>
          <div className="p-4 bg-blue-100 rounded-lg flex justify-between items-center mb-6">
            <span className="font-bold">Total Penjualan Hari Ini:</span>
            <span className="text-2xl font-black">
              Rp {todayTotalSales.toLocaleString("id-ID")}
            </span>
          </div>

          <h3 className="font-bold mb-2">Riwayat Transaksi:</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {orderHistory.map((order) => (
              <div
                key={order.id}
                className="p-3 bg-white border rounded shadow-sm"
              >
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>{order.id}</span>
                  <span>{order.timestamp}</span>
                </div>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>
                      {item.qty}x {item.name}
                    </span>
                    <span>
                      Rp {(item.price * item.qty).toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
                <div className="text-right font-bold mt-2 pt-2 border-t">
                  Total: Rp {order.total.toLocaleString("id-ID")}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleResetShift}
            className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
          >
            Tutup Shift (Reset Data)
          </button>
        </div>
      </div>

      {/* KANAN: Area Keranjang */}
      <div className="w-1/3 p-6 bg-white flex flex-col">
        <h2 className="text-xl font-bold mb-6">Keranjang Pesanan</h2>
        <div className="flex-1 overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">Belum ada pesanan</p>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between mb-4 items-center">
                <div>
                  <h3 className="font-semibold">{item.name}</h3>
                  <p className="text-sm text-gray-500">
                    {item.qty} x Rp {item.price.toLocaleString("id-ID")}
                  </p>
                </div>
                <div className="font-bold">
                  Rp {(item.price * item.qty).toLocaleString("id-ID")}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-xl font-bold mb-6">
            <span>Total Tagihan:</span>
            <span>Rp {cartTotal.toLocaleString("id-ID")}</span>
          </div>
          <div className="bg-gray-100 p-3 rounded mb-4 text-sm text-center text-gray-600">
            Arahkan pelanggan scan barcode QRIS di meja kasir.
          </div>
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            Selesaikan Pembayaran
          </button>
        </div>
      </div>
    </div>
  );
}
