export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#f4f6fb] text-slate-900">
      <div className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
