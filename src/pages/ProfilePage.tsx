// Page profil utilisateur
import { useState } from 'react';
import { Lock, Eye, EyeOff, Save } from 'lucide-react';
import { useAuthStore } from '@/features/auth/authStore';
import { userRepository } from '@/repositories/userRepository';
import { vehicleRepository } from '@/repositories/vehicleRepository';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { formatDateHeure, formatImmatriculation } from '@/utils/format';

export function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const toast = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [pwError, setPwError] = useState('');
  const [loadingPw, setLoadingPw] = useState(false);

  if (!user) return null;

  // Statistiques personnelles — préparations où l'utilisateur a participé
  const allVehicles = vehicleRepository.getAll();
  const myPreps = allVehicles.flatMap((v) =>
    v.preparationHistory.filter((p) => p.preparateurIds.includes(user.id)).map((p) => ({ ...p, vehicle: v }))
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const last7days = new Date();
  last7days.setDate(last7days.getDate() - 7);
  const prepsLast7 = myPreps.filter((p) => new Date(p.date) > last7days).length;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPwError('Tous les champs sont requis.');
      return;
    }
    // Recharger l'utilisateur depuis le repo pour vérifier le mot de passe réel
    const fresh = userRepository.getById(user.id);
    if (!fresh || fresh.password !== oldPassword) {
      setPwError('Mot de passe actuel incorrect.');
      return;
    }
    if (newPassword.length < 4) {
      setPwError('Le nouveau mot de passe doit contenir au moins 4 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoadingPw(true);
    await new Promise((r) => setTimeout(r, 300));
    const updated = { ...fresh, password: newPassword, updatedAt: new Date().toISOString() };
    updateUser(updated);
    userRepository.addLog(user.id, 'Changement mot de passe');
    toast.success('Mot de passe mis à jour.');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoadingPw(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      <h1 className="text-xl font-bold text-white">Mon profil</h1>

      {/* Infos utilisateur */}
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
          <Badge variant={user.isAdmin ? 'warning' : 'muted'}>{user.isAdmin ? 'Admin' : 'Utilisateur'}</Badge>
        </CardHeader>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-green-800/50 rounded-full flex items-center justify-center text-xl font-bold text-green-300">
            {(user.prenom?.[0] || user.nom[0]).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{user.prenom} {user.nom}</p>
            <p className="text-sm text-gray-400">{user.role}</p>
            {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
            {user.telephone && <p className="text-xs text-gray-500">{user.telephone}</p>}
            <p className="text-xs text-gray-600 mt-1">ID : {user.id}</p>
          </div>
        </div>
      </Card>

      {/* Statistiques */}
      <Card>
        <CardHeader><CardTitle>Mes statistiques</CardTitle></CardHeader>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-400">{myPreps.length}</p>
            <p className="text-xs text-gray-500 mt-1">Préparations totales</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{prepsLast7}</p>
            <p className="text-xs text-gray-500 mt-1">Ces 7 derniers jours</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {new Set(myPreps.map((p) => p.vehicleId)).size}
            </p>
            <p className="text-xs text-gray-500 mt-1">Véhicules traités</p>
          </div>
        </div>
      </Card>

      {/* Historique récent */}
      {myPreps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mes dernières préparations</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {myPreps.slice(0, 5).map((prep) => (
              <div key={prep.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                <div>
                  <span className="text-sm font-mono font-medium text-gray-200">
                    {formatImmatriculation(prep.vehicle.immatriculation)}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {prep.vehicle.marque} {prep.vehicle.modele}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDateHeure(prep.date)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Changement mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle>Changer le mot de passe</CardTitle>
          <Lock className="w-4 h-4 text-gray-500" />
        </CardHeader>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Mot de passe actuel</label>
            <div className="relative">
              <input
                type={showPasswords ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(!showPasswords)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Input
            label="Nouveau mot de passe"
            type={showPasswords ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimum 4 caractères"
          />
          <Input
            label="Confirmer le nouveau mot de passe"
            type={showPasswords ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {pwError && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg px-3 py-2">
              <p className="text-xs text-red-300">{pwError}</p>
            </div>
          )}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              loading={loadingPw}
              icon={<Save className="w-3.5 h-3.5" />}
            >
              Mettre à jour
            </Button>
          </div>
        </form>
      </Card>

      {/* Logs utilisateur */}
      {user.logs && user.logs.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Journal d'activité</CardTitle></CardHeader>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {user.logs.slice(0, 20).map((log) => (
              <div key={log.id} className="flex items-center justify-between text-xs py-1 border-b border-gray-800 last:border-0">
                <span className="text-gray-400">{log.action}</span>
                <span className="text-gray-600">{formatDateHeure(log.date)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
