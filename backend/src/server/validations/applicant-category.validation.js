export function isApplicantCategoryAllowed(requester, category) {
  if (!requester?.accountCategory || requester.accountCategory !== category) return false;
  if (requester.userType === 'EXTERNAL') return category === 'UMUM';
  if (requester.userType === 'INTERNAL') return ['MAHASISWA', 'DOSEN_PEGAWAI'].includes(category);
  return false;
}
