import BookingDetailView from '@/app/(member)/dashboard/[id]/booking-detail-view';

export const instant = false;

export default async function AdminBookingDetailPage({ params }) {
  const { id } = await params;
  return <BookingDetailView bookingId={id} adminMode />;
}
