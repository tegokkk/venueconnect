import test from 'node:test';
import assert from 'node:assert/strict';
import { containsSensitiveInput, createProcessRateLimiter } from '../src/server/ai/assistant-guard.js';

test('assistant privacy guard rejects labeled and disguised personal data', () => {
  for (const message of [
    'Nama: Budi Santoso',
    'Saya bernama Budi dan ingin meminjam GSG',
    'Alamat rumah: Jalan Melati 12',
    'Email saya budi\u200b@gmail.com',
    'Hubungi budi [at] gmail [dot] com',
    'NIM: 123456789',
    'NIK 1234 5678 9012 3456',
    'Nomor saya 0812-3456-7890'
  ]) {
    assert.equal(containsSensitiveInput(message), true, message);
  }
});

test('assistant privacy guard keeps ordinary public catalog questions available', () => {
  for (const message of [
    'Berapa harga sewa Gedung GSG?',
    'Apakah Gedung Sakura bisa dipinjam?',
    'Alamat Gedung CB di mana?'
  ]) {
    assert.equal(containsSensitiveInput(message), false, message);
  }
});

function request(ip) {
  return { headers: new Headers({ 'x-forwarded-for': ip }) };
}

test('process limiter bounds requests even with forged rotating IP headers', () => {
  const check = createProcessRateLimiter({ maxPerClient: 2, maxGlobal: 3, windowMs: 60_000 });
  assert.equal(check(request('192.0.2.1'), 1_000), null);
  assert.equal(check(request('192.0.2.2'), 1_000), null);
  assert.equal(check(request('192.0.2.3'), 1_000), null);
  assert.equal(check(request('192.0.2.4'), 1_000), 60);
  assert.equal(check(request('192.0.2.4'), 61_000), null);
});

test('process limiter collapses invalid or oversized client keys', () => {
  const check = createProcessRateLimiter({ maxPerClient: 1, maxGlobal: 10, windowMs: 60_000 });
  assert.equal(check(request('not-an-ip'), 1_000), null);
  assert.equal(check(request('x'.repeat(1_000)), 1_000), 60);
  assert.equal(check(request('not-an-ip'), 61_000), null);
});
