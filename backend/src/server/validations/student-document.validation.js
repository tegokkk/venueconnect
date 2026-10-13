import { ValidationError } from '../errors/index.js';

export const STUDENT_PDF_LIMIT_BYTES = 5 * 1024 * 1024;

export function validateStudentPdf(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || typeof file.name !== 'string') {
    throw new ValidationError('Exactly one PDF file is required');
  }
  if (file.size < 8 || file.size > STUDENT_PDF_LIMIT_BYTES || file.type !== 'application/pdf') {
    throw new ValidationError('The student document must be a PDF of at most 5 MB');
  }
  const fileName = file.name.split(/[\\/]/).at(-1)?.replace(/[\x00-\x1f\x7f]/g, '').trim();
  if (!fileName || fileName.length > 255 || !fileName.toLowerCase().endsWith('.pdf')) {
    throw new ValidationError('A valid PDF filename is required');
  }
  return fileName;
}

export function validatePdfContent(content) {
  if (!Buffer.isBuffer(content) || content.length < 8 || content.length > STUDENT_PDF_LIMIT_BYTES) {
    throw new ValidationError('The student document must be a PDF of at most 5 MB');
  }
  if (content.subarray(0, 5).toString('ascii') !== '%PDF-') {
    throw new ValidationError('The uploaded file is not a PDF');
  }
}
