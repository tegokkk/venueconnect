import 'dotenv/config';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const databaseUrl = new URL(process.env.DATABASE_URL ?? '');
const apiBase = new URL(process.env.VENUECONNECT_TEST_API_BASE ?? 'http://localhost:3001/api/v1');
const healthUrl = new URL(process.env.VENUECONNECT_TEST_HEALTH_URL ?? 'http://localhost:3001/api/health');
if (!['localhost', '127.0.0.1'].includes(databaseUrl.hostname)
  || databaseUrl.pathname !== '/venueconnect_db'
  || !['localhost', '127.0.0.1'].includes(apiBase.hostname)
  || !['localhost', '127.0.0.1'].includes(healthUrl.hostname)) {
  throw new Error('Integration checks only run against local VenueConnect development services');
}

const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
let temporaryRateId = null;
const users = Object.fromEntries((await client.query('SELECT id, email FROM "User"')).rows.map(({ email, id }) => [email, id]));
const student = users['mahasiswa@students.polinela.ac.id'];
const staff = users['pegawai-demo@polinela.ac.id'];
const publicUser = users['publik-demo@example.invalid'];
const admin = users['admin@polinela.ac.id'];
const approver = users['approver-demo@polinela.ac.id'];
const verifier = users['verifier-demo@polinela.ac.id'];
const officer = users['petugas-demo@polinela.ac.id'];
assert.ok([student, staff, publicUser, admin, approver, verifier, officer].every(Boolean), 'Run the development seed first');

let baseTime = Date.now() + 30 * 86_400_000;
function slot(offset) {
  const startsAt = new Date(baseTime + offset * 86_400_000);
  startsAt.setUTCHours(2, 0, 0, 0);
  return {
    startsAt: startsAt.toISOString(),
    endsAt: new Date(startsAt.getTime() + 2 * 3_600_000).toISOString()
  };
}

