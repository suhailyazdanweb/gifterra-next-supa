export default function Sidebar() {
  const categories = [
    "Under 500",
    "Under 1000",
    "Under 2000",
    "Under 5000",
    "Under 10000",
    "Under 15000"
  ];

  return (
    <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Price range</p>
      <ul className="mt-6 space-y-3 text-sm text-slate-700">
        {categories.map((category) => (
          <li key={category}>
            <a href="#" className="block rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-cyan-500 hover:bg-slate-50">
              {category}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
