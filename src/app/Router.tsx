// Configuration des routes de l'application
import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/authStore';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { FleetPage } from '@/pages/FleetPage';
import { VehicleDetailPage } from '@/pages/VehicleDetailPage';
import { VehicleFormPage } from '@/pages/VehicleFormPage';
import { PreparationPage } from '@/pages/PreparationPage';
import { PlanningPage } from '@/pages/PlanningPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { AdminPage } from '@/pages/AdminPage';

// Garde de route — redirige vers /connexion si non authentifié
function PrivateRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;
  return <Outlet />;
}

// Garde admin — redirige vers / si non admin
function AdminRoute() {
  const user = useAuthStore((s) => s.user);
  if (!user?.isAdmin) return <Navigate to="/" replace />;
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: '/connexion',
    element: <LoginPage />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        element: <Layout />,
        children: [
          { path: '/', element: <DashboardPage /> },
          { path: '/planning', element: <PlanningPage /> },
          { path: '/flotte', element: <FleetPage /> },
          { path: '/flotte/ajouter', element: <VehicleFormPage /> },
          { path: '/flotte/:vehicleId', element: <VehicleDetailPage /> },
          { path: '/flotte/:vehicleId/modifier', element: <VehicleFormPage /> },
          { path: '/preparation', element: <PreparationPage /> },
          { path: '/preparation/:vehicleId', element: <PreparationPage /> },
          { path: '/profil', element: <ProfilePage /> },
          {
            element: <AdminRoute />,
            children: [
              { path: '/admin', element: <AdminPage /> },
            ],
          },
        ],
      },
    ],
  },
  // Fallback — redirection vers l'accueil
  { path: '*', element: <Navigate to="/" replace /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
