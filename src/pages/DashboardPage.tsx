// Page d'accueil / Dashboard
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car, ClipboardCheck, Wrench, ShoppingCart,
  TrendingUp, Calendar, ChevronRight, Eye, EyeOff,
  Phone, Shield, Key
} from 'lucide-react';
import { useFleetStore } from '@/features/fleet/fleetStore';
import { dayRepository } from '@/repositories/dayRepository';
import { userRepository } from '@/repositories/userRepository';
import { useAuthStore } from '@/features/auth/authStore';
import { CODES_INTERNES } from '@/data/seed';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDate, formatImmatriculation } from '@/utils/format';
import type { DayRecord } from '@/types';
import { cn } from '@/lib/cn';

function getTodayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTomorrowStr(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function DashboardPage() {
  const navigate = useNavigate();
  const { vehicles, load } = useFleetStore();
  const currentUser = useAuthStore((s) => s.user);
  const [todayRecord, setTodayRecord] = useState<DayRecord | null>(null);
  const [tomorrowRecord, setTomorrowRecord] = useState<DayRecord | null>(null);
  const [showCodes, setShowCodes] = useState(false);

  useEffect(() => {
    load();
    setTodayRecord(dayRepository.getByDate(getTodayStr()));
    setTomorrowRecord(dayRepository.getByDate(getTomorrowStr()));
  }, [load]);

  // Statistiques flotte
  const stats = {
    total: vehicles.length,
    disponibles: vehicles.filter((v) => !v.maintenance && !v.buyBack).length,
    maintenance: vehicles.filter((v) => v.maintenance).length,
    buyBack: vehicles.filter((v) => v.buyBack).length,
    pneuNeige: vehicles.filter((v) => v.pneuNeige).length,
    europcar: vehicles.filter((v) => v.agence === 'Europcar').length,
    goldcar: vehicles.filter((v) => v.agence === 'Goldcar').length,
  };

  // Véhicules récemment préparés (dernières 24h)
  const cutoff = new Date();
  cutoff.setHours(cutoff.getHours() - 24);
  const recentlyPrepared = vehicles
    .filter((v) => v.preparationHistory[0] && new Date(v.preparationHistory[0].date) > cutoff)
    .sort((a, b) => new Date(b.preparationHistory[0].date).getTime() - new Date(a.preparationHistory[0].date).getTime())
    .slice(0, 5);

  const allUsers = userRepository.getAll();
  const getUserName = (id: string) => {
    const u = allUsers.find((u) => u.id === id);
    return u ? (u.prenom || u.nom) : id;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Bienvenue */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Bonjour, {currentUser?.prenom || currentUser?.nom} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<ClipboardCheck className="w-4 h-4" />}
          onClick={() => navigate('/preparation')}
        >
          Lancer préparation
        </Button>
      </div>

      {/* Stats flotte rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Véhicules total"
          value={stats.total}
          icon={<Car className="w-5 h-5" />}
          color="blue"
          onClick={() => navigate('/flotte')}
        />
        <StatCard
          label="Disponibles"
          value={stats.disponibles}
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
          onClick={() => navigate('/flotte')}
        />
        <StatCard
          label="Maintenance"
          value={stats.maintenance}
          icon={<Wrench className="w-5 h-5" />}
          color="red"
          onClick={() => { useFleetStore.getState().setFilter('maintenance', true); navigate('/flotte'); }}
        />
        <StatCard
          label="Buy/Back"
          value={stats.buyBack}
          icon={<ShoppingCart className="w-5 h-5" />}
          color="purple"
          onClick={() => { useFleetStore.getState().setFilter('buyBack', true); navigate('/flotte'); }}
        />
      </div>

      {/* Répartition agences */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-900 border border-green-800/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Europcar</p>
              <p className="text-2xl font-bold text-green-400">{stats.europcar}</p>
            </div>
            <div className="w-10 h-10 bg-green-900/40 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-green-400" />
            </div>
          </div>
        </div>
        <div className="bg-gray-900 border border-yellow-700/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Goldcar</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.goldcar}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-900/30 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Activité du jour */}
        <Card>
          <CardHeader>
            <CardTitle>Activité du jour</CardTitle>
            <Badge variant="info" size="sm">{formatDate(getTodayStr())}</Badge>
          </CardHeader>
          {todayRecord ? (
            <div className="space-y-3">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Préparés" value={todayRecord.stats.nombreVehiculesPrepares} />
                <MiniStat label="Départs" value={todayRecord.departs ?? '—'} />
                <MiniStat label="Retours" value={todayRecord.retours ?? '—'} />
              </div>
              {/* Personnel matin */}
              {todayRecord.personnel.equipeMatin.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Équipe matin</p>
                  <div className="flex flex-wrap gap-1.5">
                    {todayRecord.personnel.equipeMatin.map((id) => (
                      <span key={id} className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 border border-blue-800 rounded-md">
                        {getUserName(id)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Personnel soir */}
              {todayRecord.personnel.equipeSoir.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Équipe soir</p>
                  <div className="flex flex-wrap gap-1.5">
                    {todayRecord.personnel.equipeSoir.map((id) => (
                      <span key={id} className="text-xs px-2 py-0.5 bg-orange-900/30 text-orange-300 border border-orange-800 rounded-md">
                        {getUserName(id)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {/* Top préparateurs */}
              {(todayRecord.stats.topPreparateurs?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Top préparateurs</p>
                  <div className="space-y-1">
                    {todayRecord.stats.topPreparateurs!.map((tp, i) => (
                      <div key={tp.userId} className="flex items-center justify-between">
                        <span className="text-sm text-gray-300">
                          {i + 1}. {getUserName(tp.userId)}
                        </span>
                        <span className="text-xs font-medium text-green-400">{tp.count} prép.</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Notes */}
              {todayRecord.notes && (
                <div className="bg-blue-900/20 border border-blue-900/40 rounded-lg p-2.5">
                  <p className="text-xs text-blue-300">{todayRecord.notes}</p>
                </div>
              )}
              {/* Absences */}
              {todayRecord.absencesRetards && (
                <div className="bg-red-900/20 border border-red-900/40 rounded-lg p-2.5">
                  <p className="text-xs text-red-300">⚠ {todayRecord.absencesRetards}</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState message="Aucune donnée pour aujourd'hui." />
          )}
        </Card>

        {/* Jour suivant */}
        <Card>
          <CardHeader>
            <CardTitle>Demain</CardTitle>
            <Badge variant="muted" size="sm">{formatDate(getTomorrowStr())}</Badge>
          </CardHeader>
          {tomorrowRecord ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <MiniStat label="Départs prévisionnels" value={tomorrowRecord.departs ?? '—'} />
                <MiniStat label="Retours prévisionnels" value={tomorrowRecord.retours ?? '—'} />
              </div>
              {tomorrowRecord.personnel.equipeMatin.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1.5">Équipe matin</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tomorrowRecord.personnel.equipeMatin.map((id) => (
                      <span key={id} className="text-xs px-2 py-0.5 bg-blue-900/30 text-blue-300 border border-blue-800 rounded-md">
                        {getUserName(id)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {tomorrowRecord.notes && (
                <div className="bg-gray-800 rounded-lg p-2.5">
                  <p className="text-xs text-gray-400">{tomorrowRecord.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <EmptyState message="Pas de données pour demain." />
          )}
        </Card>

        {/* Préparations récentes */}
        <Card>
          <CardHeader>
            <CardTitle>Préparations récentes (24h)</CardTitle>
            <button
              onClick={() => navigate('/flotte')}
              className="text-xs text-blue-400 hover:underline flex items-center gap-1"
            >
              Voir flotte <ChevronRight className="w-3 h-3" />
            </button>
          </CardHeader>
          {recentlyPrepared.length === 0 ? (
            <EmptyState message="Aucune préparation dans les dernières 24h." />
          ) : (
            <div className="space-y-2">
              {recentlyPrepared.map((v) => {
                const prep = v.preparationHistory[0];
                return (
                  <div
                    key={v.id}
                    onClick={() => navigate(`/flotte/${v.id}`)}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-gray-800/50 hover:bg-gray-800 cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-mono font-semibold text-gray-200">
                          {formatImmatriculation(v.immatriculation)}
                        </span>
                        <Badge variant={v.agence === 'Europcar' ? 'europcar' : 'goldcar'} size="sm">
                          {v.agence}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {prep.preparateurIds.map(getUserName).join(', ')}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(prep.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Codes internes */}
        <Card>
          <CardHeader>
            <CardTitle>Codes & Contacts</CardTitle>
            <button
              onClick={() => setShowCodes(!showCodes)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors"
            >
              {showCodes ? <><EyeOff className="w-3.5 h-3.5" />Masquer</> : <><Eye className="w-3.5 h-3.5" />Afficher</>}
            </button>
          </CardHeader>
          <div className="space-y-2">
            <CodeLine
              label="Barrières aéroport"
              value={showCodes ? CODES_INTERNES.barriereAeroport : '••••'}
              icon={<Key className="w-3.5 h-3.5" />}
            />
            <CodeLine
              label="Alarme portail"
              value={showCodes ? CODES_INTERNES.alarmePortail : '••••'}
              icon={<Shield className="w-3.5 h-3.5" />}
            />
            <CodeLine
              label="Coffre"
              value={showCodes ? CODES_INTERNES.coffre : '••••'}
              icon={<Key className="w-3.5 h-3.5" />}
            />
            <CodeLine
              label="Téléphone"
              value={showCodes ? CODES_INTERNES.telephone : '••  ••  ••  ••  ••'}
              icon={<Phone className="w-3.5 h-3.5" />}
            />
          </div>
        </Card>

      </div>

      {/* Accès rapide planning */}
      <div
        onClick={() => navigate('/planning')}
        className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gray-800 group-hover:bg-gray-700 rounded-lg flex items-center justify-center transition-colors">
            <Calendar className="w-4 h-4 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-200">Planning de la semaine</p>
            <p className="text-xs text-gray-500">Voir le personnel et les notes</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-300 transition-colors" />
      </div>
    </div>
  );
}

// ─── Composants locaux ──────────────────────────────────────────────────────────

function StatCard({
  label, value, icon, color, onClick
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple';
  onClick?: () => void;
}) {
  const styles = {
    blue: 'bg-blue-900/20 text-blue-400 border-blue-900/40',
    green: 'bg-green-900/20 text-green-400 border-green-900/40',
    red: 'bg-red-900/20 text-red-400 border-red-900/40',
    purple: 'bg-purple-900/20 text-purple-400 border-purple-900/40',
  };
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl p-4 border cursor-pointer hover:opacity-80 transition-all',
        'bg-gray-900',
        'border-gray-800',
        onClick && 'hover:border-gray-700'
      )}
    >
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center mb-2 border', styles[color])}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-gray-800/60 rounded-lg p-2.5 text-center">
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

function CodeLine({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
      <div className="flex items-center gap-2 text-gray-500">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <span className="text-sm font-mono font-medium text-gray-300">{value}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-sm text-gray-600 italic py-2">{message}</p>;
}

