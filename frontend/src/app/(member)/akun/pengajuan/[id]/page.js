import { redirect } from 'next/navigation';

export const instant = false;

export default async function MyBookingDetailRoute({ params }) {
  const { id } = await params;
  redirect(`/dashboard/${encodeURIComponent(id)}`);
}
