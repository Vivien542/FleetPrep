// Page administration — gestion des utilisateurs (MVP)
import { useState } from 'react';
import {
  Shield, Plus, Trash2, Key, CheckCircle, Eye, EyeOff
} from 'lucide-react';
import { userRepository } from '@/repositories/userRepository';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/Modal';
import { generateId } from '@/utils/format';
import type { User as UserType } from '@/types';
import { useAuthStore } from '@/features/auth/authStore';

const ROLES = [
  { value: 'Préparateur', label: 'Préparateur' },
  { value: 'Convoyeur', label: 'Convoyeur' },
  { value: 'Chef d\'équipe', label: 'Chef d\'équipe' },
  { value: 'Admin', label: 'Admin' },
];

export function AdminPage() {
  const toast = useToast();
  const currentUser = useAuthStore((s) => s.user);
  const [users, setUsers] = useState<UserType[]>(() => userRepository.getAll());
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Formulaire création
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    role: 'Préparateur',
    password: '',
    isAdmin: false,
  });
  const [formError, setFormError] = useState('');
  const [loadingCreate, setLoadingCreate] = useState(false);

  const refresh = () => setUsers(userRepository.getAll());

  const toggleAdmin = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.warning('Vous ne pouvez pas modifier votre propre statut admin.');
      return;
    }
    const u = userRepository.getById(userId);
    if (!u) return;
    userRepository.save({ ...u, isAdmin: !u.isAdmin, updatedAt: new Date().toISOString() });
    refresh();
    toast.info(`Droits admin ${u.isAdmin ? 'retirés à' : 'accordés à'} ${u.prenom || u.nom}.`);
  };

  const handleDelete = (userId: string) => {
    if (userId === currentUser?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte.');
      return;
    }
    userRepository.remove(userId);
    refresh();
    toast.success('Utilisateur supprimé.');
    setDeleteTarget(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!form.nom.trim()) { setFormError('Nom requis.'); return; }
    if (!form.password || form.password.length < 4) { setFormError('Mot de passe requis (min 4 caractères).'); return; }

    setLoadingCreate(true);
    await new Promise((r) => setTimeout(r, 300));
    const now = new Date().toISOString();
    const newUser: UserType = {
      id: generateId(),
      nom: form.nom.trim(),
      prenom: form.prenom.trim() || undefined,
      role: form.role,
      password: form.password,
      isAdmin: form.isAdmin,
      createdAt: now,
      updatedAt: now,
      logs: [],
    };
    userRepository.save(newUser);
    userRepository.addLog(currentUser!.id, 'Création utilisateur', `${newUser.prenom || ''} ${newUser.nom}`);
    refresh();
    setForm({ nom: '', prenom: '', role: 'Préparateur', password: '', isAdmin: false });
    toast.success(`Compte ${newUser.prenom || newUser.nom} créé.`);
    setLoadingCreate(false);
  };

  const resetPassword = (userId: string) => {
    const u = userRepository.getById(userId);
    if (!u) return;
    const newPw = u.nom.toLowerCase() + '123';
    userRepository.save({ ...u, password: newPw, updatedAt: new Date().toISOString() });
    refresh();
    toast.success(`Mot de passe réinitialisé à "${newPw}".`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-purple-900/40 rounded-lg flex items-center justify-center">
          <Shield className="w-4 h-4 text-purple-400" />
        </div>
        <h1 className="text-xl font-bold text-white">Administration</h1>
      </div>

      {/* Créer un utilisateur */}
      <Card>
        <CardHeader><CardTitle>Créer un compte</CardTitle><Plus className="w-4 h-4 text-gray-500" /></CardHeader>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Prénom"
              value={form.prenom}
              onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
              placeholder="Prénom"
            />
            <Input
              label="Nom *"
              value={form.nom}
              onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
              placeholder="Nom de famille"
            />
            <Select
              label="Rôle"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              options={ROLES}
            />
            <Input
              label="Mot de passe initial *"
              type="text"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="Minimum 4 caractères"
            />
          </div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAdmin}
              onChange={(e) => setForm((f) => ({ ...f, isAdmin: e.target.checked }))}
              className="rounded border-gray-600 bg-gray-800 text-purple-500"
            />
            <span className="text-sm text-gray-300">Droits administrateur</span>
          </label>
          {formError && (
            <p className="text-xs text-red-400">{formError}</p>
          )}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm" loading={loadingCreate} icon={<Plus className="w-3.5 h-3.5" />}>
              Créer le compte
            </Button>
          </div>
        </form>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle>Utilisateurs ({users.length})</CardTitle>
          <button
            onClick={() => {
              const allShown: Record<string, boolean> = {};
              users.forEach((u) => allShown[u.id] = !Object.values(showPasswords).every(Boolean));
              setShowPasswords(allShown);
            }}
            className="text-xs text-gray-500 hover:text-gray-300 flex items-center gap-1"
          >
            <Eye className="w-3.5 h-3.5" /> Mots de passe
          </button>
        </CardHeader>
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between gap-3 p-3 bg-gray-800/50 rounded-lg"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-gray-300 shrink-0">
                  {(u.prenom?.[0] || u.nom[0]).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-200 truncate">
                      {u.prenom} {u.nom}
                    </span>
                    {u.id === currentUser?.id && (
                      <span className="text-xs text-blue-400">(vous)</span>
                    )}
                    <Badge variant={u.isAdmin ? 'warning' : 'muted'} size="sm">
                      {u.isAdmin ? 'Admin' : u.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Key className="w-3 h-3 text-gray-600" />
                    <span className="text-xs text-gray-500 font-mono">
                      {showPasswords[u.id] ? u.password : '••••••'}
                    </span>
                    <button
                      onClick={() => setShowPasswords((p) => ({ ...p, [u.id]: !p[u.id] }))}
                      className="text-gray-600 hover:text-gray-400"
                    >
                      {showPasswords[u.id]
                        ? <EyeOff className="w-3 h-3" />
                        : <Eye className="w-3 h-3" />
                      }
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {/* Toggle admin */}
                <button
                  onClick={() => toggleAdmin(u.id)}
                  title={u.isAdmin ? 'Retirer admin' : 'Rendre admin'}
                  disabled={u.id === currentUser?.id}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-900/20 transition-all disabled:opacity-30"
                >
                  {u.isAdmin ? <CheckCircle className="w-4 h-4 text-yellow-400" /> : <Shield className="w-4 h-4" />}
                </button>
                {/* Reset password */}
                <button
                  onClick={() => resetPassword(u.id)}
                  title="Réinitialiser mot de passe"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-900/20 transition-all"
                >
                  <Key className="w-4 h-4" />
                </button>
                {/* Supprimer */}
                <button
                  onClick={() => setDeleteTarget(u.id)}
                  title="Supprimer"
                  disabled={u.id === currentUser?.id}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-900/20 transition-all disabled:opacity-30"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Confirmation suppression */}
      <ConfirmModal
        open={Boolean(deleteTarget)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        title="Supprimer l'utilisateur"
        message="Cette action est irréversible. L'utilisateur ne pourra plus se connecter."
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}

