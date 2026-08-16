"use client";

import Link from "next/link";
import { formatPrice, useCart } from "@/context/CartContext";

export default function OrdersPage() {
  const { orders } = useCart();

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-700">Orders</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">Order history</h1>
        </div>
        <Link
          href="/products"
          className="inline-flex rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700"
        >
          Continue shopping
        </Link>
      </div>

      {!orders.length ? (
        <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <p className="text-lg font-semibold text-slate-800">No orders yet</p>
          <p className="mt-2 text-sm text-slate-600">Your placed orders will appear here after checkout.</p>
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {orders.map((order) => (
            <article key={order.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Order ID</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{order.id}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Placed on</p>
                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {new Date(order.createdAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {order.items.map((item) => (
                  <div key={`${order.id}-${item.id}`} className="flex items-center justify-between gap-4 rounded-2xl bg-white p-3">
                    <div>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-slate-900">{formatPrice(item.totalPrice)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-3 rounded-2xl bg-white p-4 text-sm text-slate-700 sm:grid-cols-2">
                <div>
                  <p className="font-semibold text-slate-900">Customer</p>
                  <p>{order.customer.phone}</p>
                  {order.customer.alternatePhone ? <p>{order.customer.alternatePhone}</p> : null}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Delivery</p>
                  <p>{order.customer.address}</p>
                </div>
              </div>

              <div className="mt-5 space-y-2 rounded-2xl bg-slate-900 p-4 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span>Total Items</span>
                  <span>{order.orderSummary.totalItems}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.orderSummary.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Delivery</span>
                  <span>{formatPrice(order.orderSummary.deliveryCharge)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>GST</span>
                  <span>{formatPrice(order.orderSummary.gstAmount)}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-700 pt-2 text-base font-semibold text-white">
                  <span>Total Payable</span>
                  <span>{formatPrice(order.orderSummary.totalPayable)}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
