// Browser requests stay on the frontend origin; Next.js proxies them to the backend.
// Server components call the backend directly because Node fetch needs an absolute URL.
const API_BASE_URL = typeof window === 'undefined'
  ? `${(process.env.BACKEND_API_ORIGIN || 'http://localhost:3001').replace(/\/$/, '')}/api/v1`
  : '/api/v1';

export class ApiRequestError extends Error {
  constructor(message, status, { code = null, requestId = null } = {}) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

/**
 * Core API Client for Frontend
 */
export const apiClient = {
  async fetchApi(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    // Add default headers
    const developmentUserId = process.env.NODE_ENV === 'development'
      ? process.env.NEXT_PUBLIC_DEV_USER_ID
      : undefined;
    const headers = {
      'Content-Type': 'application/json',
      ...(developmentUserId ? { 'x-user-id': developmentUserId } : {}),
      ...options.headers,
    };

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiRequestError(data.error?.message || 'API request failed', response.status, {
          code: data.error?.code ?? null,
          requestId: data.error?.requestId ?? null
        });
      }

      return data;
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.warn('API request failed', {
          method: options.method || 'GET',
          status: Number.isInteger(error?.status) ? error.status : null,
          code: typeof error?.code === 'string' && /^[A-Z0-9_]{1,32}$/.test(error.code) ? error.code : null,
          requestId: typeof error?.requestId === 'string' && /^[a-zA-Z0-9._:-]{1,128}$/.test(error.requestId)
            ? error.requestId
            : null
        });
      }
      throw error;
    }
  },

  get(endpoint, options = {}) {
    return this.fetchApi(endpoint, { ...options, method: 'GET' });
  },

  post(endpoint, body, options = {}) {
    return this.fetchApi(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body, options = {}) {
    return this.fetchApi(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint, options = {}) {
    return this.fetchApi(endpoint, { ...options, method: 'DELETE' });
  },
};

export function getBuildings({ page = 1, pageSize = 12, q, facility, facilityIds, minCapacity, publicRental, purpose } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  for (const [key, value] of Object.entries({ q, facility, minCapacity, publicRental, purpose })) {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  }
  for (const facilityId of facilityIds ?? []) params.append('facilityIds', facilityId);
  return apiClient.get(`/buildings?${params}`, { cache: 'no-store' });
}

export function getAdminBuildings({ page = 1, pageSize = 100 } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiClient.get(`/admin/buildings?${params}`, { cache: 'no-store' });
}

export function getAdminBookingSummary() {
  return apiClient.get('/admin/bookings/summary', { cache: 'no-store' });
}

export function getAdminBookings({ page = 1, pageSize = 20, status, category, search, sort } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) params.set('status', status);
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  if (sort) params.set('sort', sort);
  return apiClient.get(`/admin/bookings?${params}`, { cache: 'no-store' });
}

export function getAdminBookingDetail(identifier) {
  return apiClient.get(`/admin/bookings/${encodeURIComponent(identifier)}`, { cache: 'no-store' });
}

