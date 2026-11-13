import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "@/features/auth";
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ClientListPage } from "@/features/clients/pages/ClientListPage";
import { ClientDetailPage } from '@/features/clients/pages/ClientDetailPage';
import { MedicamentListPage } from "@/features/stock/pages/MedicamentListPage";
import { POSPage } from "@/features/ventes/pages/POSPage";
import { NouvelAchatPage } from '@/features/stock/pages/NouvelAchatPage';
import { InventairePage } from '@/features/stock/pages/InventairePage';
import { OrdonnanceListPage } from "@/features/ordonnances/pages/OrdonnanceListPage";
import { OrdonnanceFormPage } from "@/features/ordonnances/pages/OrdonnanceFormPage";
import { OrdonnanceDetailPage } from '@/features/ordonnances/pages/OrdonnanceDetailPage';
import { FournisseurListPage } from '@/features/stock/pages/FournisseurListPage';
import { UserListPage } from "@/features/administartion/pages/UserListPage";
import { SettingsPage } from '@/features/settings/pages/SettingsPage';
import { AuditLogPage } from "@/features/audit/pages/AuditLogPage";
import { ReportsPage } from "@/features/reports/pages/ReportsPage";
import { NotificationCenterPage } from '@/features/notifications/pages/NotificationCenterPage';
import { VenteHistoriquePage } from "@/features/ventes/pages/VenteHistoriquePage";
import { DetteListPage } from "@/features/dettes/pages/DetteListPage";
import { DetteDetailPage } from "@/features/dettes/pages/DetteDetailPage";

/**
 * Page 403 — Affichée quand un utilisateur tente d'accéder à une route
 * réservée à un rôle qu'il n'a pas.
 */
function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-vet-cream flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-vet-danger">403</h1>
        <p className="text-sm text-gray-500 mt-2">Vous n'avez pas accès à cette page.</p>
      </div>
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Routes publiques --- */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* --- Routes protégées (utilisateur connecté) --- */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            
            {/* ============================================
                ROUTES ACCESSIBLES À TOUS LES CONNECTÉS
                (PHARMACIEN, VENDEUR, ADMIN)
               ============================================ */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            <Route path="/stock" element={<MedicamentListPage />} />
            <Route path="/achats" element={<FournisseurListPage />} />
            <Route path="/stock/achats/nouveau" element={<NouvelAchatPage />} />
            <Route path="/stock/inventaire" element={<InventairePage />} />
            <Route path="/vente" element={<POSPage />} />
            <Route path="/vente/historique" element={<VenteHistoriquePage />} />
            <Route path="/ordonnances" element={<OrdonnanceListPage />} />
            <Route path="/ordonnances/nouveau" element={<OrdonnanceFormPage />} />
            <Route path="/ordonnances/:id" element={<OrdonnanceDetailPage />} />
            <Route path="/notifications" element={<NotificationCenterPage />} />
            <Route path="/dettes" element={<DetteListPage />} />
            <Route path="/dettes/:id" element={<DetteDetailPage />} />

            {/* ============================================
                ROUTES RÉSERVÉES AUX ADMINISTRATEURS
               ============================================ */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/utilisateurs" element={<UserListPage />} />
              <Route path="/parametres" element={<SettingsPage />} />
              <Route path="/audit" element={<AuditLogPage />} />
            </Route>

            {/* ============================================
                ROUTES RÉSERVÉES AUX PHARMACIENS
               ============================================ */}
            <Route element={<ProtectedRoute allowedRoles={['PHARMACIEN']} />}>
              <Route path="/rapports" element={<ReportsPage />} />
            </Route>

            {/* Page 403 — accessible à tous les connectés */}
            <Route path="/403" element={<ForbiddenPage />} />
          </Route>
        </Route>

        {/* --- Redirections --- */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}