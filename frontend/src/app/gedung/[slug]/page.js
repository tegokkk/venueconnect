import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ApiRequestError, getBuilding } from '@/lib/api-client';
import { formatCurrencyAmount } from '@/lib/currency-format';
import { getBuildingPhoto } from '@/lib/building-photo';
import AvailabilityCalendar from '../../jadwal/availability-calendar';
import TermsPanel from './terms-panel';

export const instant = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const building = await getBuilding(slug);
    if (building?.name) return { title: `${building.name} | VenueConnect Polinela` };
  } catch {
    // The page handles missing or unavailable buildings.
  }
  return { title: 'Detail gedung | VenueConnect Polinela' };
}

function formatRate(rate) {
  const unit = {
    hour: 'jam',
    day: 'hari',
    event: 'acara'
  }[rate.unit] ?? rate.unit;
  const price = formatCurrencyAmount(rate.amount, rate.currency);
  if (!price) return 'Tarif tidak dapat ditampilkan';

  return `${price} / ${unit}`;
}

export default async function BuildingDetail({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  let building;
  try {
    building = await getBuilding(slug);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) notFound();
  }

  if (!building?.id) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-3 text-2xl font-bold text-slate-900">Detail gedung belum dapat dimuat</h1>
        <p role="alert" className="mb-6 text-slate-600">Layanan katalog sedang tidak tersedia. Coba lagi beberapa saat lagi.</p>
        <Link href="/" className="font-semibold text-emerald-700 hover:underline">Kembali ke katalog</Link>
      </div>
    );
  }

  const facilities = building.facilities ?? [];
  const purpose = query?.purpose === 'rental' && building.publicRentalEnabled ? 'rental' : building.internalLoanEnabled ? 'loan' : 'rental';
  const rates = purpose === 'rental' ? (building.rates ?? []).filter((rate) => rate.audienceType === 'EXTERNAL') : [];
  const photo = getBuildingPhoto(building.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="mb-2 text-xs text-slate-500"><Link href="/" className="hover:underline">Beranda</Link> / <Link href={`/gedung?purpose=${purpose}`} className="hover:underline">{purpose === 'loan' ? 'Peminjaman' : 'Penyewaan'}</Link> / {building.name}</p>
        <Link href={`/gedung?purpose=${purpose}`} className="flex min-h-10 items-center gap-2 text-sm font-medium text-emerald-700 hover:text-emerald-800">
          <span aria-hidden="true">←</span> Kembali ke katalog
        </Link>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {photo && <div className="relative aspect-video overflow-hidden">
          <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1280px) 100vw, 1200px" style={{ objectFit: 'cover', objectPosition: photo.objectPosition }} priority />
        </div>}
        <div className={`relative flex items-end p-6 sm:p-9 ${photo ? 'bg-emerald-900' : 'min-h-56 bg-gradient-to-br from-[#173b32] via-[#245c4d] to-[#2f7662] sm:min-h-72'}`}>
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-emerald-100">
              {purpose === 'loan' ? 'Peminjaman civitas Polinela' : 'Penyewaan luar kampus'}
            </p>
            <h1 className="mb-2 text-3xl font-extrabold text-white sm:text-4xl">{building.name}</h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-emerald-50">
              <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-base" aria-hidden="true">location_on</span>{building.location || 'Lokasi belum dicantumkan'}</span>
              {building.capacity != null && <span className="inline-flex items-center gap-1"><span className="material-symbols-outlined text-base" aria-hidden="true">groups</span>Kapasitas {building.capacity} orang</span>}
              <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1"><span className="material-symbols-outlined text-sm" aria-hidden="true">check_circle</span>Gedung aktif</span>
            </div>
          </div>
        </div>

        <nav aria-label="Bagian detail gedung" className="sticky top-[112px] z-20 flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-4 py-2 sm:px-8">
          {[['informasi', 'Informasi'], ['fasilitas', 'Fasilitas'], ...(purpose === 'rental' ? [['tarif', 'Tarif sewa']] : []), ['jadwal', 'Jadwal'], ['syarat', 'Syarat']].map(([id, label]) => <a key={id} href={`#${id}`} className="inline-flex min-h-10 shrink-0 items-center rounded-lg px-3 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-800">{label}</a>)}
        </nav>

        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-3">
          <div className="space-y-8 md:col-span-2">
            <section id="informasi" aria-labelledby="about-heading" className="scroll-mt-36">
              <h2 id="about-heading" className="mb-3 text-xl font-bold text-slate-900">Tentang gedung</h2>
              <p className="whitespace-pre-line leading-7 text-slate-700">
                {building.description || 'Deskripsi gedung belum tersedia.'}
              </p>
              <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Lokasi</dt><dd className="mt-1 text-sm font-medium text-slate-900">{building.location || 'Belum dicantumkan'}</dd></div>
                <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Kapasitas</dt><dd className="mt-1 text-sm font-medium text-slate-900">{building.capacity != null ? `${building.capacity} orang` : 'Belum dicantumkan'}</dd></div>
                <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Status</dt><dd className="mt-1 text-sm font-medium text-emerald-800">Aktif</dd></div>
                <div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Jenis layanan</dt><dd className="mt-1 text-sm font-medium text-slate-900">{purpose === 'loan' ? 'Peminjaman Polinela' : 'Sewa luar kampus'}</dd></div>
              </dl>
              {facilities.length > 0 && <ul aria-label="Ringkasan fasilitas" className="mt-5 grid gap-3 sm:grid-cols-2">
                {facilities.map(({ facility }) => <li key={facility.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-primary"><span className="material-symbols-outlined text-base" aria-hidden="true">check_circle</span></span><span className="text-sm font-medium text-slate-800">{facility.name}</span></li>)}
              </ul>}
            </section>

            <section id="syarat" aria-labelledby="terms-heading" className="scroll-mt-36">
              <h2 id="terms-heading" className="mb-3 text-xl font-bold text-slate-900">Syarat &amp; ketentuan</h2>
              <TermsPanel buildingId={building.id} />
            </section>

            <section id="fasilitas" aria-labelledby="facilities-heading" className="scroll-mt-36">
              <h2 id="facilities-heading" className="mb-3 text-xl font-bold text-slate-900">Fasilitas</h2>
              {facilities.length ? (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {facilities.map(({ facility, detail: facilityDetail }) => (
                    <li key={facility.id} className="flex gap-3 rounded-lg border border-slate-200 p-3">
                      <span className="material-symbols-outlined mt-0.5 text-primary" aria-hidden="true">check_circle</span>
                      <span className="font-medium text-slate-900">{facility.name}</span>
                      {(facilityDetail || facility.description) && (
                        <span className="mt-1 block text-sm text-slate-600">{facilityDetail || facility.description}</span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-slate-600">Informasi fasilitas belum tersedia.</p>}
            </section>

            {purpose === 'rental' && <section id="tarif" aria-labelledby="rates-heading" className="scroll-mt-36">
              <h2 id="rates-heading" className="mb-3 text-xl font-bold text-slate-900">Tarif sewa luar kampus</h2>
              <p className="mb-3 text-sm text-slate-600">Tarif ini hanya untuk pemohon luar Polinela yang mengajukan penyewaan. Peminjaman civitas Polinela mengikuti alur internal.</p>
              {rates.length ? (
                <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                  {rates.map((rate) => {
                    return (
                      <li key={rate.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                        <span className="text-slate-700">{rate.name || 'Tarif sewa gedung'}{!rate.isBookable && <span className="mt-1 block text-xs text-amber-800">Informasi harga; perhitungan tagihan perlu konfirmasi pengelola.</span>}</span>
                        <span className="font-semibold text-slate-900">{formatRate(rate)}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="text-slate-600">Tarif sewa luar kampus belum dicantumkan. Hubungi pengelola untuk informasi resmi.</p>}
            </section>}

            <section id="jadwal" aria-labelledby="availability-heading" className="scroll-mt-36">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 id="availability-heading" className="text-xl font-bold text-slate-900">Jadwal ketersediaan</h2>
                  <p className="mt-1 text-sm text-slate-600">Pratinjau kalender memakai WIB; zona operasional resmi belum ditetapkan. Kalender hanya menampilkan waktu dan status umum.</p>
                </div>
                <Link href={`/jadwal?gedung=${encodeURIComponent(building.id)}`} className="text-sm font-semibold text-emerald-700 hover:underline">Buka kalender</Link>
              </div>
              <AvailabilityCalendar buildingId={building.id} />
            </section>
          </div>

          <aside className="h-fit rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Informasi ringkas</h2>
            <dl className="mb-6 space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <dt className="text-slate-600">Kapasitas</dt>
                <dd className="font-medium text-slate-900">{building.capacity != null ? `${building.capacity} orang` : 'Belum dicantumkan'}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-slate-200 pb-3">
                <dt className="text-slate-600">Jenis layanan</dt>
                <dd className="font-medium text-slate-900">{purpose === 'loan' ? 'Peminjaman Polinela' : 'Sewa luar kampus'}</dd>
              </div>
            </dl>
            <Link href={`/pinjam/${building.slug}?purpose=${purpose}`} className="mb-3 block rounded-lg bg-emerald-700 px-4 py-3 text-center font-semibold text-white hover:bg-emerald-800">
              {purpose === 'loan' ? 'Ajukan peminjaman' : 'Ajukan penyewaan'}
            </Link>
            <p className="text-xs leading-5 text-slate-600">Informasi jadwal adalah ringkasan. Pengajuan akan diperiksa kembali oleh sistem.</p>
          </aside>
        </div>
      </section>
    </div>
  );
}
