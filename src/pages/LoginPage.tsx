// Page de connexion
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';

export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [nom, setNom] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim() || !password.trim()) {
      setError('Veuillez saisir votre identifiant et votre mot de passe.');
      return;
    }
    setLoading(true);
    setError('');
    // Simulation d'un délai réseau pour l'UX
    await new Promise((r) => setTimeout(r, 400));
    const result = login(nom.trim(), password);
    setLoading(false);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Erreur de connexion.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-700 rounded-2xl mb-4 shadow-lg shadow-green-900/50">
            <Car className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">FleetPrep</h1>
          <p className="text-gray-500 text-sm mt-1">Europcar / Goldcar · Toulouse Aéroport</p>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-base font-semibold text-gray-200 mb-5">Connexion</h2>

          <div className="flex flex-col gap-4">
            {/* Identifiant */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Identifiant
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Votre nom ou prénom"
                autoComplete="username"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm px-3 py-2.5 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
              />
            </div>

            {/* Mot de passe */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm px-3 py-2.5 pr-10 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-900/30 border border-red-800 rounded-lg px-3 py-2.5">
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            {/* Bouton connexion */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-all mt-1"
            >
              {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>

        {/* Aide demo */}
        <div className="mt-4 bg-blue-900/20 border border-blue-900/40 rounded-xl p-3">
          <p className="text-xs text-blue-400 font-medium mb-1">Comptes de démonstration</p>
          <div className="text-xs text-blue-300/70 space-y-0.5">
            <p><span className="font-medium text-blue-300">Admin :</span> Martin / admin123</p>
            <p><span className="font-medium text-blue-300">Préparateur :</span> Vivien / vivien123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
