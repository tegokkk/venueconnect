import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import NotificationNavLink from '@/components/notification-nav-link';
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'VenueConnect Polinela',
  description: 'Pratinjau sistem informasi peminjaman dan penyewaan gedung Polinela',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Link href="#main-content" className="sr-only fixed left-4 top-4 z-[100] rounded-lg bg-white px-4 py-3 font-semibold text-slate-900 shadow-lg focus:not-sr-only focus:outline focus:outline-3 focus:outline-offset-2 focus:outline-emerald-700">
          Lewati ke konten utama
        </Link>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Material Symbols are served as an icon font by Google Fonts. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <header className="site-header">
          <div className="site-header-inner">
            <Link href="/" className="site-brand" aria-label="VenueConnect Polinela, beranda">
              <span className="site-brand-icon"><Image src="/images/polinela-logo.png" width={40} height={38} alt="" priority /></span>
              <span><span className="site-brand-name">VenueConnect Polinela</span><span className="site-brand-caption">Pratinjau layanan gedung</span></span>
            </Link>
            <nav aria-label="Navigasi utama" className="site-nav">
              <Link href="/gedung">Gedung</Link>
              <Link href="/jadwal">Jadwal</Link>
              <Link href="/#prosedur">Prosedur</Link>
              <Link href="/bantuan">Bantuan / AI</Link>
              <NotificationNavLink className="site-notification" />
              <Link href="/masuk" className="site-login">Masuk</Link>
            </nav>
          </div>
        </header>
        <main id="main-content" tabIndex={-1} className="min-h-screen">
          {children}
        </main>
        <footer className="site-footer">
          <div className="site-footer-inner">
            <div className="site-footer-grid">
              <section>
                <h2 className="flex items-center gap-2"><Image src="/images/polinela-logo.png" width={32} height={31} alt="" />VenueConnect Polinela</h2>
                <p>Pratinjau alur pencarian dan pengajuan gedung. Unit pengelola, kontak, jam layanan, dan ketentuan resmi belum ditetapkan untuk publikasi.</p>
              </section>
              <section>
                <h3>Jelajahi</h3>
                <div className="site-footer-links"><Link href="/gedung">Katalog gedung</Link><Link href="/jadwal">Jadwal umum</Link><Link href="/#prosedur">Prosedur peminjaman</Link></div>
              </section>
              <section>
                <h3>Bantuan</h3>
                <div className="site-footer-links"><Link href="/bantuan">Pusat bantuan</Link><Link href="/masuk">Masuk ke akun</Link></div>
                <p>Kontak operasional akan ditampilkan setelah ditetapkan pemilik proses.</p>
              </section>
            </div>
            <div className="site-footer-copy">© 2026 VenueConnect Polinela · Pratinjau non-produksi</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
