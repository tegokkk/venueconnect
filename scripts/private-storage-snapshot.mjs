#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { chmod, copyFile, lstat, mkdir, open, readdir, readFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const MANIFEST_NAME = 'manifest.json';

async function digest(filePath) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest('hex');
}

async function secureDirectory(directory) {
  await mkdir(directory, { mode: 0o700 });
  if (process.platform !== 'win32') await chmod(directory, 0o700);
}

async function inspectFile(filePath, key) {
  const info = await lstat(filePath);
  if (!info.isFile() || info.isSymbolicLink() || info.size < 1 || info.size > MAX_FILE_BYTES) {
    throw new Error(`Private storage file ${key} is not a regular PDF-sized file.`);
  }
  return { size: info.size, sha256: await digest(filePath) };
}

async function requireKeysOnly(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (!KEY_PATTERN.test(entry.name) || !entry.isFile() || entry.isSymbolicLink()) {
      throw new Error('Private storage must contain only regular UUID-named files.');
    }
  }
  return entries.map((entry) => entry.name).sort();
}

async function create(sourceDirectory, archiveDirectory) {
  const source = path.resolve(sourceDirectory);
  const archive = path.resolve(archiveDirectory);
  if (source === archive || archive.startsWith(source + path.sep)) {
    throw new Error('Archive cannot be placed inside private storage.');
  }
  const sourceInfo = await lstat(source);
  if (!sourceInfo.isDirectory() || sourceInfo.isSymbolicLink()) {
    throw new Error('Private storage source must be a directory, not a symlink.');
  }
  const keys = await requireKeysOnly(source);
  await secureDirectory(archive);
  const filesDirectory = path.join(archive, 'files');
  await secureDirectory(filesDirectory);
  const files = [];
  let bytes = 0;
  for (const key of keys) {
    const original = path.join(source, key);
    const copy = path.join(filesDirectory, key);
    const before = await inspectFile(original, key);
    await copyFile(original, copy, constants.COPYFILE_EXCL);
    if (process.platform !== 'win32') await chmod(copy, 0o600);
    const after = await inspectFile(original, key);
    const copied = await inspectFile(copy, key);
    if (before.size !== after.size || before.sha256 !== after.sha256 ||
        copied.size !== before.size || copied.sha256 !== before.sha256) {
      throw new Error('Private storage changed during the snapshot; discard this archive and retry.');
    }
    files.push({ key, size: copied.size, sha256: copied.sha256 });
    bytes += copied.size;
  }
  if ((await requireKeysOnly(source)).join('\n') !== keys.join('\n')) {
    throw new Error('Private storage file list changed during the snapshot; discard this archive and retry.');
  }
  const manifest = { format: 'venueconnect-private-storage-v1', createdAt: new Date().toISOString(), files };
  const manifestPath = path.join(archive, MANIFEST_NAME);
  const handle = await open(manifestPath, 'wx', 0o600);
  try { await handle.writeFile(JSON.stringify(manifest, null, 2) + '\n'); }
  finally { await handle.close(); }
  console.log(`PRIVATE_STORAGE_SNAPSHOT_OK files=${files.length} bytes=${bytes}`);
}

async function verify(archiveDirectory) {
  const archive = path.resolve(archiveDirectory);
  const info = await lstat(archive);
  if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('Snapshot archive must be a directory.');
  const entries = await readdir(archive);
  if (entries.sort().join('\n') !== ['files', MANIFEST_NAME].sort().join('\n')) {
    throw new Error('Snapshot archive has unexpected entries.');
  }
  const manifestPath = path.join(archive, MANIFEST_NAME);
  const manifestInfo = await lstat(manifestPath);
  if (!manifestInfo.isFile() || manifestInfo.isSymbolicLink() || manifestInfo.size > 1024 * 1024) {
    throw new Error('Snapshot manifest must be a regular file no larger than 1 MB.');
  }
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (manifest?.format !== 'venueconnect-private-storage-v1' || !Array.isArray(manifest.files)) {
    throw new Error('Snapshot manifest format is invalid.');
  }
  const filesDirectory = path.join(archive, 'files');
  const filesInfo = await lstat(filesDirectory);
  if (!filesInfo.isDirectory() || filesInfo.isSymbolicLink()) {
    throw new Error('Snapshot files must be stored in a directory, not a symlink.');
  }
  const actualKeys = await requireKeysOnly(filesDirectory);
  const expectedKeys = manifest.files.map((file) => file.key).sort();
  if (new Set(expectedKeys).size !== expectedKeys.length || expectedKeys.join('\n') !== actualKeys.join('\n')) {
    throw new Error('Snapshot file list does not match its manifest.');
  }
  let bytes = 0;
  for (const file of manifest.files) {
    if (!KEY_PATTERN.test(file.key) || !Number.isSafeInteger(file.size) || file.size < 1 ||
        file.size > MAX_FILE_BYTES || !/^[0-9a-f]{64}$/.test(file.sha256)) {
      throw new Error('Snapshot manifest contains invalid file metadata.');
    }
    const actual = await inspectFile(path.join(filesDirectory, file.key), file.key);
    if (actual.size !== file.size || actual.sha256 !== file.sha256) {
      throw new Error('Snapshot checksum verification failed.');
    }
    bytes += actual.size;
  }
  return { archive, manifest, bytes };
}

async function restore(archiveDirectory, targetDirectory) {
  const { archive, manifest, bytes } = await verify(archiveDirectory);
  const target = path.resolve(targetDirectory);
  if (target === archive || target.startsWith(archive + path.sep)) {
    throw new Error('Restore target cannot be inside the archive.');
  }
  await secureDirectory(target);
  for (const file of manifest.files) {
    const destination = path.join(target, file.key);
    await copyFile(path.join(archive, 'files', file.key), destination, constants.COPYFILE_EXCL);
    if (process.platform !== 'win32') await chmod(destination, 0o600);
    const copied = await inspectFile(destination, file.key);
    if (copied.size !== file.size || copied.sha256 !== file.sha256) {
      throw new Error('Private storage restore checksum verification failed.');
    }
  }
  console.log(`PRIVATE_STORAGE_RESTORE_OK files=${manifest.files.length} bytes=${bytes}`);
}

async function main() {
  const [mode, first, second] = process.argv.slice(2);
  if (mode === 'create' && first && second) return create(first, second);
  if (mode === 'verify' && first && !second) {
    const { manifest, bytes } = await verify(first);
    console.log(`PRIVATE_STORAGE_VERIFY_OK files=${manifest.files.length} bytes=${bytes}`);
    return;
  }
  if (mode === 'restore' && first && second) return restore(first, second);
  throw new Error('Usage: private-storage-snapshot.mjs create <source> <new-archive-dir> | verify <archive-dir> | restore <archive-dir> <new-target-dir>');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
