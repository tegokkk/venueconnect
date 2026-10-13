export function toUsageHandoverDto(handover) {
  return {
    id: handover.id,
    bookingId: handover.bookingId,
    keyGivenAt: handover.keyGivenAt,
    keyReturnedAt: handover.keyReturnedAt,
    conditionBefore: handover.conditionBefore,
    conditionAfter: handover.conditionAfter,
    notes: handover.notes,
    updatedAt: handover.updatedAt
  };
}
