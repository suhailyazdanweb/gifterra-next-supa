"use client";

import { useState } from "react";
import ProductGrid from "@/components/ProductGrid";
import Sidebar from "@/components/Sidebar";
import Search from "@/components/Search";

export default function ProductPage({ products, loadError }) {
  const [search, setSearch] = useState("");

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <Sidebar />

        <main className="space-y-8">
          <section className="rounded-[16px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Categories</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-950">Search gifts for your dear ones</h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                  Filters
                </button>
                <button className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                  Sort
                </button>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="min-w-[220px] rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                Categories
              </div>
              <Search value={search} onChange={(event) => setSearch(event.target.value)} />
            </div>
          </section>

          {loadError ? (
            <p className="rounded-2xl bg-red-50 p-5 text-sm text-red-700" role="alert">
              Products could not be loaded: {loadError}
            </p>
          ) : filteredProducts.length ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
              <p className="text-lg font-semibold text-slate-800">
                {search ? "No matching gifts found" : "Our gift collection is coming soon"}
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {search
                  ? "Try a different search."
                  : "Please check back soon for thoughtful gifts and gift packs."}
              </p>
            </div>
          )}

          <section className="rounded-[16px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Stay updated</p>
                <h3 className="mt-3 text-2xl font-semibold text-slate-950">Get updates on new gift packs</h3>
              </div>
              <div className="flex w-full max-w-lg flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
                />
                <button className="rounded-full bg-cyan-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700">
                  Subscribe
                </button>
              </div>
            </div>
          </section>

          <footer className="rounded-[16px] border border-slate-200 bg-slate-950 p-8 text-slate-300 shadow-sm">
            <div className="grid gap-8 lg:grid-cols-4">
              <div>
                <p className="text-3xl font-semibold text-cyan-400">Gifterra</p>
                <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                  Thoughtful gifts, unforgettable moments.
                </p>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">Quick Links</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="transition hover:text-white">About Us</a></li>
                  <li><a href="#" className="transition hover:text-white">Collections</a></li>
                  <li><a href="#" className="transition hover:text-white">Corporate Gifting</a></li>
                  <li><a href="#" className="transition hover:text-white">FAQs</a></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">Legal</h4>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li><a href="#" className="transition hover:text-white">Privacy Policy</a></li>
                  <li><a href="#" className="transition hover:text-white">Terms & Conditions</a></li>
                  <li><a href="#" className="transition hover:text-white">Shipping Policy</a></li>
                  <li><a href="#" className="transition hover:text-white">Sitemap</a></li>
                </ul>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-200">Support</h4>
                <ul className="space-y-3 text-sm text-slate-400">
                  <li><a href="#" className="transition hover:text-white">Help Center</a></li>
                  <li><a href="#" className="transition hover:text-white">FAQs</a></li>
                  <li><a href="#" className="transition hover:text-white">Shipping & Delivery</a></li>
                  <li><a href="#" className="transition hover:text-white">Return Policy</a></li>
                </ul>
                <div className="mt-6 space-y-3 text-sm text-slate-400">
                  <p>+91 74115 555859</p>
                  <p>support@gifterra.com</p>
                </div>
              </div>
            </div>
            <p className="mt-8 border-t border-slate-800 pt-6 text-center text-sm text-slate-500">
              ©2026 Gifterra. All rights reserved.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
