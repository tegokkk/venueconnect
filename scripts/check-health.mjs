#!/usr/bin/env node

const endpoint = process.argv[2] || 'http://127.0.0.1:3001/api/health';
let url;
try {
  url = new URL(endpoint);
  if (url.username || url.password || url.search || url.hash || url.pathname !== '/api/health' ||
      !['http:', 'https:'].includes(url.protocol) ||
      (url.protocol === 'http:' && !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))) {
    throw new Error('invalid');
  }
} catch {
  console.error('HEALTH_FAIL reason=invalid_endpoint');
  process.exit(2);
}

try {
  const response = await fetch(url, {
    headers: { accept: 'application/json' },
    cache: 'no-store',
    redirect: 'error',
    signal: AbortSignal.timeout(5000)
  });
  const type = response.headers.get('content-type') || '';
  if (!response.ok || !type.includes('application/json')) {
    console.error(`HEALTH_FAIL reason=http_status status=${response.status}`);
    process.exit(1);
  }
  const body = await response.json();
  if (body?.status !== 'ok' || body?.db !== 'connected') {
    console.error('HEALTH_FAIL reason=unhealthy_response');
    process.exit(1);
  }
  console.log('HEALTH_OK db=connected');
} catch {
  console.error('HEALTH_FAIL reason=request_failed');
  process.exit(1);
}
