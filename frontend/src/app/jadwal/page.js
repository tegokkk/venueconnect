import Link from 'next/link';
import AvailabilityCalendar from './availability-calendar';
import { getBuildings } from '@/lib/api-client';

export const instant = false;

export const metadata = {
  title: 'Jadwal gedung | VenueConnect Polinela',
  description: 'Lihat waktu pemakaian dan blokir gedung tanpa menampilkan identitas pemohon.'
};

export default async function JadwalPage({ searchParams }) {
  const params = await searchParams;
  let buildings = [];
  let loadError = false;

  try {
    const response = await getBuildings({ pageSize: 100 });
    buildings = response.data ?? [];
  } catch {
    loadError = true;
  }

  const requestedBuildingId = typeof params.gedung === 'string' ? params.gedung : '';
  const selectedBuilding = buildings.find((building) => building.id === requestedBuildingId) ?? buildings[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-700">VenueConnect Polinela</p>
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Kalender ketersediaan</h1>
        <p className="max-w-2xl text-slate-600">Lihat waktu gedung yang sudah terjadwal atau diblokir. Kalender publik tidak menampilkan pemohon maupun nama kegiatan.</p>
      </div>

      {loadError ? (
        <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">
          Daftar gedung belum dapat dimuat. Periksa koneksi layanan, lalu muat ulang halaman.
        </div>
      ) : buildings.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700">Belum ada gedung aktif yang dapat ditampilkan.</div>
      ) : (
        <>
          <form action="/jadwal" method="get" className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-end">
            <label htmlFor="building-select" className="text-sm font-medium text-slate-700">
              Pilih gedung
              <select id="building-select" name="gedung" defaultValue={selectedBuilding.id} className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base sm:w-96">
                {buildings.map((building) => <option key={building.id} value={building.id}>{building.name}</option>)}
              </select>
            </label>
            <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-2.5 font-semibold text-white hover:bg-emerald-800">Tampilkan jadwal</button>
            <Link href="/" className="px-2 py-2.5 text-sm font-medium text-emerald-800 hover:underline">Kembali ke katalog</Link>
          </form>

          <div className="mb-4">
            <h2 className="text-xl font-bold text-slate-900">{selectedBuilding.name}</h2>
            <p className="text-sm text-slate-600">{selectedBuilding.location || 'Lokasi belum dicantumkan'}</p>
          </div>
          <AvailabilityCalendar key={selectedBuilding.id} buildingId={selectedBuilding.id} />
        </>
      )}
    </div>
  );
}
