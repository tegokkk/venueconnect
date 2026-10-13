import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

const STORAGE_KEY_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class StorageProvider {
  async upload(_content) {
    throw new Error('StorageProvider.upload must be implemented');
  }

  async read(_key) {
    throw new Error('StorageProvider.read must be implemented');
  }

  async delete(_key) {
    throw new Error('StorageProvider.delete must be implemented');
  }

  async getSignedUrl(_key) {
    throw new Error('This storage provider does not support signed URLs');
  }
}

export class LocalStorageProvider extends StorageProvider {
  constructor(rootPath = process.env.STORAGE_LOCAL_PATH || './storage/private') {
    super();
    this.rootPath = path.resolve(/* turbopackIgnore: true */ process.cwd(), rootPath);
  }

  resolveKey(key) {
    if (typeof key !== 'string' || !STORAGE_KEY_PATTERN.test(key)) {
      throw new TypeError('Invalid private storage key');
    }
    return path.join(this.rootPath, key);
  }

  async upload(content) {
    if (!Buffer.isBuffer(content)) throw new TypeError('Storage content must be a Buffer');
    await mkdir(this.rootPath, { recursive: true, mode: 0o700 });
    const key = randomUUID();
    await writeFile(this.resolveKey(key), content, { flag: 'wx', mode: 0o600 });
    return key;
  }

  async read(key) {
    return readFile(this.resolveKey(key));
  }

  async delete(key) {
    await rm(this.resolveKey(key), { force: true });
  }

  async getSignedUrl() {
    throw new Error('Local storage has no signed URLs; serve files through an authenticated ownership-checked route');
  }
}

export function createStorageProvider() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Private document storage is disabled in production until approved');
  }
  const provider = process.env.STORAGE_PROVIDER || 'local';
  if (provider === 'local') return new LocalStorageProvider();
  throw new Error(`Unsupported storage provider: ${provider}`);
}
