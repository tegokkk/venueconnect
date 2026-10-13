import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

// Fixture development saja. Jangan biarkan perintah seed mengubah database remote/production.
const databaseUrl = process.env.DATABASE_URL;
const databaseHost = databaseUrl ? new URL(databaseUrl).hostname : '';
if (process.env.NODE_ENV === 'production' || !['localhost', '127.0.0.1', '[::1]'].includes(databaseHost)) {
  throw new Error('Seed hanya boleh dijalankan pada database development lokal.');
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL, options: '-c TimeZone=UTC' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const roles = [
    ['ADMIN', 'Administrator'],
    ['APPROVER', 'Approver'],
    ['PAYMENT_VERIFIER', 'Payment verifier'],
    ['BUILDING_OFFICER', 'Building officer'],
    ['MEMBER', 'Member']
  ];
  const roleIds = {};
  for (const [name, description] of roles) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { description },
      create: { name, description }
    });
    roleIds[name] = role.id;
  }

  const demoUsers = [
    { email: 'admin@polinela.ac.id', name: 'Admin Demo', userType: 'INTERNAL', accountCategory: null, role: 'ADMIN' },
    { email: 'mahasiswa@students.polinela.ac.id', name: 'Mahasiswa Demo', userType: 'INTERNAL', accountCategory: 'MAHASISWA', role: 'MEMBER' },
    { email: 'pegawai-demo@polinela.ac.id', name: 'Pegawai Demo', userType: 'INTERNAL', accountCategory: 'DOSEN_PEGAWAI', role: 'MEMBER' },
    { email: 'publik-demo@example.invalid', name: 'Penyewa Demo', userType: 'EXTERNAL', accountCategory: 'UMUM', role: 'MEMBER' },
    { email: 'approver-demo@polinela.ac.id', name: 'Approver Demo', userType: 'INTERNAL', accountCategory: null, role: 'APPROVER' },
    { email: 'verifier-demo@polinela.ac.id', name: 'Verifier Demo', userType: 'INTERNAL', accountCategory: null, role: 'PAYMENT_VERIFIER' },
    { email: 'petugas-demo@polinela.ac.id', name: 'Petugas Gedung Demo', userType: 'INTERNAL', accountCategory: null, role: 'BUILDING_OFFICER' }
  ];
  for (const { role, ...data } of demoUsers) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: { ...data, isActive: true },
      create: { ...data, isActive: true }
    });
    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: user.id, roleId: roleIds[role] } },
      update: {},
      create: { userId: user.id, roleId: roleIds[role] }
    });
  }

  // Empat gedung awal untuk peminjaman; GSG juga dapat disewa. Ruang lain berasal
  // dari tabel tarif yang dikirim pengguna. Lokasi yang tidak diberikan dibiarkan kosong.
  const buildings = [
    { slug: 'gedung-cb', name: 'Gedung CB', location: 'Jl. Soekarno - Hatta No.10, Rajabasa Raya, Kec. Rajabasa, Kota Bandar Lampung, Lampung 35141', internalLoanEnabled: true, publicRentalEnabled: false },
    { slug: 'gedung-qb', name: 'Gedung QB', location: 'J6RJ+XVH, Hajimena, Kec. Natar, Kabupaten Lampung Selatan, Lampung 35143', internalLoanEnabled: true, publicRentalEnabled: false },
    { slug: 'gedung-sakura', name: 'Gedung Sakura', location: 'J6VJ+FW5, Hajimena, Kec. Natar, Kabupaten Lampung Selatan, Lampung 35143', internalLoanEnabled: true, publicRentalEnabled: false },
    { slug: 'gedung-gsg', name: 'Gedung GSG', location: 'J6VJ+7RG, Hajimena, Kec. Natar, Kabupaten Lampung Selatan, Lampung 35143', internalLoanEnabled: true, publicRentalEnabled: true, description: 'Paket sewa GSG pada tabel tarif mencakup videotron, 300 kursi, dan sound system.' },
    { slug: 'smartroom-class', name: 'Smartroom Class', internalLoanEnabled: false, publicRentalEnabled: true },
    { slug: 'ruang-kelas-biasa', name: 'Ruang Kelas Biasa', description: 'Kapasitas 30–40 orang menurut tabel tarif; ruang fisik spesifik dan lokasi belum diverifikasi.', internalLoanEnabled: false, publicRentalEnabled: true },
    { slug: 'ruang-rapat-gedung-h', name: 'Ruang Rapat Gedung H', capacity: 50, internalLoanEnabled: false, publicRentalEnabled: true },
    { slug: 'ruang-rapat-gedung-seroja', name: 'Ruang Rapat Gedung Seroja', capacity: 20, internalLoanEnabled: false, publicRentalEnabled: true },
    { slug: 'ruang-rapat-gedung-khd', name: 'Ruang Rapat Gedung KHD', capacity: 20, internalLoanEnabled: false, publicRentalEnabled: true },
    { slug: 'ruang-rapat-gedung-a', name: 'Ruang Rapat Gedung A', capacity: 20, internalLoanEnabled: false, publicRentalEnabled: true },
    { slug: 'ruang-seminar-gedung-s', name: 'Ruang Seminar Gedung S', description: 'Kapasitas 100–150 orang menurut tabel tarif; kapasitas final belum diverifikasi.', internalLoanEnabled: false, publicRentalEnabled: true },
    { slug: 'ruang-seminar-gedung-q', name: 'Ruang Seminar Gedung Q', description: 'Kapasitas 50–100 orang menurut tabel tarif; hubungan dengan Gedung QB belum diverifikasi.', internalLoanEnabled: false, publicRentalEnabled: true },
    { slug: 'laboratorium-komputer', name: 'Laboratorium Komputer', description: 'Kapasitas 30–35 orang menurut tabel tarif; ruang fisik spesifik belum diverifikasi.', internalLoanEnabled: false, publicRentalEnabled: true },
    { slug: 'ruang-sidang-utama', name: 'Ruang Sidang Utama', internalLoanEnabled: false, publicRentalEnabled: true },
    { slug: 'laboratorium-teknologi-hasil-pertanian', name: 'Laboratorium Teknologi Hasil Pertanian', internalLoanEnabled: false, publicRentalEnabled: true }
  ];
  await prisma.building.updateMany({
    where: { slug: { notIn: buildings.map(({ slug }) => slug) } },
    data: { isActive: false }
  });
  for (const building of buildings) {
    await prisma.building.upsert({
      where: { slug: building.slug },
      update: { ...building, isActive: true },
      create: { ...building, isActive: true }
    });
  }

  // Tarif dari SK 1185/PL15/KPTS/2026, hanya kategori luar kampus. Diktum KEDUA
  // menyatakan berlaku sejak 21 Agustus 2026; simpan awal hari dalam WIB.
  // Opsi per orang/jam/minggu/bulan dan tambahan kursi ditampilkan
  // sebagai informasi, tetapi tidak menjadi tagihan otomatis hingga kalkulasi disahkan.
  const validFrom = new Date('2026-08-20T17:00:00.000Z'); // 21 Agu 2026, 00.00 WIB
  const rentalRates = [
    ['gedung-gsg', 'GSG termasuk videotron, 300 kursi, sound system', '10000000', 'hari (maks 8 jam)', true, 480],
    ['gedung-gsg', 'Tambahan kursi', '5000', 'unit (maks 8 jam)', false, null],
    ['smartroom-class', 'Smartroom Class', '250000', 'jam (min 2 jam)', false, null],
    ['ruang-kelas-biasa', 'Ruang kelas biasa · 8 jam', '500000', '8 jam', false, 480],
    ['ruang-kelas-biasa', 'Ruang kelas biasa · minggu', '2500000', 'minggu (maks 6 hari)', false, null],
    ['ruang-kelas-biasa', 'Ruang kelas biasa · bulan', '10000000', 'bulan (maks 24 hari)', false, null],
    ['ruang-rapat-gedung-h', 'Ruang rapat Gedung H', '2500000', '8 jam', true, 480],
    ['ruang-rapat-gedung-seroja', 'Ruang rapat Gedung Seroja', '1000000', '8 jam', true, 480],
    ['ruang-rapat-gedung-khd', 'Ruang rapat Gedung KHD', '1000000', '8 jam', true, 480],
    ['ruang-rapat-gedung-a', 'Ruang rapat Gedung A', '1000000', '8 jam', true, 480],
    ['ruang-seminar-gedung-s', 'Ruang seminar Gedung S', '3000000', '8 jam', true, 480],
    ['ruang-seminar-gedung-q', 'Ruang seminar Gedung Q', '2000000', '8 jam', true, 480],
    ['laboratorium-komputer', 'Laboratorium komputer · 8 jam', '4000000', '8 jam', false, 480],
    ['laboratorium-komputer', 'Laboratorium komputer · per orang', '200000', 'orang (min 2 orang)', false, null],
    ['ruang-sidang-utama', 'Ruang sidang utama · per hari', '3000000', 'hari', false, null],
    ['ruang-sidang-utama', 'Paket full day termasuk 2 snack dan lunch', '300000', 'orang/hari (maks 8 jam; min 30 orang)', false, null],
    ['ruang-sidang-utama', 'Paket half day termasuk 1 snack dan lunch', '200000', 'orang/hari (maks 4 jam; min 30 orang)', false, null],
    ['laboratorium-teknologi-hasil-pertanian', 'Laboratorium Teknologi Hasil Pertanian', '2500000', 'hari (maks 8 jam)', true, 480]
  ];
  for (const [slug, name, amount, unit, isBookable, maxDurationMinutes] of rentalRates) {
    const building = await prisma.building.findUniqueOrThrow({ where: { slug }, select: { id: true } });
    const existing = await prisma.buildingRate.findFirst({ where: { buildingId: building.id, audienceType: 'EXTERNAL', name }, orderBy: { createdAt: 'asc' } });
    const data = { name, audienceType: 'EXTERNAL', amount, currency: 'IDR', unit, validFrom, validUntil: null, isActive: true, isBookable, maxDurationMinutes };
    if (existing) await prisma.buildingRate.update({ where: { id: existing.id }, data });
    else await prisma.buildingRate.create({ data: { buildingId: building.id, ...data } });
  }

  console.log(`Seed development selesai: ${buildings.length} ruang/gedung aktif (${buildings.filter((item) => item.internalLoanEnabled).length} dapat dipinjam, ${buildings.filter((item) => item.publicRentalEnabled).length} dapat disewa), ${rentalRates.length} opsi tarif luar kampus.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
