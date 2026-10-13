export function lockBookingForUpdate(bookingId, database) {
  return database.$queryRaw`SELECT "id" FROM "Booking" WHERE "id" = ${bookingId} FOR UPDATE`;
}

export function lockPaymentForUpdate(paymentId, database) {
  return database.$queryRaw`SELECT "id" FROM "Payment" WHERE "id" = ${paymentId} FOR UPDATE`;
}
