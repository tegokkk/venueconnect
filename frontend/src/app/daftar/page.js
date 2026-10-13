import AuthUnavailable from '@/components/auth-unavailable';

export const metadata = {
  title: 'Daftar | VenueConnect Polinela'
};

export default function RegisterPage() {
  return <AuthUnavailable mode="register" />;
}
