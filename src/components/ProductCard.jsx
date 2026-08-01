import Link from "next/link";

export default function ProductCard({ product }) {
  return (
    <article className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative overflow-hidden bg-slate-100">
        <Link href={`/products/${product.id}`} className="block">
          <img
            src={product.image}
            alt={product.title}
            className="h-64 w-full object-cover"
          />
        </Link>
        {product.status ? (
          <div className="absolute left-4 top-4 rounded-full bg-cyan-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-white shadow-lg shadow-cyan-500/20">
            {product.status}
          </div>
        ) : null}
        <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {product.rating} ★
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="space-y-2">
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="text-xl font-semibold text-slate-900 hover:text-cyan-700">
              {product.title}
            </h3>
          </Link>
          <p className="text-sm leading-6 text-slate-600">{product.subtitle}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <span
              key={`${product.id}-${tag}`}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-2xl font-semibold text-slate-900">{product.price}</p>
          <Link
            href={`/products/${product.id}`}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            {product.actionLabel}
          </Link>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="min-w-[140px] flex-1 rounded-full bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700">
            {product.itemLabel}
          </button>
          <Link
            href={`/products/${product.id}`}
            className="min-w-[140px] flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 text-center"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
