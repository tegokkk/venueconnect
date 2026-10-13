import { z } from 'zod';
import { bookingService } from '@/server/services/booking.service';
import { getDevelopmentSession } from '@/server/auth/development-session';
import { parsePagination } from '@/server/validations/pagination.validation';
import { ValidationError } from '@/server/errors';
import { successResponse, errorResponse } from '@/lib/api-response';

const statusSchema = z.enum([
  'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUESTED', 'AWAITING_APPROVAL',
  'AWAITING_PAYMENT', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'EXPIRED'
]);
const categorySchema = z.enum(['MAHASISWA', 'DOSEN_PEGAWAI', 'UMUM']);
const sortSchema = z.enum(['createdAt_desc', 'createdAt_asc', 'startsAt_asc', 'startsAt_desc']);

export async function GET(request) {
  try {
    await getDevelopmentSession(request, ['ADMIN']);
    const { searchParams } = new URL(request.url);
    const { page, pageSize } = parsePagination(searchParams);

    const rawStatus = searchParams.get('status');
    const status = rawStatus ? statusSchema.safeParse(rawStatus) : null;
    if (status && !status.success) throw new ValidationError('Invalid booking status filter');

    const rawCategory = searchParams.get('category');
    const category = rawCategory ? categorySchema.safeParse(rawCategory) : null;
    if (category && !category.success) throw new ValidationError('Invalid applicant category filter');

    const rawSort = searchParams.get('sort');
    const sort = rawSort ? sortSchema.safeParse(rawSort) : null;
    if (sort && !sort.success) throw new ValidationError('Invalid sort parameter');

    const rawSearch = searchParams.get('search')?.trim();
    const search = rawSearch ? rawSearch.slice(0, 100) : undefined;

    const result = await bookingService.getAdminBookings(page, pageSize, {
      status: status?.data,
      category: category?.data,
      search,
      sort: sort?.data
    });
    return successResponse(result.data, 200, result.meta);
  } catch (error) {
    return errorResponse(error);
  }
}
