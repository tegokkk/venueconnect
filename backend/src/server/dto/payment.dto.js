export function toPaymentProofDto(payment) {
  if (!payment.proofStorageKey) return null;
  return {
    fileName: payment.proofFileName,
    fileSize: payment.proofFileSize,
    mimeType: payment.proofMimeType,
    uploadedAt: payment.proofUploadedAt
  };
}

export function toPaymentDto(payment) {
  return {
    id: payment.id,
    amount: payment.amount.toString(),
    currency: payment.currency,
    method: payment.method,
    reference: payment.reference,
    reviewNote: payment.reviewNote,
    status: payment.status,
    verifiedAt: payment.verifiedAt,
    dueAt: payment.dueAt,
    proof: toPaymentProofDto(payment)
  };
}
