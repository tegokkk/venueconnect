import 'dotenv/config';
import assert from 'node:assert/strict';
import { Client } from 'pg';

const databaseUrl = new URL(process.env.DATABASE_URL ?? '');
if (process.env.NODE_ENV === 'production'
  || !['localhost', '127.0.0.1'].includes(databaseUrl.hostname)
  || databaseUrl.pathname !== '/venueconnect_db') {
  throw new Error('Terms verification is restricted to the local development database');
}

const database = new Client({ connectionString: process.env.DATABASE_URL });
await database.connect();
let adminId;
let modified = false;
const baseUrl = 'http://localhost:3001/api/v1';

async function api(path, { method = 'GET', body, userId = adminId } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(userId ? { 'x-user-id': userId } : {}),
      ...(body ? { 'content-type': 'application/json' } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const payload = await response.json();
  assert.equal(response.status, 200, `${method} ${path}: ${payload.error?.code ?? response.status}`);
  return payload.data;
}

try {
  const admin = await database.query('SELECT id FROM "User" WHERE email = $1 AND "isActive" = true', ['admin@polinela.ac.id']);
  assert.equal(admin.rowCount, 1, 'Run the development seed first');
  adminId = admin.rows[0].id;
  const before = await database.query('SELECT "termsAndConditions", "termsApprovalReference", "termsPublishedAt" FROM "Building" WHERE slug = $1', ['gedung-gsg']);
  assert.equal(before.rowCount, 1);
  assert.deepEqual(before.rows[0], { termsAndConditions: null, termsApprovalReference: null, termsPublishedAt: null },
    'Do not overwrite existing building terms');

  modified = true;
  await api('/buildings/gedung-gsg', {
    method: 'PATCH',
    body: { termsAndConditions: 'Syarat uji sementara; bukan kebijakan resmi.', publishTerms: false }
  });
  assert.deepEqual(await api('/buildings/gedung-gsg/terms', { userId: null }),
    { termsAndConditions: null, status: 'PENDING_POLICY' });
  const publicDetail = await api('/buildings/gedung-gsg', { userId: null });
  assert.equal(Object.hasOwn(publicDetail, 'termsAndConditions'), false);
  const adminCatalog = await api('/admin/buildings?pageSize=100');
  assert.equal(adminCatalog.find(({ slug }) => slug === 'gedung-gsg').termsAndConditions,
    'Syarat uji sementara; bukan kebijakan resmi.');

  await api('/buildings/gedung-gsg', {
    method: 'PATCH',
    body: { termsApprovalReference: 'UJI-LOKAL', publishTerms: true }
  });
  assert.deepEqual(await api('/buildings/gedung-gsg/terms', { userId: null }),
    { termsAndConditions: 'Syarat uji sementara; bukan kebijakan resmi.', status: 'AVAILABLE' });

  await api('/buildings/gedung-gsg', {
    method: 'PATCH',
    body: { termsAndConditions: 'Syarat uji diubah; bukan kebijakan resmi.' }
  });
  assert.deepEqual(await api('/buildings/gedung-gsg/terms', { userId: null }),
    { termsAndConditions: null, status: 'PENDING_POLICY' });
  console.log('OK: draft privat, terbit eksplisit, dan pencabutan otomatis saat teks berubah');
} finally {
  try {
    if (modified && adminId) {
      await api('/buildings/gedung-gsg', {
        method: 'PATCH',
        body: { termsAndConditions: null, termsApprovalReference: null, publishTerms: false }
      });
      assert.deepEqual(await api('/buildings/gedung-gsg/terms', { userId: null }),
        { termsAndConditions: null, status: 'PENDING_POLICY' });
    }
  } finally {
    await database.end();
  }
}
