'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import NotificationNavLink from '@/components/notification-nav-link';

export default function OperatorLayout({ children }) {
  const pathname = usePathname();
  const navLinkClass = (href) => `shrink-0 rounded-lg p-3 font-medium ${pathname === href ? 'bg-emerald-700 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 md:flex-row">
      <aside className="bg-slate-900 text-slate-300 md:w-64 md:shrink-0">
        <div className="border-b border-slate-800 bg-slate-950 p-4 md:p-6">
          <div className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-700 font-bold text-white">V</div>
            <span className="font-semibold text-lg">Admin Panel</span>
          </div>
        </div>
        <nav aria-label="Navigasi operator" className="flex gap-2 overflow-x-auto p-3 md:flex-col md:overflow-visible md:p-4">
          <Link href="/admin" aria-current={pathname === '/admin' ? 'page' : undefined} className={navLinkClass('/admin')}>Dasbor</Link>
          <Link href="/admin/review" aria-current={pathname === '/admin/review' ? 'page' : undefined} className={navLinkClass('/admin/review')}>Antrean review</Link>
          <Link href="/persetujuan" aria-current={pathname === '/persetujuan' ? 'page' : undefined} className={navLinkClass('/persetujuan')}>Persetujuan</Link>
          <Link href="/admin/gedung" aria-current={pathname === '/admin/gedung' ? 'page' : undefined} className={navLinkClass('/admin/gedung')}>Master gedung</Link>
          <Link href="/admin/pembayaran" aria-current={pathname === '/admin/pembayaran' ? 'page' : undefined} className={navLinkClass('/admin/pembayaran')}>Pembayaran</Link>
          <Link href="/admin/handover" aria-current={pathname === '/admin/handover' ? 'page' : undefined} className={navLinkClass('/admin/handover')}>Serah-terima</Link>
          <NotificationNavLink className="shrink-0 rounded-lg p-3 font-medium hover:bg-slate-800" />
        </nav>
      </aside>
      <div className="min-w-0 flex-1 p-4 md:p-8">
        {children}
      </div>
    </div>
  );
}
