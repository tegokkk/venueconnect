import Link from 'next/link';
import NotificationNavLink from '@/components/notification-nav-link';

export default function MemberLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
      <aside className="border-b border-slate-200 bg-white md:w-64 md:shrink-0 md:border-b-0 md:border-r">
        <div className="border-b border-slate-100 p-4 md:p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 font-bold text-white">V</div>
            <span className="font-semibold text-lg text-slate-800">VenueConnect</span>
          </div>
        </div>
        <nav aria-label="Navigasi akun" className="flex gap-2 overflow-x-auto p-3 md:flex-col md:overflow-visible md:p-4">
          <Link href="/dashboard" className="shrink-0 rounded-lg bg-emerald-50 p-3 font-medium text-emerald-700">Ringkasan</Link>
          <Link href="/akun/pengajuan" className="shrink-0 rounded-lg p-3 font-medium text-slate-600 hover:bg-slate-50">Pengajuanku</Link>
          <NotificationNavLink className="shrink-0 rounded-lg p-3 font-medium text-slate-600 hover:bg-slate-50" />
          <Link href="/akun/profil" className="shrink-0 rounded-lg p-3 font-medium text-slate-600 hover:bg-slate-50">Profil</Link>
        </nav>
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
