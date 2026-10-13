import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  STUDENT_PDF_LIMIT_BYTES,
  validatePdfContent,
  validateStudentPdf
} from '../src/server/validations/student-document.validation.js';
import { LocalStorageProvider } from '../src/server/storage/storage-provider.js';

const pdfBytes = Buffer.from('%PDF-1.7\n%%EOF');

test('student PDF validation accepts one small PDF and strips path segments', () => {
  const file = new File([pdfBytes], 'student.pdf', { type: 'application/pdf' });
  assert.equal(validateStudentPdf(file), 'student.pdf');
  assert.doesNotThrow(() => validatePdfContent(Buffer.from(pdfBytes)));
  assert.equal(validateStudentPdf({ ...file, name: '../student.pdf', size: file.size, type: file.type, arrayBuffer: () => file.arrayBuffer() }), 'student.pdf');
});

test('student PDF validation rejects wrong type, size, and forged content', () => {
  assert.throws(() => validateStudentPdf(new File([pdfBytes], 'student.txt', { type: 'text/plain' })), /PDF/);
  assert.throws(() => validateStudentPdf(new File([Buffer.alloc(STUDENT_PDF_LIMIT_BYTES + 1)], 'large.pdf', { type: 'application/pdf' })), /5 MB/);
  assert.throws(() => validatePdfContent(Buffer.from('not a PDF document')), /not a PDF/);
  assert.throws(() => validateStudentPdf(null), /one PDF/);
});

test('local document storage uses opaque keys without public URLs or traversal', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'venueconnect-private-'));
  try {
    const storage = new LocalStorageProvider(root);
    const key = await storage.upload(pdfBytes);
    assert.match(key, /^[0-9a-f-]{36}$/);
    assert.deepEqual(await storage.read(key), pdfBytes);
    assert.throws(() => storage.resolveKey('../outside'), /Invalid private storage key/);
    await assert.rejects(storage.getSignedUrl(key), /no signed URLs/);
    await storage.delete(key);
    await assert.rejects(storage.read(key), /ENOENT/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
