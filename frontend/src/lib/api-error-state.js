export function getApiErrorState(error, resourceLabel = 'data') {
  switch (error?.status) {
    case 401:
      return {
        title: 'Sesi tidak tersedia',
        message: 'Sesi tidak valid atau telah berakhir. Autentikasi aplikasi belum aktif pada lingkungan ini.',
        canRetry: false
      };
    case 403:
      return {
        title: 'Anda tidak memiliki akses',
        message: `Akun ini tidak berwenang melihat ${resourceLabel}.`,
        canRetry: false
      };
    case 404:
      return {
        title: 'Data tidak ditemukan',
        message: `${resourceLabel.charAt(0).toUpperCase()}${resourceLabel.slice(1)} mungkin sudah dihapus atau tidak tersedia untuk akun ini.`,
        canRetry: false
      };
    case 409:
      return {
        title: 'Status data berubah',
        message: `Status ${resourceLabel} berubah. Muat ulang untuk melihat informasi terbaru.`,
        canRetry: true
      };
    case 410:
      return {
        title: 'Data sudah kedaluwarsa',
        message: `${resourceLabel.charAt(0).toUpperCase()}${resourceLabel.slice(1)} ini sudah tidak berlaku. Muat ulang untuk memeriksa status terbaru.`,
        canRetry: true
      };
    case 429:
      return {
        title: 'Terlalu banyak permintaan',
        message: 'Tunggu sebentar sebelum mencoba lagi.',
        canRetry: true
      };
    default:
      return {
        title: `${resourceLabel.charAt(0).toUpperCase()}${resourceLabel.slice(1)} belum dapat dimuat`,
        message: 'Periksa koneksi layanan, lalu coba lagi.',
        canRetry: true
      };
  }
}
