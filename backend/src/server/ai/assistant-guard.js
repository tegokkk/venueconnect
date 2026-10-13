import { isIP } from 'node:net';

const PERSONAL_DATA_PATTERNS = [
  /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/,
  /[\w.+-]+\s*(?:\[at\]|\(at\)|\s+at\s+)\s*[\w.-]+\s*(?:\[dot\]|\(dot\)|\s+dot\s+|\.)\s*[A-Za-z]{2,}/i,
  /(?<!\d)(?:\+?62|0)[\s().-]*(?:2\d{1,2}|8)(?:[\s().-]*\d){7,12}(?!\d)/,
  /(?:^|\D)\d(?:[\s.-]*\d){15}(?:\D|$)/,
  /\b(?:npm|nim|nip|nik|ktp|paspor|passport)\b[^\n]{0,32}(?:\d[\s./-]*){6,20}/i,
  /\b(?:nama|alamat)\s+(?:saya|pemohon)\s+(?:(?:adalah|di|:|=)\s*)?\S+/i,
  /\b(?:saya|aku)\s+(?:bernama|beralamat|tinggal\s+di)\s+\S+/i,
  /\b(?:nama(?:\s+lengkap)?|alamat(?:\s+(?:rumah|kantor))?|email|e-?mail|telepon|telp|no\.?\s*(?:hp|wa)|whatsapp|npm|nim|nip|nik|ktp|paspor)\s*[:=]\s*\S+/i,
  /\b(?:email|telepon|no\.?\s*hp|whatsapp|acara|kegiatan|dokumen)\s+(?:saya|pemohon)\s+(?:adalah|:|=)/i
];

export function containsSensitiveInput(text) {
  // Normalize full-width characters and remove invisible format characters before
  // checking. The original user text is never changed or forwarded after rejection.
  const inspectionText = text.normalize('NFKC').replace(/[\u200B-\u200D\u2060\uFEFF]/g, '');
  return PERSONAL_DATA_PATTERNS.some((pattern) => pattern.test(inspectionText));
}

function clientKey(request) {
  // Forwarded headers are client-controlled unless an ingress overwrites them.
  // A global process ceiling below keeps forged IPs from bypassing the limiter.
  const raw = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip')?.trim() || '';
  return raw.length <= 45 && isIP(raw) ? raw : 'unknown';
}

export function createProcessRateLimiter({
  maxPerClient = 5,
  maxGlobal = 20,
  windowMs = 60_000,
  maxClients = 10_000,
  cleanupIntervalMs = 60_000
} = {}) {
  const byClient = new Map();
  let globalRequests = [];
  let nextCleanupAt = 0;

  return (request, now = Date.now()) => {
    globalRequests = globalRequests.filter((timestamp) => now - timestamp < windowMs);
    if (globalRequests.length >= maxGlobal) {
      return Math.max(1, Math.ceil((windowMs - (now - globalRequests[0])) / 1000));
    }

    if (now >= nextCleanupAt) {
      for (const [key, timestamps] of byClient) {
        if (!timestamps.some((timestamp) => now - timestamp < windowMs)) byClient.delete(key);
      }
      nextCleanupAt = now + cleanupIntervalMs;
    }

    const key = clientKey(request);
    const recent = (byClient.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);
    if (recent.length >= maxPerClient) {
      return Math.max(1, Math.ceil((windowMs - (now - recent[0])) / 1000));
    }

    recent.push(now);
    byClient.delete(key);
    byClient.set(key, recent);
    globalRequests.push(now);
    while (byClient.size > maxClients) byClient.delete(byClient.keys().next().value);
    return null;
  };
}
