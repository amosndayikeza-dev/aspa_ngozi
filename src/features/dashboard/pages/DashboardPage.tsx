import { useAuth } from '@/features/auth';
import { SellerDashboard } from '../components/SellerDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { DashboardPage as PharmacistDashboard } from '../components/PharmacistDashboard'; // Ton ancien dashboard

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  // Rendu conditionnel basé sur le rôle
  switch (user.role) {
    case 'VENDEUR':
      return <SellerDashboard user={user} />;
    case 'ADMIN':
      return <AdminDashboard user={user} />;
    case 'PHARMACIEN':
    default:
      return <PharmacistDashboard />;
  }
}