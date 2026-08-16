"use client";

import Link from "next/link";
import { useState } from "react";
import { formatPrice, useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    cart,
    subtotal,
    deliveryCharge,
    gstAmount,
    totalPayable,
    updateQuantity,
    removeFromCart,
    clearCart,
    saveOrder,
  } = useCart();

  const [form, setForm] = useState({
    phone: "",
    alternatePhone: "",
    address: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handlePlaceOrder = (event) => {
    event.preventDefault();

    if (!cart.length) {
      window.alert("Your cart is empty. Please add a few products first.");
      return;
    }

    if (!form.phone.trim()) {
      window.alert("Please enter your phone number.");
      return;
    }

    if (!form.address.trim()) {
      window.alert("Please enter a delivery address.");
      return;
    }

    const message = [
      "Hello Gifterra, I would like to place my order.",
      "",
      "Order Details:",
      ...cart.map(
        (item) =>
          `- ${item.title} x${item.quantity} - ${formatPrice(item.unitPrice * item.quantity)}`
      ),
      "",
      `Total items: ${totalItems}`,
      `Subtotal: ${formatPrice(subtotal)}`,
      `Delivery Charges: ${formatPrice(deliveryCharge)}`,
      `GST: ${formatPrice(gstAmount)}`,
      `Total Payable: ${formatPrice(totalPayable)}`,
      "",
      "Customer Details:",
      `Phone: ${form.phone}`,
      `Alternate Number: ${form.alternatePhone || "Not provided"}`,
      `Delivery Address: ${form.address}`,
    ].join("\n");

    const orderPayload = {
      items: cart.map((item) => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.unitPrice * item.quantity,
      })),
      customer: {
        phone: form.phone,
        alternatePhone: form.alternatePhone,
        address: form.address,
      },
      orderSummary: {
        totalItems,
        subtotal,
        deliveryCharge,
        gstAmount,
        totalPayable,
      },
      whatsappMessage: message,
    };

    const whatsappNumber = "917411555859";
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");

    saveOrder(orderPayload);
    clearCart();
    setForm({ phone: "", alternatePhone: "", address: "" });
    setShowSuccess(true);
  };

  if (!cart.length) {
    return (
      <section className="rounded-[28px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Cart</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">Your cart is empty</h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-7 text-slate-600">
          Add a few thoughtful pieces from our collection to continue with your order.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-flex rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          Explore Products
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Cart</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">Your items</h1>
          </div>
          <p className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="mt-8 space-y-5">
          {cart.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-5 rounded-[22px] border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-20 w-20 rounded-2xl object-cover"
                />
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.subtitle}</p>
                  <p className="mt-2 text-base font-semibold text-slate-900">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-auto">
                <div className="flex items-center rounded-full border border-slate-200 bg-white">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    className="h-10 w-10 text-xl font-medium text-slate-700 transition hover:bg-slate-100"
                    aria-label={`Decrease quantity of ${item.title}`}
                  >
                    −
                  </button>
                  <span className="min-w-10 text-center text-sm font-semibold text-slate-900">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="h-10 w-10 text-xl font-medium text-slate-700 transition hover:bg-slate-100"
                    aria-label={`Increase quantity of ${item.title}`}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(item.id)}
                  className="rounded-full border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handlePlaceOrder} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Checkout</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Delivery details</h2>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Phone Number
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Alternate Number
                <input
                  type="tel"
                  name="alternatePhone"
                  value={form.alternatePhone}
                  onChange={handleChange}
                  placeholder="Optional alternate number"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Delivery Address
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                rows={5}
                placeholder="Enter your delivery address"
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
            >
              Place Order
            </button>
          </div>
        </form>

        <aside className="rounded-[28px] border border-slate-200 bg-slate-900 p-6 text-slate-200 shadow-sm sm:p-8">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Summary</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Order totals</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total Amount</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Delivery Charges</span>
                <span>{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>GST</span>
                <span>{formatPrice(gstAmount)}</span>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <div className="flex items-center justify-between text-lg font-semibold text-white">
                <span>Total Payable</span>
                <span>{formatPrice(totalPayable)}</span>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
              ✓
            </div>
            <h3 className="mt-5 text-2xl font-semibold text-slate-950">Order placed successfully</h3>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Our executive will be contacting you shortly. If any queries you have, please reach us on
              <span className="font-semibold text-slate-900"> +91 74115 55859</span>.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => setShowSuccess(false)}
                className="rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Continue Shopping
              </button>
              <Link
                href="/orders"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
