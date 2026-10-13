import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiRequestError, getBuilding } from '@/lib/api-client';
import BookingWizard from './booking-wizard';

export const instant = false;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    const building = await getBuilding(slug);
    if (building?.name) return { title: `Ajukan ${building.name} | VenueConnect Polinela` };
  } catch {
    // The page handles missing or unavailable buildings.
  }
  return { title: 'Ajukan gedung | VenueConnect Polinela' };
}

export default async function PinjamWizard({ params, searchParams }) {
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
        <h1 className="mb-3 text-2xl font-bold text-slate-900">Formulir belum dapat dimuat</h1>
        <p role="alert" className="mb-6 text-slate-600">Informasi gedung belum tersedia. Coba lagi atau kembali ke katalog.</p>
        <Link href="/" className="font-semibold text-emerald-700 hover:underline">Kembali ke katalog</Link>
      </div>
    );
  }

  const purpose = query?.purpose === 'rental' && building.publicRentalEnabled ? 'rental' : building.internalLoanEnabled ? 'loan' : 'rental';
  return <BookingWizard building={building} purpose={purpose} />;
}
