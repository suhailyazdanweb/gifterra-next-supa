"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const handleCartToggle = () => {
    if (inCart) {
      removeFromCart(product.id);
      return;
    }

    addToCart(product);
  };

  return (
    <article className="group overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden bg-slate-100">
        <Link href={`/products/${product.id}`} className="block">
          <img
            src={product.image}
            alt={product.title}
            className="h-64 w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

        {product.status ? (
          <div className="absolute left-4 top-4 rounded-full bg-violet-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-700 shadow-sm">
            {product.status}
          </div>
        ) : null}

        <div className="absolute right-4 top-4 rounded-full border border-violet-200 bg-white/95 px-3 py-1 text-[11px] font-semibold text-violet-700 shadow-sm">
          {product.rating} ★
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-xl font-semibold text-slate-900 transition hover:text-cyan-700">
              {product.title}
            </h3>
          </Link>
          <p className="text-sm leading-6 text-slate-600">{product.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={`${product.id}-${tag}`}
              className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-4 sm:items-center sm:justify-between sm:flex-row">
          <p className="text-2xl font-semibold text-slate-900">{product.price}</p>
          <Link
            href={`/products/${product.id}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {product.actionLabel}
          </Link>
        </div>

        <button
          type="button"
          onClick={handleCartToggle}
          className={`w-full rounded-full px-4 py-3 text-sm font-semibold transition ${
            inCart
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
              : "bg-cyan-600 text-white hover:bg-cyan-700"
          }`}
        >
          {inCart ? "Remove from Cart" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}
