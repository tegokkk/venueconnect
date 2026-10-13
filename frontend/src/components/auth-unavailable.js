import Link from 'next/link';

export default function AuthUnavailable({ mode }) {
  const isRegister = mode === 'register';

  return (
    <div className="home-container flex min-h-[65vh] items-center justify-center py-12">
      <section className="home-card w-full max-w-xl p-6 sm:p-9">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-emerald-50 text-primary"><span className="material-symbols-outlined" aria-hidden="true">{isRegister ? 'person_add' : 'account_circle'}</span></span>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[.14em] text-emerald-700">VenueConnect Polinela</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">{isRegister ? 'Daftar akun' : 'Masuk ke akun'}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{isRegister ? 'Buat akun untuk mengelola informasi dan pengajuan Anda.' : 'Masuk untuk melihat status dan riwayat pengajuan Anda.'}</p>
        </div>

        <div role="status" className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
          <p className="font-semibold">Autentikasi belum aktif</p>
          <p className="mt-1">Metode login, verifikasi akun, dan konfigurasi sesi masih menunggu keputusan. Form ini belum mengirim atau menyimpan data.</p>
        </div>

        <form className="space-y-4" aria-label={isRegister ? 'Form pendaftaran nonaktif' : 'Form masuk nonaktif'}>
          <fieldset disabled className="space-y-4">
            {isRegister && <label className="block text-sm font-medium text-slate-700">Nama lengkap<input autoComplete="name" className="mt-1 block min-h-11 w-full bg-slate-50 px-3 font-normal" placeholder="Nama Anda" /></label>}
            <label className="block text-sm font-medium text-slate-700">Email<input type="email" autoComplete="email" className="mt-1 block min-h-11 w-full bg-slate-50 px-3 font-normal" placeholder="nama@contoh.ac.id" /></label>
            {isRegister && <label className="block text-sm font-medium text-slate-700">Kategori pemohon<select defaultValue="" className="mt-1 block min-h-11 w-full bg-slate-50 px-3 font-normal"><option value="" disabled>Pilih kategori</option><option>Mahasiswa Polinela (peminjaman)</option><option>Dosen / pegawai Polinela (peminjaman)</option><option>Luar kampus (penyewaan)</option></select></label>}
            <label className="block text-sm font-medium text-slate-700">Kata sandi<input type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} className="mt-1 block min-h-11 w-full bg-slate-50 px-3 font-normal" placeholder="••••••••" /></label>
            {isRegister && <label className="block text-sm font-medium text-slate-700">Konfirmasi kata sandi<input type="password" autoComplete="new-password" className="mt-1 block min-h-11 w-full bg-slate-50 px-3 font-normal" placeholder="Ulangi kata sandi" /></label>}
            <button type="button" disabled className="min-h-11 w-full rounded-lg bg-emerald-700 px-5 text-sm font-semibold text-white opacity-50">{isRegister ? 'Daftar belum tersedia' : 'Masuk belum tersedia'}</button>
          </fieldset>
        </form>

        <div className="mt-5 flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-5">
          <Link href="/gedung" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Lihat katalog</Link>
          <Link href={isRegister ? '/masuk' : '/daftar'} className="inline-flex min-h-11 items-center rounded-lg px-4 text-sm font-semibold text-primary hover:bg-emerald-50">
            {isRegister ? 'Informasi masuk' : 'Informasi pendaftaran'}
          </Link>
        </div>
      </section>
    </div>
  );
}