export function getAdminUsage({ page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiClient.get(`/admin/usage?${params}`, { cache: 'no-store' });
}

export function getAdminUsageHistory({ page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiClient.get(`/admin/usage/history?${params}`, { cache: 'no-store' });
}

export function recordKeyHandover(bookingId, data = {}) {
  return apiClient.post(`/bookings/${encodeURIComponent(bookingId)}/handover`, data);
}

export function recordKeyReturn(bookingId, data = {}) {
  return apiClient.fetchApi(`/bookings/${encodeURIComponent(bookingId)}/handover`, {
    method: 'PATCH', body: JSON.stringify(data)
  });
}

export function completeAdminBooking(bookingId) {
  return apiClient.post(`/bookings/${encodeURIComponent(bookingId)}/complete`, {});
}

export function getAdminPendingPayments({ page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiClient.get(`/admin/payments?${params}`, { cache: 'no-store' });
}

export function verifyAdminPayment(paymentId, note = '') {
  return apiClient.post(`/payments/${encodeURIComponent(paymentId)}/verify`, { note });
}

export function rejectAdminPayment(paymentId, reason) {
  return apiClient.post(`/payments/${encodeURIComponent(paymentId)}/reject`, { reason });
}

export function createBuilding(data) {
  return apiClient.post('/buildings', data);
}

export function updateBuilding(slug, data) {
  return apiClient.fetchApi(`/buildings/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export function getFacilities({ page = 1, pageSize = 100 } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiClient.get(`/facilities?${params}`, { cache: 'no-store' });
}

export function saveFacility(data, id) {
  return id
    ? apiClient.fetchApi(`/facilities/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) })
    : apiClient.post('/facilities', data);
}

export function deleteFacility(id) {
  return apiClient.delete(`/facilities/${encodeURIComponent(id)}`);
}

export function attachFacilityToBuilding(slug, data) {
  return apiClient.post(`/buildings/${encodeURIComponent(slug)}/facilities`, data);
}

export function updateBuildingFacility(slug, facilityId, detail) {
  return apiClient.fetchApi(`/buildings/${encodeURIComponent(slug)}/facilities/${encodeURIComponent(facilityId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ detail })
  });
}

export function detachFacilityFromBuilding(slug, facilityId) {
  return apiClient.delete(`/buildings/${encodeURIComponent(slug)}/facilities/${encodeURIComponent(facilityId)}`);
}

export function getBuildingBlocks(slug, { page = 1, pageSize = 100 } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiClient.get(`/buildings/${encodeURIComponent(slug)}/blocks?${params}`, { cache: 'no-store' });
}

export function createBuildingBlock(slug, data) {
  return apiClient.post(`/buildings/${encodeURIComponent(slug)}/blocks`, data);
}

export function deleteBuildingBlock(slug, id) {
  return apiClient.delete(`/buildings/${encodeURIComponent(slug)}/blocks/${encodeURIComponent(id)}`);
}

export function getAdminBuildingRates(slug, { page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiClient.get(`/admin/buildings/${encodeURIComponent(slug)}/rates?${params}`, { cache: 'no-store' });
}

export function createAdminBuildingRate(slug, data) {
  return apiClient.post(`/admin/buildings/${encodeURIComponent(slug)}/rates`, data);
}

export function updateAdminBuildingRate(slug, id, data) {
  return apiClient.fetchApi(`/admin/buildings/${encodeURIComponent(slug)}/rates/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(data)
  });
}

export async function getBuilding(identifier) {
  const payload = await apiClient.get(`/buildings/${encodeURIComponent(identifier)}`, { cache: 'no-store' });
  return payload.data;
}

export async function getBuildingTerms(identifier) {
  const payload = await apiClient.get(`/buildings/${encodeURIComponent(identifier)}/terms`, { cache: 'no-store' });
  return payload.data;
}

export function getAvailability({ buildingId, startDate, endDate }) {
  const params = new URLSearchParams({
    buildingId,
    startDate: new Date(startDate).toISOString(),
    endDate: new Date(endDate).toISOString()
  });
  return apiClient.get(`/availability?${params}`, { cache: 'no-store' });
}

export function getMyBookings({ page = 1, pageSize = 20, status } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (status) params.set('status', status);
  return apiClient.get(`/bookings?${params}`, { cache: 'no-store' });
}

export function getMyBookingSummary() {
  return apiClient.get('/bookings/summary', { cache: 'no-store' });
}

export function getBookingDetail(identifier) {
  return apiClient.get(`/bookings/${encodeURIComponent(identifier)}`, { cache: 'no-store' });
}

export function createBooking(data) {
  return apiClient.post('/bookings', data);
}

export function submitStudentBooking(identifier) {
  return apiClient.post(`/bookings/${encodeURIComponent(identifier)}/submit`, {});
}

export function reviseStudentBooking(identifier, data) {
  return apiClient.post(`/bookings/${encodeURIComponent(identifier)}/revise`, data);
}

export function recordManualPayment(identifier, reference) {
  return apiClient.post(`/bookings/${encodeURIComponent(identifier)}/payments`, { reference });
}

export function getPaymentProofFileError(file) {
  if (!file) return 'Pilih satu bukti pembayaran.';
  if (!Number.isInteger(file.size) || file.size < 8 || file.size > 5 * 1024 * 1024) {
    return 'Bukti pembayaran harus berukuran minimal 8 byte dan maksimal 5 MB.';
  }
  if (typeof file.name !== 'string' || file.name.length > 255) {
    return 'Nama file bukti pembayaran terlalu panjang.';
  }
  const extensions = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png']
  }[file.type];
  if (!extensions?.some((extension) => file.name?.toLowerCase().endsWith(extension))) {
    return 'Pilih satu file PDF, JPG, atau PNG yang sesuai dengan tipenya.';
  }
  return null;
}

