export default function Loading() {
  return <div className="home-container py-12" role="status" aria-label="Memuat halaman">
    <span className="sr-only">Memuat konten halaman…</span>
    <div className="mb-8 h-8 w-64 animate-pulse rounded bg-slate-200" />
    <div className="mb-8 h-28 animate-pulse rounded-2xl bg-white" />
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="aspect-video animate-pulse bg-slate-100" /><div className="space-y-3 p-5"><div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" /><div className="h-4 w-full animate-pulse rounded bg-slate-100" /><div className="h-4 w-3/4 animate-pulse rounded bg-slate-100" /></div></div>)}</div>
  </div>;
}
