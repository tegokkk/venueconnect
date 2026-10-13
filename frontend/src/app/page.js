import Link from 'next/link';
import Image from 'next/image';
import { getBuildings, getAvailability } from '@/lib/api-client';
import { formatCurrencyAmount } from '@/lib/currency-format';
import { getBuildingPhoto } from '@/lib/building-photo';
import AvailabilityCalendar from './jadwal/availability-calendar';

export const instant = false;

export const metadata = {
  title: 'Beranda | VenueConnect Polinela',
  description: 'Cari gedung untuk peminjaman civitas Polinela dan lihat penyewaan untuk luar kampus.'
};

function buildPageUrl(filters, page) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) params.set(key, value);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/?${query}` : '/';
}

function formatRate(rate) {
  const price = formatCurrencyAmount(rate.amount, rate.currency);
  const unit = { hour: 'jam', day: 'hari', event: 'acara' }[rate.unit] ?? rate.unit;
  return price ? `${price} / ${unit}` : null;
}

function dateRange(date) {
  const start = new Date(`${date}T00:00:00+07:00`);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { startDate: start.toISOString(), endDate: end.toISOString() };
}

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const filters = {
    q: typeof params.q === 'string' ? params.q.trim() : '',
    facility: typeof params.facility === 'string' ? params.facility.trim() : '',
    minCapacity: typeof params.minCapacity === 'string' ? params.minCapacity : '',
    tanggal: typeof params.tanggal === 'string' ? params.tanggal : ''
  };
  const parsedPage = Number(params.page || 1);
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  let result = null;
  let loadError = false;
  let availabilityError = false;
  try {
    const payload = await getBuildings({ ...filters, purpose: 'loan', page, pageSize: 6 });
    if (!payload.success || !Array.isArray(payload.data)) throw new Error('Invalid catalog response');
    let buildings = payload.data;
    if (filters.tanggal && buildings.length) {
      const range = dateRange(filters.tanggal);
      const availability = await Promise.all(buildings.map(async (building) => {
        try {
          const response = await getAvailability({ buildingId: building.id, ...range });
          return [building.id, response.data?.unavailableSlots?.length === 0];
        } catch {
          return [building.id, null];
        }
      }));
      availabilityError = availability.some(([, available]) => available === null);
      const availableIds = new Set(availability.filter(([, available]) => available === true).map(([id]) => id));
      buildings = buildings.filter((building) => availableIds.has(building.id));
    }
    result = { buildings, meta: payload.meta };
  } catch {
    loadError = true;
  }

  const buildings = result?.buildings ?? [];
  const filtered = Boolean(filters.q || filters.facility || filters.minCapacity || filters.tanggal);
  let rentalBuildings = [];
  let rentalLoadError = false;
  try {
    const rentalPayload = await getBuildings({ purpose: 'rental', page: 1, pageSize: 6 });
    if (!rentalPayload.success || !Array.isArray(rentalPayload.data)) throw new Error('Invalid rental catalog response');
    rentalBuildings = rentalPayload.data;
  } catch {
    rentalLoadError = true;
  }

  return (
    <>
      <section className="home-hero">
        <div className="home-container px-0 pb-10 pt-12 sm:pb-14 sm:pt-16">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#c6ddd3] bg-white/75 px-3 py-1.5 text-xs font-semibold text-primary"><span className="material-symbols-outlined text-base" aria-hidden="true">preview</span>Pratinjau VenueConnect Polinela</span>
            <h1 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">Temukan ruang yang tepat untuk kegiatan Anda</h1>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600">Jelajahi fasilitas kampus, periksa jadwal penggunaan, dan pelajari prosedur pengajuan melalui satu portal.</p>
          </div>

          <form action="/" method="get" className="mx-auto mt-8 max-w-5xl rounded-2xl border border-slate-200 bg-white p-4 shadow-lg sm:p-5">
            <div className="hero-search-grid">
              <label>Nama gedung atau area
                <input name="q" defaultValue={filters.q} maxLength={100} placeholder="Contoh: aula, kampus utama" />
              </label>
              <label>Tanggal kegiatan
                <input name="tanggal" type="date" defaultValue={filters.tanggal} />
              </label>
              <label>Kapasitas minimum
                <input name="minCapacity" type="number" min="1" step="1" defaultValue={filters.minCapacity} placeholder="Jumlah peserta" />
              </label>
              <button type="submit"><span className="material-symbols-outlined mr-1 align-middle text-base" aria-hidden="true">search</span>Cari gedung</button>
            </div>
            {filters.facility && <input type="hidden" name="facility" value={filters.facility} />}
            {filtered && <div className="mt-3 text-right"><Link href="/" className="text-sm font-medium text-primary hover:underline">Hapus filter</Link></div>}
          </form>

          <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-600"><span className="material-symbols-outlined text-base text-emerald-700" aria-hidden="true">sync</span>Pratinjau kalender memakai WIB; zona operasional resmi belum ditetapkan. Status dimuat saat kalender dibuka atau rentang diubah.</p>
        </div>
      </section>

      <section className="home-container home-section" aria-labelledby="steps-title">
        <div className="mb-7 text-center"><p className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-700">Mulai dengan mudah</p><h2 id="steps-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">3 langkah mudah</h2><p className="mt-2 text-sm text-slate-600">Kenali fasilitas, cek jadwal, lalu ikuti alur pengajuan yang tersedia.</p></div>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['01', 'search', 'Pilih gedung', 'Bandingkan lokasi, kapasitas, fasilitas, dan tarif sewa luar kampus yang tercantum.'],
            ['02', 'calendar_month', 'Cek jadwal', 'Lihat slot yang sudah digunakan. Ketersediaan dapat berubah hingga pengajuan dikonfirmasi.'],
            ['03', 'description', 'Pelajari prosedur', 'Ikuti informasi pengajuan sesuai kategori pemohon dan kebijakan resmi pengelola.']
          ].map(([number, icon, title, description]) => <article key={number} className="home-card p-5 sm:p-6">
            <div className="flex items-start justify-between"><span className="text-3xl font-semibold tracking-tight text-[#b6d5c9]">{number}</span><span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-primary"><span className="material-symbols-outlined" aria-hidden="true">{icon}</span></span></div>
            <h3 className="mt-5 text-lg font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
          </article>)}
        </div>
      </section>

      <section className="home-container home-section pt-0" aria-labelledby="featured-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-700">Peminjaman kampus</p><h2 id="featured-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{filtered ? 'Hasil pencarian peminjaman' : 'Gedung untuk civitas Polinela'}</h2><p className="mt-2 text-sm text-slate-600">CB, QB, Sakura, dan GSG untuk peminjaman internal. GSG juga tersedia pada daftar sewa luar kampus.</p></div>
          <Link href="/gedung?purpose=loan" className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-emerald-50">Lihat gedung peminjaman <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span></Link>
        </div>
        {availabilityError && <p role="status" className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">Sebagian status jadwal belum dapat dimuat, sehingga hasil tanggal tidak bisa dipastikan. Buka kalender gedung untuk memeriksa kembali.</p>}
        {loadError ? <div role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">Katalog belum dapat dimuat. Periksa koneksi layanan, lalu muat ulang halaman.</div> : buildings.length === 0 ? (
          <div className="home-card p-8 text-center"><span className="material-symbols-outlined text-4xl text-slate-400" aria-hidden="true">location_searching</span><p className="mt-2 font-semibold text-slate-900">{filtered ? 'Tidak ada gedung yang cocok' : 'Belum ada gedung aktif'}</p><p className="mt-1 text-sm text-slate-600">{filters.tanggal ? 'Coba tanggal lain atau lihat status di halaman jadwal.' : 'Informasi gedung aktif akan tampil di sini.'}</p></div>
        ) : <>
          <p className="mb-4 text-sm text-slate-600">Menampilkan {buildings.length} gedung{!filtered && result?.meta?.total ? ` dari ${result.meta.total}` : ''}</p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {buildings.map((building) => {
              const photo = getBuildingPhoto(building.slug);
              return <article key={building.id} className="home-card flex flex-col overflow-hidden">
                <div className="relative flex aspect-[16/9] items-end overflow-hidden bg-gradient-to-br from-[#d5e8df] via-[#e8f2ee] to-[#dce8e4] p-4">
                  {photo ? <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ objectFit: 'cover', objectPosition: photo.objectPosition }} /> : <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/80 text-primary"><span className="material-symbols-outlined text-2xl" aria-hidden="true">domain</span></span>}
                  <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800">Peminjaman Polinela</span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-semibold text-slate-900">{building.name}</h3>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600"><span className="material-symbols-outlined text-base" aria-hidden="true">location_on</span>{building.location || 'Lokasi belum dicantumkan'}</p>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600"><span className="material-symbols-outlined text-base" aria-hidden="true">groups</span>{building.capacity != null ? `Kapasitas ${building.capacity} orang` : 'Kapasitas belum dicantumkan'}</p>
                  <div className="mt-3 flex flex-wrap gap-2">{(building.facilities ?? []).slice(0, 3).map(({ facility }) => <span key={facility.id} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">{facility.name}</span>)}</div>
                  <div className="mt-auto border-t border-slate-100 pt-4"><p className="mb-3 text-sm font-medium text-slate-800">Ajukan peminjaman melalui akun internal</p><Link href={`/gedung/${building.slug}?purpose=loan`} className="flex min-h-11 items-center justify-center rounded-lg border border-emerald-700 px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Lihat detail</Link></div>
                </div>
              </article>;
            })}
          </div>
          {result.meta?.totalPages > 1 && <nav aria-label="Halaman hasil" className="mt-7 flex items-center justify-center gap-4">
            {page > 1 && <Link href={buildPageUrl(filters, page - 1)} className="rounded-lg border border-slate-300 bg-white px-4 py-2">Sebelumnya</Link>}
            <span className="text-sm text-slate-600">Halaman {page} dari {result.meta.totalPages}</span>
            {page < result.meta.totalPages && <Link href={buildPageUrl(filters, page + 1)} className="rounded-lg border border-slate-300 bg-white px-4 py-2">Berikutnya</Link>}
          </nav>}
        </>}
      </section>

      <section className="home-container home-section pt-0" aria-labelledby="rental-title">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-700">Penyewaan luar kampus</p><h2 id="rental-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Ruang dan gedung untuk disewa</h2><p className="mt-2 text-sm text-slate-600">Tarif dari tabel yang Anda berikan; lokasi beberapa ruang dan syarat pemakaian masih perlu verifikasi pengelola.</p></div>
          <Link href="/gedung?purpose=rental" className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-emerald-50">Lihat semua pilihan sewa <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span></Link>
        </div>
        {rentalLoadError ? <p role="alert" className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950">Daftar penyewaan belum dapat dimuat. Coba buka katalog kembali.</p> : rentalBuildings.length === 0 ? <p className="home-card p-6 text-sm text-slate-600">Pilihan penyewaan belum tersedia.</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rentalBuildings.map((building) => {
            const externalRate = building.rates?.find((item) => item.audienceType === 'EXTERNAL' && item.isBookable) ?? building.rates?.find((item) => item.audienceType === 'EXTERNAL');
            const rate = externalRate ? formatRate(externalRate) : null;
            const photo = getBuildingPhoto(building.slug);
            return <article key={building.id} className="home-card flex flex-col overflow-hidden">
              <div className="relative flex aspect-[16/9] items-end overflow-hidden bg-gradient-to-br from-[#d5e8df] via-[#e8f2ee] to-[#dce8e4] p-4">
                {photo ? <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" style={{ objectFit: 'cover', objectPosition: photo.objectPosition }} /> : <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/80 text-primary"><span className="material-symbols-outlined text-2xl" aria-hidden="true">domain</span></span>}
                <span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800">Sewa luar kampus</span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-lg font-semibold text-slate-900">{building.name}</h3>
                <p className="mt-2 text-sm text-slate-600">{building.location || 'Lokasi rinci belum dicantumkan'}</p>
                {building.description && <p className="mt-2 line-clamp-2 text-xs text-slate-600">{building.description}</p>}
                <div className="mt-auto border-t border-slate-100 pt-4"><p className="mb-3 text-sm font-medium text-slate-800">{rate ? `Tarif sewa: ${rate}` : 'Tarif belum dicantumkan'}</p><Link href={`/gedung/${building.slug}?purpose=rental`} className="flex min-h-11 items-center justify-center rounded-lg border border-emerald-700 px-4 text-sm font-semibold text-emerald-800 hover:bg-emerald-50">Lihat tarif lengkap</Link></div>
              </div>
            </article>;
          })}
        </div>}
      </section>

      <section id="prosedur" className="home-container home-section pt-0" aria-labelledby="procedure-title">
        <div className="mb-6"><p className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-700">Informasi pengajuan</p><h2 id="procedure-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Peminjaman dan penyewaan</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Peminjaman ditujukan bagi mahasiswa, dosen, dan civitas akademika Polinela. Penyewaan ditujukan bagi pemohon luar kampus. Tarif yang tampil adalah tarif sewa luar kampus. Persyaratan dan keputusan resmi masih menunggu pengesahan pengelola.</p></div>
        <div className="grid gap-4 md:grid-cols-2">
          <details className="home-card group p-5"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-primary"><span className="material-symbols-outlined" aria-hidden="true">school</span></span>Peminjaman · civitas Polinela</span><span className="material-symbols-outlined text-slate-500 group-open:rotate-180" aria-hidden="true">expand_more</span></summary><p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">Mahasiswa, dosen, dan pegawai/civitas akademika Polinela mengajukan peminjaman melalui akun internal. Tarif sewa luar kampus yang tampil di katalog tidak berlaku sebagai tarif peminjaman internal.</p></details>
          <details className="home-card group p-5"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-semibold text-slate-900"><span className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-50 text-primary"><span className="material-symbols-outlined" aria-hidden="true">groups</span></span>Penyewaan · luar kampus</span><span className="material-symbols-outlined text-slate-500 group-open:rotate-180" aria-hidden="true">expand_more</span></summary><p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600">Orang atau instansi luar Polinela mengajukan penyewaan. Ketersediaan dan tarif sewa luar kampus ditampilkan pada detail gedung bila datanya sudah dimasukkan dan disahkan pengelola.</p></details>
        </div>
        <Link href="/bantuan" className="mt-5 inline-flex min-h-11 items-center gap-1 font-semibold text-primary hover:underline">Tanya pusat bantuan <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span></Link>
      </section>

      <section className="home-container pb-12" aria-label="Bantuan asisten VenueConnect">
        <div className="flex flex-col items-start justify-between gap-5 rounded-2xl bg-[#245c4d] p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-8">
          <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white/10"><span className="material-symbols-outlined text-3xl" aria-hidden="true">smart_toy</span></span><div><h2 className="text-xl font-semibold tracking-tight">Butuh bantuan memilih ruang?</h2><p className="mt-1 max-w-2xl text-sm leading-6 text-emerald-50">Tanyakan informasi kapasitas, fasilitas, tarif, dan jadwal kepada asisten VenueConnect.</p></div></div>
          <Link href="/bantuan" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-primary hover:bg-emerald-50"><span className="material-symbols-outlined text-base" aria-hidden="true">chat</span>Tanya asisten AI</Link>
        </div>
      </section>

      <section id="jadwal" className="home-container home-section pt-0" aria-labelledby="calendar-title">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-emerald-700">Ketersediaan fasilitas</p><h2 id="calendar-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Kalender jadwal gedung</h2><p className="mt-2 text-sm leading-6 text-slate-600">Jadwal umum tanpa identitas pemohon atau rincian acara.</p></div>
          {buildings[0] && <Link href={`/jadwal?gedung=${encodeURIComponent(buildings[0].id)}`} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-emerald-50">Lihat semua gedung</Link>}
        </div>
        {buildings[0] ? <><p className="mb-3 text-sm font-medium text-slate-700">Kalender · {buildings[0].name}</p><AvailabilityCalendar buildingId={buildings[0].id} /></> : <div className="home-card p-6 text-sm text-slate-600">Pilih gedung dari katalog untuk melihat kalender ketersediaan.</div>}
      </section>
    </>
  );
}
