import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage, useAuth } from "@/features/auth";
import { DashboardLayout } from '../layouts/DashboardLayout'; 
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { ClientListPage } from "@/features/clients/pages/ClientListPage";
import { ClientDetailPage } from '@/features/clients/pages/ClientDetailPage';
import { MedicamentListPage } from "@/features/stock/pages/MedicamentListPage";
import { POSPage } from "@/features/ventes/pages/POSPage";
import { NouvelAchatPage } from '@/features/stock/pages/NouvelAchatPage';
import { InventairePage } from '@/features/stock/pages/InventairePage';
import { Ordonnance } from "@/features/ordonnances/types";
import { OrdonnanceListPage } from "@/features/ordonnances/pages/OrdonnanceListPage";
import { OrdonnanceFormPage } from "@/features/ordonnances/pages/OrdonnanceFormPage";
import { OrdonnanceDetailPage } from '@/features/ordonnances/pages/OrdonnanceDetailPage';
import { FournisseurListPage } from '@/features/stock/pages/FournisseurListPage';
import { UserListPage } from "@/features/administartion/pages/UserListPage";


/**
 * Petite page temporaire pour verifier que le routing fonctionne.
 * on la remplace par le vrai DashboardLayout a l'etape suivante
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

        {/* --- Routes protégées avec le Layout Principal --- */}
        <Route element={<ProtectedRoute />}>
          {/* Le DashboardLayout englobe toutes les pages connectées */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/clients/:id" element={<ClientDetailPage />} />
            
            
            
            {/* Exemple de route existante */}
            <Route path="/stock" element={<MedicamentListPage />} />
            <Route path="/achats" element={<FournisseurListPage />} />
            <Route path="/stock/achats/nouveau" element={<NouvelAchatPage />} />
            <Route path="/stock/inventaire" element={<InventairePage />} />
            <Route path="/vente" element={<POSPage />} />
            <Route path="/ordonnances" element={<OrdonnanceListPage />} />
            <Route path="/ordonnances/nouveau" element={<OrdonnanceFormPage />} />
            <Route path="/ordonnances/:id" element={<OrdonnanceDetailPage />} />
            <Route path="/utilisateurs" element={<UserListPage />} />
            
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