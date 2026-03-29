// Barre de navigation principale
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Calendar, Car, PlusCircle, ClipboardCheck,
  User, LogOut, Menu, X, Shield, ChevronDown
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { cn } from '@/lib/cn';

const NAV_ITEMS = [
  { to: '/', label: 'Accueil', icon: Home },
  { to: '/planning', label: 'Planning', icon: Calendar },
  { to: '/flotte', label: 'Flotte', icon: Car },
  { to: '/flotte/ajouter', label: 'Ajouter', icon: PlusCircle },
  { to: '/preparation', label: 'Préparer', icon: ClipboardCheck },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/connexion');
    setUserMenuOpen(false);
    setMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-green-700 rounded-lg flex items-center justify-center">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white text-sm hidden sm:block">FleetPrep</span>
            <span className="text-gray-500 text-xs hidden md:block">Toulouse Aéroport</span>
          </Link>

          {/* Navigation desktop */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    isActive(to)
                      ? 'bg-green-900/40 text-green-400 border border-green-800/50'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Link>
              ))}
              {user?.isAdmin && (
                <Link
                  to="/admin"
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                    isActive('/admin')
                      ? 'bg-purple-900/40 text-purple-400 border border-purple-800/50'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  )}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Admin
                </Link>
              )}
            </nav>
          )}

          {/* Zone utilisateur */}
          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800 transition-all"
                >
                  <div className="w-6 h-6 bg-green-800 rounded-full flex items-center justify-center text-xs font-bold text-green-300">
                    {(user.prenom?.[0] || user.nom[0]).toUpperCase()}
                  </div>
                  <span className="font-medium">{user.prenom || user.nom}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-xl py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-800">
                      <p className="text-xs font-medium text-gray-200">{user.prenom} {user.nom}</p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <Link
                      to="/profil"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:text-gray-100 hover:bg-gray-800 transition-colors"
                    >
                      <User className="w-3.5 h-3.5" />
                      Mon profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Déconnexion
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/connexion"
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                Connexion
              </Link>
            )}

            {/* Bouton menu mobile */}
            {isAuthenticated && (
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Menu mobile drawer */}
      {mobileOpen && isAuthenticated && (
        <div className="md:hidden border-t border-gray-800 bg-gray-900">
          <nav className="px-4 py-3 flex flex-col gap-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
                  isActive(to)
                    ? 'bg-green-900/40 text-green-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {user?.isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all',
                  isActive('/admin')
                    ? 'bg-purple-900/40 text-purple-400'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                )}
              >
                <Shield className="w-4 h-4" />
                Administration
              </Link>
            )}
            <div className="border-t border-gray-800 mt-2 pt-2 flex flex-col gap-1">
              <Link
                to="/profil"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-colors"
              >
                <User className="w-4 h-4" />
                Mon profil — {user?.prenom} {user?.nom}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-red-400 hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
