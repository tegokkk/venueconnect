'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';

const suggestions = [
  'Cari gedung untuk 100 orang',
  'Bagaimana cara melihat ketersediaan gedung?',
  'Di mana saya melihat tarif penyewaan?'
];

export default function AssistantPanel() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [retryMessage, setRetryMessage] = useState('');

  async function sendMessage(message, appendToLog) {
    if (!message || isSending) return;

    if (appendToLog) setMessages((current) => [...current, { role: 'user', text: message }]);
    setQuestion('');
    setError('');
    setRetryMessage('');
    setIsSending(true);

    try {
      const result = await apiClient.post('/assistant', { message });
      const answer = result?.data?.answer;
      if (typeof answer !== 'string' || !answer.trim()) throw new Error('Respons asisten kosong.');
      setMessages((current) => [...current, { role: 'assistant', text: answer }]);
    } catch (requestError) {
      setRetryMessage(message);
      setError(requestError.status === 503
        ? 'Asisten AI belum diaktifkan. Silakan gunakan katalog dan jadwal umum.'
        : requestError.status === 429
          ? requestError.message
        : requestError.status === 400
          ? requestError.message
          : 'Jawaban belum dapat dimuat. Coba lagi beberapa saat atau gunakan katalog dan jadwal umum.');
    } finally {
      setIsSending(false);
    }
  }

  function sendQuestion(event) {
    event.preventDefault();
    void sendMessage(question.trim(), true);
  }

  return (
    <section aria-labelledby="assistant-title" className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5 sm:p-6">
        <h2 id="assistant-title" className="text-lg font-semibold text-slate-950">Asisten VenueConnect</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">Hanya pertanyaan terbaru yang dikirim untuk dijawab. Jangan masukkan nama, nomor identitas, email, nomor telepon, atau detail pribadi.</p>
      </div>

      <div role="log" aria-label="Percakapan" aria-live="polite" className="min-h-48 space-y-4 p-5 sm:p-6">
        {messages.length === 0 ? (
          <div>
            <p className="mb-3 text-sm text-slate-700">Contoh pertanyaan:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button key={suggestion} type="button" onClick={() => setQuestion(suggestion)} className="min-h-11 rounded-full border border-slate-300 bg-white px-4 py-2 text-left text-sm font-medium text-slate-800 hover:border-emerald-700 hover:bg-emerald-50">
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : messages.map((message, index) => (
          <div key={`${message.role}-${index}`} className={`max-w-[90%] rounded-xl px-4 py-3 leading-6 ${message.role === 'user' ? 'mr-auto bg-emerald-800 text-white' : 'ml-auto bg-slate-100 text-slate-900'}`}>
            <p className="mb-1 text-xs font-semibold">{message.role === 'user' ? 'Anda' : 'Asisten'}</p>
            <p className="whitespace-pre-wrap text-sm">{message.text}</p>
          </div>
        ))}
        {isSending && <p role="status" className="text-sm text-slate-600">Asisten sedang mencari informasi…</p>}
        {error && <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-950">
          <p>{error}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="button" disabled={isSending} onClick={() => void sendMessage(retryMessage, false)} className="min-h-11 rounded-lg border border-amber-800 px-3 font-semibold hover:bg-amber-100 disabled:opacity-60">Coba pertanyaan lagi</button>
            <Link href="/gedung" className="inline-flex min-h-11 items-center font-semibold underline">Buka katalog</Link>
            <Link href="/jadwal" className="inline-flex min-h-11 items-center font-semibold underline">Lihat jadwal</Link>
          </div>
        </div>}
      </div>

      <form onSubmit={sendQuestion} className="border-t border-slate-200 p-5 sm:p-6">
        <label htmlFor="assistant-question" className="mb-2 block text-sm font-semibold text-slate-800">Pertanyaan</label>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <textarea id="assistant-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1200} rows={3} placeholder="Contoh: gedung apa yang tersedia untuk sekitar 100 orang?" className="min-h-24 w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-base text-slate-950 placeholder:text-slate-500 sm:flex-1" />
          <button type="submit" disabled={!question.trim() || isSending} className="min-h-11 rounded-lg bg-emerald-800 px-5 py-2.5 font-semibold text-white hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
            {isSending ? 'Mengirim…' : 'Kirim pertanyaan'}
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">Maksimum 1.200 karakter. VenueConnect tidak menyimpan percakapan. Pesan diproses penyedia AI dan retensi di pihak penyedia belum ditinjau; jangan masukkan data pribadi.</p>
      </form>
    </section>
  );
}
