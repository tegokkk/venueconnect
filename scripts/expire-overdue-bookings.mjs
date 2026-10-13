import { existsSync } from 'node:fs';
import path from 'node:path';

if (!process.env.DATABASE_URL) {
  const candidatePaths = [path.resolve('.env'), path.resolve('backend/.env'), path.resolve('../backend/.env')];
  for (const p of candidatePaths) {
    if (existsSync(p)) {
      try {
        process.loadEnvFile(p);
        if (process.env.DATABASE_URL) break;
      } catch {
        // continue
      }
    }
  }
}

const { prisma } = await import('../backend/src/server/db/prisma.js');
const { bookingExpiryService } = await import('../backend/src/server/services/booking-expiry.service.js');

const databaseUrl = new URL(process.env.DATABASE_URL ?? '');
if (!['localhost', '127.0.0.1'].includes(databaseUrl.hostname) || databaseUrl.pathname !== '/venueconnect_db') {
  console.error('EXPIRE_FAIL reason=forbidden_environment database must be local venueconnect_db');
  process.exit(1);
}

const args = process.argv.slice(2);
let cutoff = new Date();
let forceId = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--cutoff' && args[i + 1]) {
    cutoff = new Date(args[++i]);
  } else if (args[i] === '--force-id' && args[i + 1]) {
    forceId = args[++i];
  }
}

try {
  if (forceId) {
    const res = await bookingExpiryService.expireOverdueBooking(forceId, {
      cutoff,
      force: true,
      reason: 'Batas waktu pembayaran kedaluwarsa (manual trigger script)'
    });
    console.log(`EXPIRE_SINGLE_OK bookingId=${forceId} expired=${res.expired} alreadyExpired=${res.alreadyExpired}`);
  } else {
    const res = await bookingExpiryService.expireAllOverdueBookings({ cutoff });
    console.log(`EXPIRE_BATCH_OK found=${res.totalFound} expired=${res.expiredCount} failed=${res.failedCount} cutoff=${res.cutoff}`);
    if (res.expiredBookingIds?.length) {
      console.log(`EXPIRED_IDS: ${res.expiredBookingIds.join(',')}`);
    }
  }
} catch (error) {
  console.error(`EXPIRE_ERROR: ${error.message}`);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
