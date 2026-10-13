#!/usr/bin/env node
// One-time correction for synthetic bookings written before PrismaPg used UTC sessions.
import pg from '../backend/node_modules/pg/lib/index.js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const { Client } = pg;

const envPath = path.resolve('backend/.env');
const envText = await readFile(envPath, 'utf8');
const databaseLine = envText.split(/\r?\n/).find((line) => line.startsWith('DATABASE_URL='));
if (!databaseLine) throw new Error('DATABASE_URL is required in backend/.env');
const databaseUrl = databaseLine.slice('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');
const target = new URL(databaseUrl);
if (process.env.NODE_ENV === 'production' || !['localhost', '127.0.0.1'].includes(target.hostname)
  || target.pathname !== '/venueconnect_db') {
  throw new Error('Only the local VenueConnect development database may be repaired');
}

const db = new Client({ connectionString: databaseUrl, options: '-c TimeZone=UTC' });
await db.connect();
let inTransaction = false;
try {
  const inventory = await db.query(`
    SELECT COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE b."eventName" LIKE 'Uji integrasi %' AND u.email IN
        ('mahasiswa@students.polinela.ac.id', 'pegawai-demo@polinela.ac.id', 'publik-demo@example.invalid'))::int AS synthetic,
      COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM b."startsAt" AT TIME ZONE 'Asia/Jakarta') = 2
        AND EXTRACT(HOUR FROM b."endsAt" AT TIME ZONE 'Asia/Jakarta') = 4)::int AS shifted,
      COUNT(*) FILTER (WHERE EXTRACT(HOUR FROM b."startsAt" AT TIME ZONE 'Asia/Jakarta') = 9
        AND EXTRACT(HOUR FROM b."endsAt" AT TIME ZONE 'Asia/Jakarta') = 11)::int AS corrected
    FROM "Booking" b JOIN "User" u ON u.id = b."requesterId"`);
  const counts = inventory.rows[0];
  const blocks = await db.query('SELECT COUNT(*)::int AS total FROM "BuildingBlock"');
  if (blocks.rows[0].total !== 0 || counts.total !== counts.synthetic) {
    throw new Error('Non-demo bookings or blocks exist; manual provenance review is required');
  }
  if (counts.total === 0 || counts.corrected === counts.total) {
    console.log(`DEMO_TIMEZONE_REPAIR_SKIP bookings=${counts.total}`);
    process.exitCode = 0;
  } else {
    if (counts.shifted !== counts.total) {
      throw new Error('Mixed booking timestamps detected; refusing an automatic adjustment');
    }
    await db.query('BEGIN');
    inTransaction = true;
    const predicate = `"bookingId" IN (SELECT id FROM "Booking" WHERE "eventName" LIKE 'Uji integrasi %')`;
    await db.query(`UPDATE "Booking" SET "startsAt" = "startsAt" + interval '7 hours',
      "endsAt" = "endsAt" + interval '7 hours',
      "paymentDueAt" = "paymentDueAt" + interval '7 hours',
      "cancelledAt" = "cancelledAt" + interval '7 hours',
      "updatedAt" = "updatedAt" + interval '7 hours'
      WHERE "eventName" LIKE 'Uji integrasi %'`);
    await db.query(`UPDATE "ApprovalStep" SET "updatedAt" = "updatedAt" + interval '7 hours' WHERE ${predicate}`);
    await db.query(`UPDATE "BookingDocument" SET "updatedAt" = "updatedAt" + interval '7 hours' WHERE ${predicate}`);
    await db.query(`UPDATE "Payment" SET "verifiedAt" = "verifiedAt" + interval '7 hours',
      "dueAt" = "dueAt" + interval '7 hours', "updatedAt" = "updatedAt" + interval '7 hours' WHERE ${predicate}`);
    await db.query(`UPDATE "UsageHandover" SET "keyGivenAt" = "keyGivenAt" + interval '7 hours',
      "keyReturnedAt" = "keyReturnedAt" + interval '7 hours',
      "updatedAt" = "updatedAt" + interval '7 hours' WHERE ${predicate}`);
    await db.query(`UPDATE "Notification" SET "readAt" = "readAt" + interval '7 hours'
      WHERE "resourceType" = 'Booking' AND "resourceId" IN
        (SELECT id::text FROM "Booking" WHERE "eventName" LIKE 'Uji integrasi %')`);
    const after = await db.query(`SELECT COUNT(*)::int AS corrected FROM "Booking"
      WHERE EXTRACT(HOUR FROM "startsAt" AT TIME ZONE 'Asia/Jakarta') = 9
        AND EXTRACT(HOUR FROM "endsAt" AT TIME ZONE 'Asia/Jakarta') = 11`);
    if (after.rows[0].corrected !== counts.total) throw new Error('Corrected booking times did not match the fixture');
    await db.query('COMMIT');
    inTransaction = false;
    console.log(`DEMO_TIMEZONE_REPAIR_OK bookings=${counts.total}`);
  }
} catch (error) {
  if (inTransaction) await db.query('ROLLBACK');
  throw error;
} finally {
  await db.end();
}
