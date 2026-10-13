(() => {
  const screens = [
    { id: 'beranda_publik', title: 'Beranda', href: '../beranda_publik_venueconnect_polinela/code.html' },
    { id: 'katalog_gedung', title: 'Katalog gedung', href: '../katalog_gedung_venueconnect_polinela/code.html' },
    { id: 'detail_gedung', title: 'Detail gedung & jadwal', href: '../detail_gedung_jadwal_venueconnect_polinela/code.html' },
    { id: 'wizard_pengajuan', title: 'Formulir pengajuan', href: '../wizard_pengajuan_venueconnect_polinela/code.html' },
    { id: 'dashboard_pemohon', title: 'Status pemohon', href: '../dashboard_pemohon_riwayat_venueconnect_polinela/code.html' },
    { id: 'dashboard_operator', title: 'Antrean operator', href: '../dashboard_operator_review_antrean_venueconnect_polinela/code.html' },
    { id: 'admin_master_tarif', title: 'Master dan pembayaran', href: '../admin_master_tarif_pembayaran_venueconnect_polinela/code.html' },
    { id: 'operasional_serah', title: 'Serah-terima penggunaan', href: '../operasional_serah_terima_venueconnect_polinela/code.html' }
  ];

  const currentIndex = screens.findIndex(({ id }) => window.location.pathname.includes(id));
  if (currentIndex < 0) return;

  const current = screens[currentIndex];
  const previous = screens[currentIndex - 1];
  const next = screens[currentIndex + 1];
  const style = document.createElement('style');
  style.textContent = `
    .vc-prototype-nav { position: fixed; z-index: 2147483000; inset: auto 0 0; display: flex; justify-content: center; padding: 12px 16px; background: rgb(15 23 42 / .94); color: white; font: 14px/1.4 system-ui, sans-serif; box-shadow: 0 -4px 20px rgb(15 23 42 / .2); }
    .vc-prototype-nav__inner { width: min(1120px, 100%); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .vc-prototype-nav__label { font-weight: 700; }
    .vc-prototype-nav__note { display: block; color: #cbd5e1; font-size: 12px; }
    .vc-prototype-nav__links { display: flex; align-items: center; gap: 8px; }
    .vc-prototype-nav a { display: inline-flex; min-height: 40px; align-items: center; padding: 8px 12px; border: 1px solid #94a3b8; border-radius: 8px; color: white; text-decoration: none; font-weight: 650; }
    .vc-prototype-nav a:hover, .vc-prototype-nav a:focus-visible { background: #334155; outline: 3px solid #a7f3d0; outline-offset: 2px; }
    .vc-prototype-nav a[aria-current="page"] { border-color: #6ee7b7; color: #a7f3d0; }
    body { padding-bottom: 92px !important; }
    @media (max-width: 520px) { .vc-prototype-nav__inner { justify-content: center; } .vc-prototype-nav__meta { width: 100%; text-align: center; } }
  `;
  document.head.append(style);

  const nav = document.createElement('nav');
  nav.className = 'vc-prototype-nav';
  nav.setAttribute('aria-label', 'Navigasi alur prototipe VenueConnect');
  nav.innerHTML = `
    <div class="vc-prototype-nav__inner">
      <div class="vc-prototype-nav__meta">
        <span class="vc-prototype-nav__label">${current.title}</span>
        <span class="vc-prototype-nav__note">Preview statis — data dan status hanya simulasi, bukan kebijakan resmi.</span>
      </div>
      <div class="vc-prototype-nav__links">
        ${previous ? `<a href="${previous.href}" rel="prev">← ${previous.title}</a>` : ''}
        <a href="../index.html">Daftar layar</a>
        ${next ? `<a href="${next.href}" rel="next" aria-current="step">Lanjut: ${next.title} →</a>` : '<a href="../dashboard_pemohon_riwayat_venueconnect_polinela/code.html">Kembali ke status pemohon ↺</a>'}
      </div>
    </div>`;
  document.body.append(nav);
})();
