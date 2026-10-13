'use client';

import { useCallback, useEffect, useState } from 'react';
import { getBuildingTerms } from '@/lib/api-client';

export default function TermsPanel({ buildingId }) {
  const [terms, setTerms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const requestTerms = useCallback(() => getBuildingTerms(buildingId), [buildingId]);

  useEffect(() => {
    let active = true;
    requestTerms()
      .then((response) => { if (active) setTerms(response?.success ? response.data : null); })
      .catch(() => { if (active) setError(true); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [requestTerms]);

  const retry = () => {
    setLoading(true);
    setError(false);
    requestTerms()
      .then((response) => setTerms(response?.success ? response.data : null))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  if (loading) return <p role="status" className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">Memuat syarat penggunaan…</p>;
  if (error) return <div role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><p>Syarat penggunaan gagal dimuat.</p><button type="button" onClick={retry} className="mt-2 min-h-10 rounded-lg border border-rose-300 px-3 font-semibold hover:bg-rose-100">Coba lagi</button></div>;
  if (terms?.termsAndConditions) return <p className="whitespace-pre-line leading-7 text-slate-700">{terms.termsAndConditions}</p>;
  return <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><span className="mb-1 block font-semibold">Segera tersedia</span>Syarat penggunaan gedung menunggu pengesahan institusi. Hubungi pengelola sebelum mengajukan.</p>;
}
