"use client";
import { useState, useEffect } from "react";
import { Product, CartItem, Order } from "../types";

const MENU: Product[] = [
  { id: "1", name: "Kopi Susu Gula Aren", price: 18000 },
  { id: "2", name: "Americano", price: 15000 },
  { id: "3", name: "Cafe Latte", price: 20000 },
  { id: "4", name: "Matcha Latte", price: 22000 },
  { id: "5", name: "Caramel Macchiato", price: 24000 },
];

export default function CashierSystem() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // State for filtering history by date
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const savedHistory = localStorage.getItem("orderHistory");
    if (savedHistory) {
      setOrderHistory(JSON.parse(savedHistory));
    } else {
      // Migrate from old storage if exists
      const oldHistory = localStorage.getItem("shiftHistory");
      if (oldHistory) {
        const parsed = JSON.parse(oldHistory);
        const migrated = parsed.map((o: Order & { date?: string }) => ({
          ...o,
          // Infer date from ID or just set today
          date: o.date || new Date().toISOString().split("T")[0],
        }));
        setOrderHistory(migrated);
        localStorage.setItem("orderHistory", JSON.stringify(migrated));
      }
    }

    // Set default selected date to today
    const today = new Date().toISOString().split("T")[0];
    setSelectedDate(today);
  }, []);

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

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === productId) {
          const newQty = item.qty + delta;
          return newQty > 0 ? { ...item, qty: newQty } : item;
        }
        return item;
      });
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const now = new Date();
    const newOrder: Order = {
      // eslint-disable-next-line react-hooks/purity
      id: `ORD-${Date.now()}`,
      timestamp: now.toLocaleString("en-US"),
      date: now.toISOString().split("T")[0], // Store YYYY-MM-DD
      items: cart,
      total: cartTotal,
    };
    const updatedHistory = [...orderHistory, newOrder];
    setOrderHistory(updatedHistory);
    localStorage.setItem("orderHistory", JSON.stringify(updatedHistory));
    setCart([]);
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all order history?")) {
      setOrderHistory([]);
      localStorage.removeItem("orderHistory");
      localStorage.removeItem("shiftHistory");
    }
  };

  // Filter history based on selected date
  const filteredHistory = orderHistory.filter(
    (order) => order.date === selectedDate,
  );
  const dailyTotalSales = filteredHistory.reduce(
    (sum, order) => sum + order.total,
    0,
  );

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-800">
        Loading POS data...
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 text-gray-800">
      {/* LEFT: Menu & History Area */}
      <div className="w-full lg:w-2/3 p-4 md:p-6 lg:border-r">
        <h1 className="text-2xl font-bold mb-6 text-center lg:text-left">
          OKANE COFFEE
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {MENU.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="p-4 bg-white shadow rounded-lg hover:bg-blue-50 text-left transition flex flex-col justify-between min-h-[100px]"
            >
              <h2 className="font-semibold">{product.name}</h2>
              <p className="text-gray-500 mt-2">
                Rp {product.price.toLocaleString("en-US")}
              </p>
            </button>
          ))}
        </div>

        {/* BOTTOM: History Area */}
        <div className="mt-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <h2 className="text-xl font-bold">Order History & Revenue</h2>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded p-2 text-sm w-full sm:w-auto"
            />
          </div>

          <div className="p-4 bg-blue-100 rounded-lg flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
            <span className="font-bold">Daily Revenue:</span>
            <span className="text-2xl font-black text-green-700">
              Rp {dailyTotalSales.toLocaleString("en-US")}
            </span>
          </div>

          <h3 className="font-bold mb-2">Transactions for {selectedDate}:</h3>
          {filteredHistory.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No transactions found for {selectedDate}. Revenue is zero.
            </p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {filteredHistory.map((order) => (
                <div
                  key={order.id}
                  className="p-3 bg-white border rounded shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500 mb-2">
                    <span className="font-medium text-black">{order.id}</span>
                    <span>{order.timestamp}</span>
                  </div>
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>
                        {item.qty}x {item.name}
                      </span>
                      <span>
                        Rp {(item.price * item.qty).toLocaleString("en-US")}
                      </span>
                    </div>
                  ))}
                  <div className="text-right font-bold mt-2 pt-2 border-t">
                    Total: Rp {order.total.toLocaleString("en-US")}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleClearHistory}
              className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 w-full sm:w-auto"
            >
              Clear All History
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT: Cart Area */}
      <div className="w-full lg:w-1/3 p-4 md:p-6 bg-white flex flex-col lg:h-screen lg:sticky lg:top-0 border-t lg:border-t-0 shadow-lg lg:shadow-none">
        <h2 className="text-2xl font-bold mb-6 text-center lg:text-left">
          Current Order
        </h2>
        <div className="flex-1 overflow-y-auto min-h-[250px] max-h-[40vh] lg:max-h-none">
          {cart.length === 0 ? (
            <p className="text-gray-400 text-center mt-10">Cart is empty</p>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="flex flex-col mb-4 bg-white p-3 rounded shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{item.name}</h3>
                  <div className="font-bold">
                    Rp {(item.price * item.qty).toLocaleString("en-US")}
                  </div>
                </div>
                <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center text-sm text-gray-500 gap-2">
                  <p>Rp {item.price.toLocaleString("en-US")} / item</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 lg:w-6 lg:h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-700 transition"
                    >
                      -
                    </button>
                    <span className="w-4 text-center font-medium text-black">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 lg:w-6 lg:h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-700 transition"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="ml-2 text-red-500 hover:text-red-700 font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-4 border-t bg-white">
          <div className="flex justify-between text-xl font-bold mb-6">
            <span>Total:</span>
            <span>Rp {cartTotal.toLocaleString("en-US")}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 text-lg"
          >
            Complete Order
          </button>
        </div>
      </div>
    </div>
  );
}