export async function uploadPaymentProof(paymentId, file) {
  const developmentUserId = process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_DEV_USER_ID
    : undefined;
  if (!developmentUserId) {
    throw new ApiRequestError('Unggah bukti pembayaran hanya tersedia pada konfigurasi development.', 403);
  }
  const fileError = getPaymentProofFileError(file);
  if (fileError) throw new ApiRequestError(fileError, 400);
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${API_BASE_URL}/payments/${encodeURIComponent(paymentId)}/proof`, {
    method: 'POST',
    headers: { 'x-user-id': developmentUserId },
    body
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiRequestError('Respons unggah bukti pembayaran tidak valid.', response.status);
  }
  if (!response.ok) {
    throw new ApiRequestError(payload.error?.message || 'Unggah bukti pembayaran gagal.', response.status, {
      code: payload.error?.code ?? null,
      requestId: payload.error?.requestId ?? null
    });
  }
  return payload;
}

export async function downloadPaymentProof(paymentId) {
  const developmentUserId = process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_DEV_USER_ID
    : undefined;
  if (!developmentUserId) {
    throw new ApiRequestError('Unduh bukti pembayaran hanya tersedia pada konfigurasi development.', 403);
  }
  const response = await fetch(`${API_BASE_URL}/payments/${encodeURIComponent(paymentId)}/proof`, {
    headers: { 'x-user-id': developmentUserId },
    cache: 'no-store'
  });
  if (!response.ok) {
    let payload = null;
    try { payload = await response.json(); } catch { /* empty or invalid error response */ }
    throw new ApiRequestError(payload?.error?.message || 'Unduh bukti pembayaran gagal.', response.status, {
      code: payload?.error?.code ?? null,
      requestId: payload?.error?.requestId ?? null
    });
  }
  return response.blob();
}

export function reviewAdminBooking(identifier, action, note = '') {
  return apiClient.post(`/admin/bookings/${encodeURIComponent(identifier)}/review`, { action, note });
}

export function getMyPendingApprovals({ page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiClient.get(`/approvals?${params}`, { cache: 'no-store' });
}

export function decideApproval(identifier, decision, note) {
  const endpoint = decision === 'REJECT' ? 'reject' : 'approve';
  return apiClient.post(`/bookings/${encodeURIComponent(identifier)}/${endpoint}`,
    decision === 'REJECT' ? { reason: note } : { note });
}

export async function uploadStudentDocument(identifier, file) {
  const developmentUserId = process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_DEV_USER_ID
    : undefined;
  if (!developmentUserId) {
    throw new ApiRequestError('Unggah berkas hanya tersedia pada konfigurasi development.', 403);
  }
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(identifier)}/documents`, {
    method: 'POST',
    headers: { 'x-user-id': developmentUserId },
    body
  });
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiRequestError('Respons unggah berkas tidak valid.', response.status);
  }
  if (!response.ok) {
    throw new ApiRequestError(payload.error?.message || 'Unggah berkas gagal.', response.status, {
      code: payload.error?.code ?? null,
      requestId: payload.error?.requestId ?? null
    });
  }
  return payload;
}

export async function downloadStudentDocument(bookingId, documentId) {
  const developmentUserId = process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_DEV_USER_ID
    : undefined;
  if (!developmentUserId) {
    throw new ApiRequestError('Unduh berkas hanya tersedia pada konfigurasi development.', 403);
  }
  const response = await fetch(`${API_BASE_URL}/bookings/${encodeURIComponent(bookingId)}/documents/${encodeURIComponent(documentId)}`, {
    headers: { 'x-user-id': developmentUserId },
    cache: 'no-store'
  });
  if (!response.ok) {
    let payload = null;
    try { payload = await response.json(); } catch { /* empty or invalid error response */ }
    throw new ApiRequestError(payload?.error?.message || 'Unduh berkas gagal.', response.status, {
      code: payload?.error?.code ?? null,
      requestId: payload?.error?.requestId ?? null
    });
  }
  return response.blob();
}

export function cancelBooking(identifier, reason = '') {
  return apiClient.post(`/bookings/${encodeURIComponent(identifier)}/cancel`, { reason });
}

export function getNotifications({ page = 1, pageSize = 20, signal } = {}) {
  const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  return apiClient.get(`/notifications?${params}`, { cache: 'no-store', signal });
}

export function markNotificationRead(identifier) {
  return apiClient.post(`/notifications/${encodeURIComponent(identifier)}/read`, {});
}
