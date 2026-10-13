import assert from 'node:assert/strict';
import test from 'node:test';
import { isApplicantCategoryAllowed } from '../src/server/validations/applicant-category.validation.js';

test('account category allows only the server-assigned internal category', () => {
  const student = { userType: 'INTERNAL', accountCategory: 'MAHASISWA' };
  assert.equal(isApplicantCategoryAllowed(student, 'MAHASISWA'), true);
  assert.equal(isApplicantCategoryAllowed(student, 'DOSEN_PEGAWAI'), false);
  assert.equal(isApplicantCategoryAllowed(student, 'UMUM'), false);
  assert.equal(isApplicantCategoryAllowed({ userType: 'INTERNAL', accountCategory: null }, 'MAHASISWA'), false);
});

test('public applicants cannot claim an internal category', () => {
  const publicAccount = { userType: 'EXTERNAL', accountCategory: 'UMUM' };
  assert.equal(isApplicantCategoryAllowed(publicAccount, 'UMUM'), true);
  assert.equal(isApplicantCategoryAllowed(publicAccount, 'MAHASISWA'), false);
  assert.equal(isApplicantCategoryAllowed({ userType: 'EXTERNAL', accountCategory: 'MAHASISWA' }, 'MAHASISWA'), false);
});
