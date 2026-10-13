import AuthUnavailable from '@/components/auth-unavailable';

export const metadata = {
  title: 'Masuk | VenueConnect Polinela'
};

export default function LoginPage() {
  return <AuthUnavailable mode="login" />;
}
