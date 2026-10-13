import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getBuilding } from '@/lib/api-client';

export const instant = false;

export default async function NewBookingRoute({ searchParams }) {
  const params = await searchParams;
  const buildingId = typeof params.buildingId === 'string' ? params.buildingId : '';
  let buildingSlug = '';
  if (buildingId) {
    try {
      const building = await getBuilding(buildingId);
      buildingSlug = building?.slug ?? '';
    } catch {
      // Show the selection state when an ID is stale or the API is unavailable.
    }
  }
  if (buildingSlug) redirect(`/pinjam/${encodeURIComponent(buildingSlug)}`);

  return <div className="home-container py-16">
    <section className="home-card mx-auto max-w-2xl p-7 text-center sm:p-10">
      <span className="material-symbols-outlined text-4xl text-primary" aria-hidden="true">edit_calendar</span>
      <h1 className="mt-3 text-2xl font-semibold text-slate-900">Pilih gedung untuk memulai</h1>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">Formulir pengajuan dibuka dari detail gedung agar jadwal dan kapasitas yang dipilih sesuai dengan fasilitasnya.</p>
      <Link href="/gedung" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800">Lihat katalog gedung</Link>
      <p className="mt-4 text-xs text-slate-500">Pengiriman pengajuan tetap dinonaktifkan sampai autentikasi dan alur persetujuan resmi tersedia.</p>
    </section>
  </div>;
}
