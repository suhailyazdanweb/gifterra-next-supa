import Link from "next/link";

export default function ProductDetailPage({ product }) {
  return (
    <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="flex-1 overflow-hidden rounded-[28px] bg-slate-100">
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Product detail</p>
            <h1 className="text-3xl font-semibold text-slate-950">{product.title}</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">{product.subtitle}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {product.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                {tag}
              </span>
            ))}
          </div>

          <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-6">
            <p className="text-sm font-medium text-slate-500">Price</p>
            <p className="text-3xl font-semibold text-slate-950">{product.price}</p>
            <div className="flex flex-wrap gap-3">
              <button className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700">
                Add to Gifpack
              </button>
              <button className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                Customize
              </button>
            </div>
          </div>

          <Link href="/products" className="inline-flex items-center text-sm font-semibold text-cyan-700 transition hover:text-cyan-900">
            ← Back to products
          </Link>
        </div>
      </div>
    </div>
  );
}
