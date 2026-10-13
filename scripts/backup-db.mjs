#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { createReadStream } from 'node:fs';
import { chmod, link, mkdir, open, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';

function parseDatabaseUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('DATABASE_URL must be a valid PostgreSQL connection URL.');
  }

  if (!['postgres:', 'postgresql:'].includes(url.protocol)) {
    throw new Error('DATABASE_URL must use the PostgreSQL URL scheme.');
  }

  const database = decodeURIComponent(url.pathname.slice(1));
  const username = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  if (!url.hostname || !database || !username) {
    throw new Error('DATABASE_URL must include host, database, and user.');
  }

  return { url, database, username, password };
}

function runPostgresClient(command, args, env, stdio = 'inherit') {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env, stdio, windowsHide: true });
    child.once('error', reject);
    child.once('close', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(signal ? `${command} stopped by ${signal}.` : `${command} exited with code ${code}.`));
    });
  });
}

async function fileSha256(filePath) {
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(filePath)) hash.update(chunk);
  return hash.digest('hex');
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be configured in the runtime environment.');
  }

  const { url, database, username, password } = parseDatabaseUrl(process.env.DATABASE_URL);
  const backupDirectory = path.resolve(process.argv[2] || process.env.BACKUP_DIR || './backups');
  await mkdir(backupDirectory, { recursive: true, mode: 0o700 });
  if (process.platform !== 'win32') await chmod(backupDirectory, 0o700);

  const stamp = new Date().toISOString().replaceAll(/[-:]/g, '').replaceAll(/\.\d{3}/g, '');
  const backupFile = path.join(backupDirectory, `venueconnect-${stamp}-${randomUUID().slice(0, 8)}.dump`);
  const tempFile = path.join(backupDirectory, `.venueconnect-${randomUUID()}.tmp`);
  const handle = await open(tempFile, 'wx', 0o600);
  await handle.close();

  const childEnv = { ...process.env, PGPASSWORD: password };
  for (const [queryKey, envKey] of [
    ['sslmode', 'PGSSLMODE'],
    ['sslrootcert', 'PGSSLROOTCERT'],
    ['sslcert', 'PGSSLCERT'],
    ['sslkey', 'PGSSLKEY'],
    ['connect_timeout', 'PGCONNECT_TIMEOUT']
  ]) {
    const value = url.searchParams.get(queryKey);
    if (value) childEnv[envKey] = value;
  }

  try {
    try {
      await runPostgresClient('pg_dump', [
      '--no-password',
      '--format=custom',
      '--no-owner',
      '--no-acl',
      `--host=${url.hostname}`,
      `--port=${url.port || '5432'}`,
      `--username=${username}`,
      `--dbname=${database}`,
      `--file=${tempFile}`
      ], childEnv);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('pg_dump was not found. Install PostgreSQL client tools and add pg_dump to PATH.');
      }
      throw error;
    }

    if ((await stat(tempFile)).size === 0) {
      throw new Error('pg_dump created an empty archive.');
    }

    try {
      await runPostgresClient('pg_restore', ['--list', tempFile], childEnv, ['ignore', 'ignore', 'inherit']);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('pg_restore was not found. Install PostgreSQL client tools and add pg_restore to PATH.');
      }
      throw new Error(`Backup archive validation failed: ${error.message}`);
    }

    const sha256 = await fileSha256(tempFile);
    if (process.platform !== 'win32') await chmod(tempFile, 0o600);
    await link(tempFile, backupFile);
    await rm(tempFile);
    console.log(`Database backup created: ${backupFile}`);
    console.log(`SHA-256: ${sha256}`);
  } catch (error) {
    await rm(tempFile, { force: true });
    throw error;
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
