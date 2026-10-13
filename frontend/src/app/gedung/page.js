import Link from 'next/link';
import Image from 'next/image';
import { getBuildings, getFacilities } from '@/lib/api-client';
import { formatCurrencyAmount } from '@/lib/currency-format';
import { getBuildingPhoto } from '@/lib/building-photo';

export const instant = false;

export const metadata = {
  title: 'Katalog gedung | VenueConnect Polinela',
  description: 'Jelajahi gedung untuk peminjaman internal dan ruang untuk penyewaan luar kampus.'
};

function formatRate(rate) {
  const price = formatCurrencyAmount(rate.amount, rate.currency);
  const unit = { hour: 'jam', day: 'hari', event: 'acara' }[rate.unit] ?? rate.unit;
  return price ? `${price} / ${unit}` : null;
}

function pageHref(filters, page) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (Array.isArray(value)) value.forEach((item) => query.append(key, item));
    else if (value) query.set(key, value);
  });
  if (page > 1) query.set('page', String(page));
  return `/gedung${query.size ? `?${query}` : ''}`;
}

export default async function BuildingCatalog({ searchParams }) {
  const params = await searchParams;
  const filters = {
    purpose: params.purpose === 'rental' ? 'rental' : 'loan',
    q: typeof params.q === 'string' ? params.q.trim() : '',
    facility: typeof params.facility === 'string' ? params.facility.trim() : '',
    minCapacity: typeof params.minCapacity === 'string' ? params.minCapacity : '',
    facilityIds: (Array.isArray(params.facilityIds) ? params.facilityIds : typeof params.facilityIds === 'string' ? params.facilityIds.split(',') : []).filter(Boolean)
  };
  const pageNumber = Number(params.page || 1);
  const page = Number.isInteger(pageNumber) && pageNumber > 0 ? pageNumber : 1;
  let data;
  let facilities = [];
  let facilityError = false;
  let error = false;
  const [buildingsResult, facilitiesResult] = await Promise.allSettled([
    getBuildings({ ...filters, page, pageSize: 12 }),
    getFacilities({ page: 1, pageSize: 100 })
  ]);
  try {
    if (buildingsResult.status !== 'fulfilled') throw buildingsResult.reason;
    const response = buildingsResult.value;
    if (!response.success || !Array.isArray(response.data)) throw new Error('Invalid catalog response');
    data = response;
  } catch {
    error = true;
  }
  if (facilitiesResult.status === 'fulfilled' && facilitiesResult.value.success && Array.isArray(facilitiesResult.value.data)) {
    facilities = facilitiesResult.value.data;
  } else {
    facilityError = true;
  }

  return <div className="home-container py-10 sm:py-12">
    <header className="mb-7">
      <p className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-700">Direktori fasilitas</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{filters.purpose === 'loan' ? 'Gedung untuk peminjaman Polinela' : 'Ruang dan gedung untuk penyewaan'}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{filters.purpose === 'loan' ? 'Khusus mahasiswa, dosen, dan civitas akademika Polinela. Harga sewa tidak berlaku untuk alur peminjaman ini.' : 'Khusus orang atau instansi luar kampus. Harga yang ditampilkan adalah tarif penyewaan dari tabel yang Anda berikan.'}</p>
    </header>

    <nav aria-label="Jenis layanan" className="mb-6 flex flex-wrap gap-3">
      <Link href="/gedung?purpose=loan" aria-current={filters.purpose === 'loan' ? 'page' : undefined} className={`rounded-lg px-5 py-3 text-sm font-semibold ${filters.purpose === 'loan' ? 'bg-emerald-700 text-white' : 'border border-slate-300 bg-white text-slate-800'}`}>Peminjaman Polinela</Link>
      <Link href="/gedung?purpose=rental" aria-current={filters.purpose === 'rental' ? 'page' : undefined} className={`rounded-lg px-5 py-3 text-sm font-semibold ${filters.purpose === 'rental' ? 'bg-emerald-700 text-white' : 'border border-slate-300 bg-white text-slate-800'}`}>Penyewaan luar kampus</Link>
    </nav>

    <form action="/gedung" method="get" className="mb-7 grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 lg:grid-cols-4">
      <input type="hidden" name="purpose" value={filters.purpose} />
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">Nama atau area
        <input name="q" defaultValue={filters.q} maxLength={100} placeholder="Contoh: aula, kampus utama" className="min-h-11 w-full px-3 text-base font-normal" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">Fasilitas
        <input name="facility" defaultValue={filters.facility} maxLength={100} placeholder="Contoh: proyektor" className="min-h-11 w-full px-3 text-base font-normal" />
      </label>
      <label className="grid gap-1.5 text-sm font-medium text-slate-700">Kapasitas minimum
        <input name="minCapacity" type="number" min="1" step="1" defaultValue={filters.minCapacity} placeholder="Jumlah orang" className="min-h-11 w-full px-3 text-base font-normal" />
      </label>
      <fieldset className="grid gap-2 sm:col-span-2 lg:col-span-4">
        <legend className="mb-1 text-sm font-medium text-slate-700">Fasilitas yang tersedia</legend>
        {facilities.length ? <div className="flex flex-wrap gap-x-5 gap-y-2">{facilities.map((facility) => <label key={facility.id} className="flex min-h-9 items-center gap-2 text-sm text-slate-700"><input type="checkbox" name="facilityIds" value={facility.id} defaultChecked={filters.facilityIds.includes(facility.id)} className="h-4 w-4 accent-emerald-700" />{facility.name}</label>)}</div> : <p className="text-xs text-slate-500">{facilityError ? 'Pilihan fasilitas belum dapat dimuat.' : 'Belum ada fasilitas yang tersedia.'}</p>}
      </fieldset>
      <div className="flex flex-wrap items-end gap-4 sm:col-span-2 lg:col-span-4">
        <button type="submit" className="min-h-11 rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white hover:bg-emerald-800">Terapkan filter</button>
        <Link href={`/gedung?purpose=${filters.purpose}`} className="inline-flex min-h-11 items-center text-sm font-medium text-slate-700 hover:text-primary">Reset</Link>
      </div>
    </form>

    {error ? <section role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-center text-amber-950"><p className="font-semibold">Katalog belum dapat dimuat</p><p className="mt-1 text-sm">Periksa koneksi layanan lalu coba muat ulang.</p><Link href={pageHref(filters, page)} className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-amber-500 px-4 text-sm font-semibold">Coba lagi</Link></section> : data.data.length === 0 ? <section className="home-card p-10 text-center"><span className="material-symbols-outlined text-4xl text-slate-400" aria-hidden="true">location_searching</span><h2 className="mt-3 font-semibold text-slate-900">Tidak ada gedung ditemukan</h2><p className="mt-1 text-sm text-slate-600">Ubah atau hapus filter untuk melihat hasil lainnya.</p><Link href={`/gedung?purpose=${filters.purpose}`} className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white">Hapus semua filter</Link></section> : <>
      <p className="mb-4 text-sm text-slate-600">Menampilkan {data.data.length} dari {data.meta?.total ?? data.data.length} gedung</p>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.data.map((building) => {
          const externalRate = filters.purpose === 'rental' ? building.rates?.find((item) => item.audienceType === 'EXTERNAL' && item.isBookable) ?? building.rates?.find((item) => item.audienceType === 'EXTERNAL') : null;
          const rate = externalRate ? formatRate(externalRate) : null;
          const photo = getBuildingPhoto(building.slug);
          return <article key={building.id} className="home-card flex flex-col overflow-hidden">
            <div className="relative flex aspect-video items-end overflow-hidden bg-gradient-to-br from-[#d5e8df] via-[#e8f2ee] to-[#dce8e4] p-4">
              {photo ? <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ objectFit: 'cover', objectPosition: photo.objectPosition }} /> : <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/80 text-primary"><span className="material-symbols-outlined text-2xl" aria-hidden="true">domain</span></span>}
              <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800">{filters.purpose === 'loan' ? 'Peminjaman Polinela' : 'Sewa luar kampus'}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-lg font-semibold text-slate-900">{building.name}</h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><span className="material-symbols-outlined text-base" aria-hidden="true">location_on</span>{building.location || 'Lokasi belum dicantumkan'}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><span className="material-symbols-outlined text-base" aria-hidden="true">groups</span>{building.capacity != null ? `Kapasitas ${building.capacity} orang` : 'Kapasitas belum dicantumkan'}</p>
              {building.description && <p className="mt-2 line-clamp-2 text-xs text-slate-600">{building.description}</p>}
              <div className="mt-3 flex flex-wrap gap-2">{(building.facilities ?? []).slice(0, 4).map(({ facility }) => <span key={facility.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{facility.name}</span>)}</div>
              <div className="mt-auto border-t border-slate-100 pt-4"><p className="mb-3 text-sm font-medium text-slate-800">{filters.purpose === 'loan' ? 'Ajukan peminjaman melalui akun internal' : rate ? `Tarif sewa luar kampus: ${rate}` : 'Tarif sewa luar kampus belum dicantumkan'}</p><Link href={`/gedung/${building.slug}?purpose=${filters.purpose}`} className="flex min-h-11 items-center justify-center rounded-lg border border-emerald-700 px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Lihat detail</Link></div>
            </div>
          </article>;
        })}
      </div>
      {data.meta?.totalPages > 1 && <nav aria-label="Halaman katalog" className="mt-8 flex flex-wrap items-center justify-center gap-2">
        {page > 1 && <Link href={pageHref(filters, page - 1)} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium">Sebelumnya</Link>}
        {Array.from({ length: data.meta.totalPages }, (_, index) => index + 1).map((pageNumber) => <Link key={pageNumber} href={pageHref(filters, pageNumber)} aria-current={page === pageNumber ? 'page' : undefined} className={`inline-flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-medium ${page === pageNumber ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}>{pageNumber}</Link>)}
        {page < data.meta.totalPages && <Link href={pageHref(filters, page + 1)} className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium">Berikutnya</Link>}
      </nav>}
    </>}
  </div>;
}
