import 'dotenv/config';
import assert from 'node:assert/strict';
import { prisma } from '../src/server/db/prisma.js';
import { bookingService } from '../src/server/services/booking.service.js';
import { operatorReviewService } from '../src/server/services/operator-review.service.js';
import { approvalService } from '../src/server/services/approval.service.js';
import { paymentService } from '../src/server/services/payment.service.js';
import { bookingExpiryService } from '../src/server/services/booking-expiry.service.js';

const databaseUrl = new URL(process.env.DATABASE_URL ?? '');
if (process.env.NODE_ENV === 'production'
  || !['localhost', '127.0.0.1'].includes(databaseUrl.hostname)
  || databaseUrl.pathname !== '/venueconnect_db') {
  throw new Error('Expiry verification is restricted to the local development database');
}

let publicUser, adminUser, approverUser;
let building;
let booking1 = null;
let booking2 = null;

try {
  // 1. Fetch test users & building
  publicUser = await prisma.user.findUnique({ where: { email: 'publik-demo@example.invalid' } });
  adminUser = await prisma.user.findUnique({ where: { email: 'admin@polinela.ac.id' } });
  approverUser = await prisma.user.findUnique({ where: { email: 'approver-demo@polinela.ac.id' } });
  building = await prisma.building.findUnique({ where: { slug: 'gedung-gsg' } });

  assert.ok(publicUser, 'Public demo user required');
  assert.ok(adminUser, 'Admin demo user required');
  assert.ok(approverUser, 'Approver demo user required');
  assert.ok(building, 'Gedung GSG required');

  // Find latest booking date to ensure our test slot is completely open
  const latestBooking = await prisma.booking.findFirst({
    where: { buildingId: building.id },
    orderBy: { endsAt: 'desc' },
    select: { endsAt: true }
  });
  const baseTime = (latestBooking?.endsAt ? new Date(latestBooking.endsAt).getTime() : Date.now()) + 7 * 86_400_000;
  const startsAt = new Date(baseTime);
  startsAt.setUTCHours(2, 0, 0, 0);
  const endsAt = new Date(startsAt.getTime() + 3 * 3_600_000);

  console.log(`[TEST] Creating Booking 1 on slot: ${startsAt.toISOString()} - ${endsAt.toISOString()}`);
  const created1 = await bookingService.createBooking({
    buildingId: building.id,
    bookingType: 'RENTAL',
    applicantCategory: 'UMUM',
    eventName: 'Uji Expiry Booking 1',
    eventDescription: 'Pengujian pelepasan slot otomatis',
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    attendeeCount: 100
  }, publicUser.id);
  booking1 = created1;

  // Start review then forward to approval
  await operatorReviewService.decide(booking1.id, adminUser.id, 'START_REVIEW');
  const forwarded1 = await approvalService.forwardBookingForApproval(booking1.id, adminUser.id, 'Diteruskan ke approver');
  assert.equal(forwarded1.status, 'AWAITING_APPROVAL');

  // Approve with payment due in 2 hours
  const paymentDueAt = new Date(Date.now() + 2 * 3_600_000);
  const approved1 = await approvalService.approveBooking(booking1.id, approverUser.id, 'Disetujui, silakan bayar', {
    paymentDueAt: paymentDueAt.toISOString()
  });
  assert.equal(approved1.status, 'AWAITING_PAYMENT');
  assert.ok(approved1.paymentDueAt, 'paymentDueAt must be set');

  // Record manual payment
  const payment1 = await paymentService.recordManualPayment(booking1.id, publicUser.id, 'TRX-EXPIRY-001');
  assert.equal(payment1.status, 'PENDING_VERIFICATION');

  console.log('[TEST] Booking 1 is AWAITING_PAYMENT with slot locked. Verifying conflicting Booking 2 is rejected...');
  let creationConflictCaught = false;
  try {
    await bookingService.createBooking({
      buildingId: building.id,
      bookingType: 'RENTAL',
      applicantCategory: 'UMUM',
      eventName: 'Uji Expiry Booking 2 (Konflik)',
      eventDescription: 'Booking kedua yang berebut slot yang sama',
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      attendeeCount: 80
    }, publicUser.id);
  } catch (err) {
    creationConflictCaught = true;
    assert.equal(err.code, 'CONFLICT');
    console.log('[TEST] SUCCESS: Booking 2 was properly rejected because Booking 1 holds the slot!');
  }
  assert.equal(creationConflictCaught, true, 'Booking 2 must be rejected while slot is held by Booking 1');

  // Test expiring Booking 1 when deadline passes
  console.log('[TEST] Expiring Booking 1 with cutoff after paymentDueAt...');
  const futureCutoff = new Date(paymentDueAt.getTime() + 60_000);
  const expiryResult = await bookingExpiryService.expireOverdueBooking(booking1.id, {
    actorId: adminUser.id,
    cutoff: futureCutoff,
    reason: 'Uji otomatis kedaluwarsa pembayaran'
  });

  assert.equal(expiryResult.expired, true);
  assert.equal(expiryResult.alreadyExpired, false);
  assert.equal(expiryResult.booking.status, 'EXPIRED');

  // Verify Payment 1 was also expired
  const updatedPayment1 = await prisma.payment.findUnique({ where: { id: payment1.id } });
  assert.equal(updatedPayment1.status, 'EXPIRED');

  // Verify BookingStatusHistory
  const statusHistory = await prisma.bookingStatusHistory.findFirst({
    where: { bookingId: booking1.id, toStatus: 'EXPIRED' }
  });
  assert.ok(statusHistory, 'Status history for EXPIRED must exist');

  // Verify notification was sent
  const notification = await prisma.notification.findFirst({
    where: { userId: publicUser.id, resourceId: booking1.id, type: 'BOOKING_EXPIRED' }
  });
  assert.ok(notification, 'Requester must receive BOOKING_EXPIRED notification');

  // Idempotency: call expiry again on Booking 1
  const idempotentResult = await bookingExpiryService.expireOverdueBooking(booking1.id, { cutoff: futureCutoff });
  assert.equal(idempotentResult.expired, false);
  assert.equal(idempotentResult.alreadyExpired, true);
  console.log('[TEST] Idempotency verified: re-running expiry safely returns alreadyExpired');

  // Now verify slot is released! Booking 2 CAN NOW BE CREATED on that exact slot!
  console.log('[TEST] Creating Booking 2 on the newly released slot...');
  const created2 = await bookingService.createBooking({
    buildingId: building.id,
    bookingType: 'RENTAL',
    applicantCategory: 'UMUM',
    eventName: 'Uji Expiry Booking 2 (Slot Bebas)',
    eventDescription: 'Booking kedua mengambil slot yang telah bebas',
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    attendeeCount: 80
  }, publicUser.id);
  booking2 = created2;
  assert.equal(booking2.status, 'SUBMITTED');

  await operatorReviewService.decide(booking2.id, adminUser.id, 'START_REVIEW');
  await approvalService.forwardBookingForApproval(booking2.id, adminUser.id, 'Diteruskan ke approver');

  const approved2 = await approvalService.approveBooking(booking2.id, approverUser.id, 'Disetujui pada slot yang telah bebas', {
    paymentTtlHours: 24
  });
  assert.equal(approved2.status, 'AWAITING_PAYMENT');
  console.log('[TEST] SUCCESS: Booking 2 was successfully created & approved on the released slot!');

  // Test batch expiry query
  const batchResult = await bookingExpiryService.expireAllOverdueBookings({ cutoff: new Date() });
  assert.equal(typeof batchResult.totalFound, 'number');
  assert.equal(typeof batchResult.expiredCount, 'number');
  console.log(`[TEST] Batch expiry ran cleanly: found=${batchResult.totalFound} expired=${batchResult.expiredCount}`);

  console.log('ALL EXPIRY & SLOT RELEASE INTEGRATION CHECKS PASSED!');
} finally {
  // Clean up test bookings
  const idsToDelete = [booking1?.id, booking2?.id].filter(Boolean);
  if (idsToDelete.length) {
    await prisma.notification.deleteMany({ where: { resourceId: { in: idsToDelete } } });
    await prisma.auditEvent.deleteMany({ where: { entityId: { in: idsToDelete } } });
    await prisma.payment.deleteMany({ where: { bookingId: { in: idsToDelete } } });
    await prisma.approvalHistory.deleteMany({ where: { step: { bookingId: { in: idsToDelete } } } });
    await prisma.approvalStep.deleteMany({ where: { bookingId: { in: idsToDelete } } });
    await prisma.bookingStatusHistory.deleteMany({ where: { bookingId: { in: idsToDelete } } });
    await prisma.booking.deleteMany({ where: { id: { in: idsToDelete } } });
    console.log('[TEST] Cleaned up temporary test bookings.');
  }
  await prisma.$disconnect();
}