async function request(path, { user, method = 'GET', body, expected = 200, raw = false } = {}) {
  const response = await fetch(new URL(path.replace(/^\//, ''), `${apiBase.href.replace(/\/$/, '')}/`), {
    method,
    headers: {
      ...(user ? { 'x-user-id': user } : {}),
      ...(body && !(body instanceof FormData) ? { 'content-type': 'application/json' } : {})
    },
    body: body instanceof FormData ? body : body === undefined ? undefined : JSON.stringify(body)
  });
  if (response.status !== expected) {
    const detail = await response.text();
    throw new Error(`${method} ${path}: expected ${expected}, got ${response.status}: ${detail.slice(0, 500)}`);
  }
  return raw ? response : response.json();
}

function bookingInput(buildingId, applicantCategory, dates, label) {
  return {
    buildingId,
    bookingType: applicantCategory === 'UMUM' ? 'RENTAL' : 'INTERNAL',
    applicantCategory,
    eventName: `Uji integrasi ${label}`,
    startsAt: dates.startsAt,
    endsAt: dates.endsAt,
    attendeeCount: 20
  };
}

async function uploadPdf(bookingId, label) {
  const body = new FormData();
  body.append('file', new File([Buffer.from('%PDF-1.4\n1 0 obj\n%%EOF\n')], `${label}.pdf`, { type: 'application/pdf' }));
  return (await request(`/bookings/${bookingId}/documents`, { user: student, method: 'POST', body, expected: 201 })).data;
}

try {
  const health = await fetch(healthUrl);
  assert.equal((await health.json()).db, 'connected');
  const catalog = (await request('/buildings?pageSize=100')).data;
  assert.equal(catalog.length, 15);
  assert.deepEqual(new Set(catalog.filter(({ internalLoanEnabled }) => internalLoanEnabled).map(({ slug }) => slug)),
    new Set(['gedung-cb', 'gedung-qb', 'gedung-sakura', 'gedung-gsg']));
  assert.equal(catalog.filter(({ publicRentalEnabled }) => publicRentalEnabled).length, 12);
  assert.ok(catalog.every(({ rates }) => rates.every(({ audienceType }) => audienceType === 'EXTERNAL')));
  const building = (await request('/buildings/gedung-gsg')).data;
  assert.ok(building.id);
  assert.equal(building.publicRentalEnabled, true);
  assert.equal(building.internalLoanEnabled, true);
  assert.equal(building.rates.length, 2);
  const terms = (await request('/buildings/gedung-gsg/terms')).data;
  assert.deepEqual(terms, { termsAndConditions: null, status: 'PENDING_POLICY' });
  const latestBooking = (await client.query('SELECT MAX("endsAt") AS latest FROM "Booking" WHERE "buildingId" = $1', [building.id])).rows[0].latest;
  baseTime = Math.max(baseTime, latestBooking ? new Date(latestBooking).getTime() + 7 * 86_400_000 : 0);
  const rentalStart = slot(2).startsAt;
  const applicableRate = await client.query(`SELECT id FROM "BuildingRate"
    WHERE "buildingId" = $1 AND "audienceType" IN ('EXTERNAL', 'ALL') AND "isActive" = true
      AND "validFrom" <= $2 AND ("validUntil" IS NULL OR "validUntil" > $2)
    LIMIT 1`, [building.id, rentalStart]);
  if (applicableRate.rowCount === 0) {
    temporaryRateId = randomUUID();
    await client.query(`INSERT INTO "BuildingRate"
      (id, "buildingId", name, "audienceType", amount, currency, unit, "validFrom", "isActive", "updatedAt")
      VALUES ($1, $2, $3, 'EXTERNAL', 1000, 'IDR', 'uji', NOW(), true, NOW())`,
    [temporaryRateId, building.id, 'Tarif simulasi integrasi']);
  }
  console.log('OK: health, inventaris 15/4/12, tarif publik, draf syarat privat, dan koneksi database');

  const studentDates = slot(0);
  const studentBooking = (await request('/bookings', {
    user: student, method: 'POST', expected: 201,
    body: bookingInput(building.id, 'MAHASISWA', studentDates, 'mahasiswa')
  })).data;
  assert.equal(studentBooking.status, 'DRAFT');
  const document = await uploadPdf(studentBooking.id, 'awal');
  await request(`/bookings/${studentBooking.id}`, { user: staff, expected: 404 });
  await request(`/bookings/${studentBooking.id}/documents/${document.id}`, { user: staff, expected: 404 });
  const adminDocument = await request(`/bookings/${studentBooking.id}/documents/${document.id}`, { user: admin, raw: true });
  assert.match(await adminDocument.text(), /^%PDF-/);
  await request(`/bookings/${studentBooking.id}/submit`, { user: student, method: 'POST', body: {} });
  await request(`/admin/bookings/${studentBooking.id}/review`, { user: admin, method: 'POST', body: { action: 'START_REVIEW' } });
  await request(`/admin/bookings/${studentBooking.id}/review`, { user: admin, method: 'POST', body: { action: 'REQUEST_REVISION', note: 'Ganti berkas uji' } });
  await uploadPdf(studentBooking.id, 'revisi');
  await request(`/bookings/${studentBooking.id}/revise`, { user: student, method: 'POST', body: { note: 'Berkas uji diperbaiki' } });
  await request(`/admin/bookings/${studentBooking.id}/review`, { user: admin, method: 'POST', body: { action: 'START_REVIEW' } });
  const studentDecision = await request(`/admin/bookings/${studentBooking.id}/review`, { user: admin, method: 'POST', body: { action: 'CONFIRM_STUDENT' } });
  assert.equal(studentDecision.data.status, 'CONFIRMED');
  await request('/bookings', {
    user: staff, method: 'POST', expected: 409,
    body: bookingInput(building.id, 'DOSEN_PEGAWAI', studentDates, 'slot terisi')
  });
  const calendar = (await request(`/availability?buildingId=${building.id}&startDate=${encodeURIComponent(studentDates.startsAt)}&endDate=${encodeURIComponent(studentDates.endsAt)}`)).data;
  assert.ok(calendar.unavailableSlots?.length >= 1);
  assert.ok(!JSON.stringify(calendar).includes(studentBooking.eventName));
  console.log('OK: mahasiswa, PDF privat, revisi, review tanpa WD III, konflik, dan privasi kalender');

  await request('/bookings', {
    user: staff, method: 'POST', expected: 400,
    body: bookingInput(building.id, 'MAHASISWA', slot(1), 'kategori palsu')
  });
  const staffBooking = (await request('/bookings', {
    user: staff, method: 'POST', expected: 201,
    body: bookingInput(building.id, 'DOSEN_PEGAWAI', slot(1), 'pegawai')
  })).data;
  await request(`/admin/bookings/${staffBooking.id}/review`, { user: admin, method: 'POST', body: { action: 'START_REVIEW' } });
  await request(`/admin/bookings/${staffBooking.id}/review`, { user: admin, method: 'POST', body: { action: 'FORWARD' } });
  await request('/approvals', { user: student, expected: 403 });
  await request('/approvals', { user: admin });
  const approverQueue = (await request('/approvals', { user: approver })).data;
  assert.ok(approverQueue.some((step) => step.booking.id === staffBooking.id));
  await request(`/bookings/${staffBooking.id}/approve`, { user: staff, method: 'POST', body: {}, expected: 403 });
  const staffDecision = await request(`/bookings/${staffBooking.id}/approve`, { user: approver, method: 'POST', body: { note: 'Disetujui pada data uji' } });
  assert.equal(staffDecision.data.status, 'CONFIRMED');
  const staffOverride = (await request('/bookings', {
    user: staff, method: 'POST', expected: 201,
    body: bookingInput(building.id, 'DOSEN_PEGAWAI', slot(4), 'override admin')
  })).data;
  await request(`/admin/bookings/${staffOverride.id}/review`, { user: admin, method: 'POST', body: { action: 'START_REVIEW' } });
  await request(`/admin/bookings/${staffOverride.id}/review`, { user: admin, method: 'POST', body: { action: 'FORWARD' } });
  const overrideDecision = await request(`/bookings/${staffOverride.id}/approve`, { user: admin, method: 'POST', body: { note: 'Override admin uji' } });
  assert.equal(overrideDecision.data.status, 'CONFIRMED');
  console.log('OK: kategori akun, routing pegawai, antrean approver, dan batas role');

  const rental = (await request('/bookings', {
    user: publicUser, method: 'POST', expected: 201,
    body: bookingInput(building.id, 'UMUM', slot(2), 'sewa publik')
  })).data;
  await request(`/admin/bookings/${rental.id}/review`, { user: admin, method: 'POST', body: { action: 'START_REVIEW' } });
  await request(`/admin/bookings/${rental.id}/review`, { user: admin, method: 'POST', body: { action: 'FORWARD' } });
  const rentalDecision = await request(`/bookings/${rental.id}/approve`, { user: approver, method: 'POST', body: {} });
  assert.equal(rentalDecision.data.status, 'AWAITING_PAYMENT');
  const firstPayment = (await request(`/bookings/${rental.id}/payments`, { user: publicUser, method: 'POST', expected: 201, body: { reference: 'TEST-TRANSFER-1' } })).data;
  assert.equal(firstPayment.proof, null);
  const invalidProof = new FormData();
  invalidProof.append('file', new File([Buffer.from('bukan gambar')], 'palsu.png', { type: 'image/png' }));
  await request(`/payments/${firstPayment.id}/proof`, { user: publicUser, method: 'POST', body: invalidProof, expected: 400 });
  const proofBytes = Buffer.from('%PDF-1.4\n1 0 obj\n%%EOF\n');
  const proofForm = new FormData();
  proofForm.append('file', new File([proofBytes], 'transfer-pribadi.pdf', { type: 'application/pdf' }));
  await request(`/payments/${firstPayment.id}/proof`, { user: staff, method: 'POST', body: proofForm, expected: 404 });
  await request(`/payments/${firstPayment.id}/proof`, { user: admin, method: 'POST', body: proofForm, expected: 404 });
  const uploadedProof = (await request(`/payments/${firstPayment.id}/proof`, {
    user: publicUser, method: 'POST', body: proofForm, expected: 201
  })).data;
  assert.equal(uploadedProof.fileName, 'bukti-pembayaran.pdf');
  assert.equal(uploadedProof.fileSize, proofBytes.length);
  assert.equal(uploadedProof.mimeType, 'application/pdf');
  assert.ok(uploadedProof.uploadedAt);
  await request(`/payments/${firstPayment.id}/proof`, { user: staff, expected: 404 });
  await request(`/payments/${firstPayment.id}/proof`, { user: admin, expected: 404 });
  for (const reader of [publicUser, verifier]) {
    const downloaded = await request(`/payments/${firstPayment.id}/proof`, { user: reader, raw: true });
    assert.equal(downloaded.headers.get('content-type'), 'application/pdf');
    assert.match(downloaded.headers.get('cache-control') ?? '', /no-store/);
    assert.deepEqual(Buffer.from(await downloaded.arrayBuffer()), proofBytes);
  }
  const paymentWithProof = (await request(`/bookings/${rental.id}`, { user: publicUser })).data.payments
    .find(({ id }) => id === firstPayment.id);
  assert.deepEqual(paymentWithProof.proof, uploadedProof);
  assert.ok(!Object.hasOwn(paymentWithProof, 'proofStorageKey'));
  const privateProofKey = (await client.query('SELECT "proofStorageKey" FROM "Payment" WHERE id = $1', [firstPayment.id])).rows[0].proofStorageKey;
  assert.ok(privateProofKey);
  assert.ok(!JSON.stringify(paymentWithProof).includes(privateProofKey));
  const paymentRecipients = (await client.query('SELECT "userId" FROM "Notification" WHERE "resourceType" = $1 AND "resourceId" = $2 AND "type" = $3', ['Payment', firstPayment.id, 'PAYMENT_PENDING_VERIFICATION'])).rows.map(({ userId }) => userId);
  assert.ok(paymentRecipients.includes(verifier));
  assert.ok(!paymentRecipients.includes(admin));
  await request('/admin/payments', { user: admin, expected: 403 });
  const retryPayment = (await request(`/bookings/${rental.id}/payments`, { user: publicUser, method: 'POST', expected: 201, body: { reference: 'TEST-TRANSFER-1' } })).data;
  assert.equal(retryPayment.id, firstPayment.id);
  await request(`/payments/${firstPayment.id}/verify`, { user: staff, method: 'POST', expected: 403, body: {} });
  await request(`/payments/${firstPayment.id}/verify`, { user: admin, method: 'POST', expected: 403, body: {} });
  await request(`/payments/${firstPayment.id}/reject`, { user: verifier, method: 'POST', body: { reason: 'Referensi tidak cocok pada data uji' } });
  await request(`/payments/${firstPayment.id}/proof`, { user: publicUser, method: 'POST', body: proofForm, expected: 409 });
  const secondPayment = (await request(`/bookings/${rental.id}/payments`, { user: publicUser, method: 'POST', expected: 201, body: { reference: 'TEST-TRANSFER-2' } })).data;
  await request(`/payments/${secondPayment.id}/verify`, { user: verifier, method: 'POST', body: { note: 'Cocok pada data uji' } });
  await request('/admin/usage', { user: student, expected: 403 });
  const firstUsagePage = await request('/admin/usage?pageSize=100', { user: officer });
  let rentalVisibleToOfficer = firstUsagePage.data.some((booking) => booking.id === rental.id);
  for (let page = 2; page <= firstUsagePage.meta.totalPages && !rentalVisibleToOfficer; page += 1) {
    const nextUsagePage = await request(`/admin/usage?page=${page}&pageSize=100`, { user: officer });
    rentalVisibleToOfficer = nextUsagePage.data.some((booking) => booking.id === rental.id);
  }
  assert.ok(rentalVisibleToOfficer);
  await request(`/bookings/${rental.id}/complete`, { user: officer, method: 'POST', expected: 403, body: {} });
  await request(`/bookings/${rental.id}/handover`, { user: publicUser, method: 'POST', expected: 403, body: { conditionBefore: 'Tidak berwenang' } });
  await request(`/bookings/${rental.id}/handover`, { user: admin, method: 'POST', expected: 403, body: { conditionBefore: 'Tidak berwenang' } });
  await request(`/bookings/${rental.id}/handover`, { user: officer, method: 'POST', expected: 201, body: { conditionBefore: 'Baik' } });
  await request(`/bookings/${rental.id}/handover`, { user: officer, method: 'PATCH', body: { conditionAfter: 'Baik' } });
  const completed = await request(`/bookings/${rental.id}/complete`, { user: admin, method: 'POST', body: {} });
  assert.equal(completed.data.status, 'COMPLETED');
  console.log('OK: sewa publik, pembayaran manual, penolakan, verifikasi, serah-terima, penyelesaian');

  const concurrentDates = slot(3);
  const concurrentBookings = await Promise.all([1, 2].map(async (index) => {
    const booking = (await request('/bookings', {
      user: student, method: 'POST', expected: 201,
      body: bookingInput(building.id, 'MAHASISWA', concurrentDates, `konflik ${index}`)
    })).data;
    await uploadPdf(booking.id, `konflik-${index}`);
    await request(`/bookings/${booking.id}/submit`, { user: student, method: 'POST', body: {} });
    await request(`/admin/bookings/${booking.id}/review`, { user: admin, method: 'POST', body: { action: 'START_REVIEW' } });
    return booking.id;
  }));
  const decisions = await Promise.all(concurrentBookings.map(async (id) => {
    const response = await fetch(new URL(`admin/bookings/${id}/review`, `${apiBase.href.replace(/\/$/, '')}/`), {
      method: 'POST',
      headers: { 'x-user-id': admin, 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'CONFIRM_STUDENT' })
    });
    return response.status;
  }));
  assert.deepEqual(decisions.sort(), [200, 409]);
  console.log('OK: dua keputusan bersamaan hanya mengunci satu slot');

  const audit = await client.query('SELECT action, metadata::text AS metadata FROM "AuditEvent" WHERE "entityType" = $1', ['BookingDocument']);
  assert.ok(audit.rows.length >= 1);
  assert.ok(audit.rows.every(({ metadata }) => !metadata.includes('%PDF-')));
  console.log('OK: audit dokumen tidak menyimpan isi PDF');
  console.log('Integrasi development selesai; data uji dipertahankan dalam database lokal.');
} finally {
  if (temporaryRateId) {
    await client.query('DELETE FROM "BuildingRate" WHERE id = $1', [temporaryRateId]);
  }
  await client.end();
}
