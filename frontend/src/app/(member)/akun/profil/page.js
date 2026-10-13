import Link from 'next/link';

export default function MemberProfilePage() {
  return <section className="mx-auto max-w-3xl home-card p-6 sm:p-8">
    <p className="text-sm font-semibold text-emerald-800">Profil pemohon</p>
    <h1 className="mt-2 text-2xl font-bold text-slate-900">Informasi profil</h1>
    <p className="mt-3 leading-7 text-slate-700">Autentikasi dan pengelolaan data profil belum diaktifkan. Portal tidak menyimpan atau menampilkan data pribadi akun pada halaman ini.</p>
    <Link href="/masuk" className="mt-5 inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 font-semibold text-slate-800 hover:bg-slate-50">Informasi masuk</Link>
  </section>;
}
