// Page Flotte — tableau filtrable avec statuts et navigation
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, ChevronUp, ChevronDown, ChevronsUpDown,
  Plus, Filter, RotateCcw
} from 'lucide-react';
import { useFleetStore } from '@/features/fleet/fleetStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { VehicleStatusBadges } from '@/components/vehicle/VehicleStatusBadges';
import { AutonomieIndicator } from '@/components/vehicle/AutonomieIndicator';
import { formatImmatriculation, formatKilometrage } from '@/utils/format';
import type { Vehicle, Agence, CategorieVehicule, Carburant, Localisation } from '@/types';
import { cn } from '@/lib/cn';

type SortKey = 'immatriculation' | 'agence' | 'categorie' | 'marque' | 'dernierKilometrage' | 'localisation';
type SortDir = 'asc' | 'desc';

const CATEGORIES: CategorieVehicule[] = ['B', 'C', 'Prestige', 'Electrique', 'Minibus'];
const CARBURANTS: Carburant[] = ['Essence', 'Diesel', 'Electrique'];
const LOCALISATIONS: Localisation[] = ['Agence', 'Base arrière', 'Maintenance', 'Parc du midi', 'Bloquée Buy/Back'];

export function FleetPage() {
  const navigate = useNavigate();
  const { load, filters, setFilter, resetFilters, filteredVehicles } = useFleetStore();
  const [sortKey, setSortKey] = useState<SortKey>('immatriculation');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    load();
  }, [load]);

  const vehicles = filteredVehicles();

  // Tri des véhicules
  const sorted = [...vehicles].sort((a, b) => {
    let va: string | number = a[sortKey] as string | number;
    let vb: string | number = b[sortKey] as string | number;
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return sortDir === 'asc' ? -1 : 1;
    if (va > vb) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="w-3 h-3 text-gray-600" />;
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-green-400" />
      : <ChevronDown className="w-3 h-3 text-green-400" />;
  };

  const hasActiveFilters =
    filters.search || filters.agence || filters.categorie ||
    filters.carburant || filters.localisation ||
    filters.maintenance !== null || filters.buyBack !== null || filters.pneuNeige !== null;

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Flotte</h1>
          <p className="text-sm text-gray-500">{vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''}</p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => navigate('/flotte/ajouter')}
        >
          Ajouter
        </Button>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-3">
        <div className="flex gap-2">
          {/* Recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilter('search', e.target.value)}
              placeholder="Rechercher plaque, marque, modèle..."
              className="w-full pl-9 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            {filters.search && (
              <button
                onClick={() => setFilter('search', '')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Toggle filtres */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-all',
              showFilters || hasActiveFilters
                ? 'bg-blue-900/30 text-blue-400 border-blue-700'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
            )}
          >
            <Filter className="w-3.5 h-3.5" />
            Filtres
            {hasActiveFilters && (
              <span className="w-4 h-4 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                !
              </span>
            )}
          </button>
          {/* Réinitialiser */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-200 bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Réinit.</span>
            </button>
          )}
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 pt-2 border-t border-gray-800">
            {/* Agence */}
            <select
              value={filters.agence}
              onChange={(e) => setFilter('agence', e.target.value as Agence | '')}
              className="bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">Toutes agences</option>
              <option value="Europcar">Europcar</option>
              <option value="Goldcar">Goldcar</option>
            </select>

            {/* Catégorie */}
            <select
              value={filters.categorie}
              onChange={(e) => setFilter('categorie', e.target.value as CategorieVehicule | '')}
              className="bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">Toutes catégories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Carburant */}
            <select
              value={filters.carburant}
              onChange={(e) => setFilter('carburant', e.target.value as Carburant | '')}
              className="bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">Tous carburants</option>
              {CARBURANTS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Localisation */}
            <select
              value={filters.localisation}
              onChange={(e) => setFilter('localisation', e.target.value as Localisation | '')}
              className="bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">Toutes localisations</option>
              {LOCALISATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>

            {/* Options statut */}
            <div className="flex flex-col gap-1.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.maintenance === true}
                  onChange={(e) => setFilter('maintenance', e.target.checked ? true : null)}
                  className="rounded border-gray-600 bg-gray-800 text-red-500"
                />
                <span className="text-xs text-gray-400">Maintenance</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.buyBack === true}
                  onChange={(e) => setFilter('buyBack', e.target.checked ? true : null)}
                  className="rounded border-gray-600 bg-gray-800 text-purple-500"
                />
                <span className="text-xs text-gray-400">Buy/Back</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.pneuNeige === true}
                  onChange={(e) => setFilter('pneuNeige', e.target.checked ? true : null)}
                  className="rounded border-gray-600 bg-gray-800 text-blue-500"
                />
                <span className="text-xs text-gray-400">Pneus neige</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Tableau desktop */}
      <div className="hidden md:block bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {sorted.length === 0 ? (
          <div className="py-16 text-center">
            <Car className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucun véhicule ne correspond à votre recherche.</p>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="mt-2 text-xs text-blue-400 hover:underline">
                Réinitialiser les filtres
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800">
                  {[
                    { key: 'immatriculation', label: 'Immat.' },
                    { key: 'agence', label: 'Agence' },
                    { key: 'categorie', label: 'Cat.' },
                    { key: 'marque', label: 'Marque / Modèle' },
                    { key: null, label: 'Carburant / Autonomie' },
                    { key: null, label: 'Statuts' },
                    { key: 'dernierKilometrage', label: 'Km' },
                    { key: 'localisation', label: 'Localisation' },
                  ].map(({ key, label }) => (
                    <th
                      key={label}
                      className={cn(
                        'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                        key && 'cursor-pointer hover:text-gray-300 select-none'
                      )}
                      onClick={() => key && handleSort(key as SortKey)}
                    >
                      <div className="flex items-center gap-1">
                        {label}
                        {key && <SortIcon col={key as SortKey} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {sorted.map((vehicle) => (
                  <VehicleRow key={vehicle.id} vehicle={vehicle} onClick={() => navigate(`/flotte/${vehicle.id}`)} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Vue mobile — cartes */}
      <div className="md:hidden space-y-2">
        {sorted.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-sm">
            Aucun véhicule trouvé.
          </div>
        ) : (
          sorted.map((vehicle) => (
            <VehicleCard key={vehicle.id} vehicle={vehicle} onClick={() => navigate(`/flotte/${vehicle.id}`)} />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Ligne tableau ──────────────────────────────────────────────────────────────

function VehicleRow({ vehicle, onClick }: { vehicle: Vehicle; onClick: () => void }) {
  return (
    <tr
      onClick={onClick}
      className="hover:bg-gray-800/60 cursor-pointer transition-colors group"
    >
      {/* Immatriculation */}
      <td className="px-4 py-3">
        <span className="font-mono font-semibold text-gray-100 group-hover:text-white">
          {formatImmatriculation(vehicle.immatriculation)}
        </span>
      </td>
      {/* Agence */}
      <td className="px-4 py-3">
        <Badge variant={vehicle.agence === 'Europcar' ? 'europcar' : 'goldcar'}>
          {vehicle.agence}
        </Badge>
      </td>
      {/* Catégorie */}
      <td className="px-4 py-3">
        <span className="text-gray-300 text-xs font-medium">{vehicle.categorie}</span>
      </td>
      {/* Marque / Modèle */}
      <td className="px-4 py-3">
        <span className="text-gray-200">{vehicle.marque}</span>
        <span className="text-gray-500 ml-1">{vehicle.modele}</span>
      </td>
      {/* Carburant + Autonomie */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">{vehicle.carburant}</span>
          {vehicle.preparationHistory.length > 0 && (
            <AutonomieIndicator
              autonomie={vehicle.preparationHistory[0].autonomie}
              carburant={vehicle.carburant}
              showLabel
            />
          )}
        </div>
      </td>
      {/* Statuts */}
      <td className="px-4 py-3">
        <VehicleStatusBadges vehicle={vehicle} />
      </td>
      {/* Kilométrage */}
      <td className="px-4 py-3">
        <span className="text-gray-300 text-sm tabular-nums">
          {formatKilometrage(vehicle.dernierKilometrage)}
        </span>
      </td>
      {/* Localisation */}
      <td className="px-4 py-3">
        <LocalisationBadge localisation={vehicle.localisation} />
      </td>
    </tr>
  );
}

// ─── Carte mobile ───────────────────────────────────────────────────────────────

function VehicleCard({ vehicle, onClick }: { vehicle: Vehicle; onClick: () => void }) {
  const lastPrep = vehicle.preparationHistory[0];
  return (
    <div
      onClick={onClick}
      className="bg-gray-900 border border-gray-800 rounded-xl p-4 cursor-pointer hover:border-gray-700 active:bg-gray-800 transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-gray-100">
              {formatImmatriculation(vehicle.immatriculation)}
            </span>
            <Badge variant={vehicle.agence === 'Europcar' ? 'europcar' : 'goldcar'} size="sm">
              {vehicle.agence}
            </Badge>
            <Badge variant="muted" size="sm">{vehicle.categorie}</Badge>
          </div>
          <p className="text-sm text-gray-400">
            {vehicle.marque} {vehicle.modele} · {vehicle.carburant}
          </p>
        </div>
        <LocalisationBadge localisation={vehicle.localisation} />
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
        <span className="text-xs text-gray-500">{formatKilometrage(vehicle.dernierKilometrage)}</span>
        {lastPrep && (
          <AutonomieIndicator autonomie={lastPrep.autonomie} carburant={vehicle.carburant} />
        )}
        <VehicleStatusBadges vehicle={vehicle} />
      </div>
    </div>
  );
}

// ─── Badge localisation ─────────────────────────────────────────────────────────

function LocalisationBadge({ localisation }: { localisation: string }) {
  const styles: Record<string, string> = {
    'Agence': 'bg-green-900/30 text-green-400 border-green-800',
    'Base arrière': 'bg-blue-900/30 text-blue-400 border-blue-800',
    'Maintenance': 'bg-red-900/30 text-red-400 border-red-800',
    'Parc du midi': 'bg-orange-900/30 text-orange-400 border-orange-800',
    'Bloquée Buy/Back': 'bg-purple-900/30 text-purple-400 border-purple-800',
  };
  return (
    <span className={cn(
      'inline-block px-2 py-0.5 rounded-md text-xs font-medium border',
      styles[localisation] || 'bg-gray-800 text-gray-400 border-gray-700'
    )}>
      {localisation}
    </span>
  );
}

// Import manquant corrigé
import { Car } from 'lucide-react';
