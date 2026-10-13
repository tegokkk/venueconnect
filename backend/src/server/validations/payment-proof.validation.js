import { ValidationError } from '../errors/index.js';

export const PAYMENT_PROOF_LIMIT_BYTES = 5 * 1024 * 1024;

const TYPES = {
  'application/pdf': { extensions: ['pdf'], savedName: 'bukti-pembayaran.pdf' },
  'image/jpeg': { extensions: ['jpg', 'jpeg'], savedName: 'bukti-pembayaran.jpg' },
  'image/png': { extensions: ['png'], savedName: 'bukti-pembayaran.png' }
};

export function validatePaymentProofFile(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || typeof file.name !== 'string') {
    throw new ValidationError('Exactly one payment proof file is required');
  }
  const type = TYPES[file.type];
  if (!type || file.size < 8 || file.size > PAYMENT_PROOF_LIMIT_BYTES) {
    throw new ValidationError('Payment proof must be a PDF, JPEG, or PNG of at most 5 MB');
  }
  const originalName = file.name.split(/[\\/]/).at(-1)?.replace(/[\x00-\x1f\x7f]/g, '').trim();
  const extension = originalName?.split('.').at(-1)?.toLowerCase();
  if (!originalName || originalName.length > 255 || !type.extensions.includes(extension)) {
    throw new ValidationError('Payment proof filename must match its PDF, JPEG, or PNG type');
  }
  return { fileName: type.savedName, mimeType: file.type };
}

export function validatePaymentProofContent(content, mimeType) {
  if (!Buffer.isBuffer(content) || content.length < 8 || content.length > PAYMENT_PROOF_LIMIT_BYTES) {
    throw new ValidationError('Payment proof must be a PDF, JPEG, or PNG of at most 5 MB');
  }
  const isPdf = mimeType === 'application/pdf' && content.subarray(0, 5).toString('ascii') === '%PDF-';
  const isJpeg = mimeType === 'image/jpeg'
    && content[0] === 0xff && content[1] === 0xd8 && content[2] === 0xff
    && content.at(-2) === 0xff && content.at(-1) === 0xd9;
  const isPng = mimeType === 'image/png'
    && content.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    && content.subarray(-8).equals(Buffer.from([73, 69, 78, 68, 174, 66, 96, 130]));
  if (!isPdf && !isJpeg && !isPng) {
    throw new ValidationError('Payment proof content does not match its declared file type');
  }
}
