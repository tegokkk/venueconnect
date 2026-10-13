import BookingDetailView from './booking-detail-view';

export const instant = false;

export default async function DetailPengajuan({ params }) {
  const { id } = await params;
  return <BookingDetailView bookingId={id} />;
}
