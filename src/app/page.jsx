import AppLayout from "@/components/AppLayout";
import Link from "next/link";

export default function Home() {
  return (
    <AppLayout>
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center rounded-[32px] border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Gifterra</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          Discover curated gift packs for every occasion.
        </h1>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-slate-600">
          Explore the latest collection of personalized gifts, bundles, and corporate gifting solutions made for easy discovery.
        </p>
        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/products"
            className="rounded-full bg-cyan-600 px-8 py-4 text-sm font-semibold text-white transition hover:bg-cyan-700"
          >
            Browse products
          </Link>
          <a
            href="#"
            className="rounded-full border border-slate-200 bg-white px-8 py-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Contact sales
          </a>
        </div>
      </div>
    </AppLayout>
  );
}
