export function formatCurrencyAmount(value, currency = 'IDR') {
  if (value === null || value === undefined || value === '') return null;
  const amount = Number(value);
  if (!Number.isFinite(amount)) return null;

  try {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currency || 'IDR'
    }).format(amount);
  } catch {
    return null;
  }
}
