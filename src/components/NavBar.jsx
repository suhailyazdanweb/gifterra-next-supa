"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function NavBar() {
  const { cartCount } = useCart();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="inline-flex items-center">
          <img src="/Gifterra-logo-svg.svg" alt="Gifterra logo" className="h-12 w-auto" />
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-700">
          <Link href="/" className="rounded-full px-4 py-2 transition hover:bg-slate-100">
            Dashboard
          </Link>
          <Link href="/products" className="rounded-full px-4 py-2 transition hover:bg-slate-100">
            Products
          </Link>
          <Link href="/orders" className="rounded-full px-4 py-2 transition hover:bg-slate-100">
            Orders
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex items-center rounded-full bg-cyan-600 px-4 py-2 text-white transition hover:bg-cyan-700"
          >
            Cart
            <span className="ml-2 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
              {cartCount}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
