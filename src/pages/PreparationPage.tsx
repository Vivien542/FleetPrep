// Page de préparation d'un véhicule
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Search, ClipboardCheck, CheckCircle,
  Wrench, ShoppingCart, Users, Fuel, Battery
} from 'lucide-react';
import { vehicleRepository } from '@/repositories/vehicleRepository';
import { userRepository } from '@/repositories/userRepository';
import { useFleetStore } from '@/features/fleet/fleetStore';
import { useAuthStore } from '@/features/auth/authStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input, Textarea } from '@/components/ui/Input';
import { formatImmatriculation, normalizeImmatriculation, isValidImmatriculation, formatKilometrage, generateId } from '@/utils/format';
import type { Vehicle, PreparationRecord, MaintenanceRecord, User } from '@/types';
import { cn } from '@/lib/cn';

export function PreparationPage() {
  const { vehicleId } = useParams<{ vehicleId?: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { updateVehicle } = useFleetStore();
  const currentUser = useAuthStore((s) => s.user);

  const [searchImmat, setSearchImmat] = useState('');
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Formulaire préparation
  const [km, setKm] = useState('');
  const [autonomie, setAutonomie] = useState('');
  const [carburantMis, setCarburantMis] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [selectedPreparateurs, setSelectedPreparateurs] = useState<string[]>([]);

  // Actions optionnelles
  const [blockMaintenance, setBlockMaintenance] = useState(false);
  const [maintenanceRaison, setMaintenanceRaison] = useState('');
  const [blockBuyBack, setBlockBuyBack] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allUsers = userRepository.getAll();

  // Chargement depuis URL si vehicleId fourni
  useEffect(() => {
    if (vehicleId) {
      const v = vehicleRepository.getById(vehicleId);
      if (v) {
        setVehicle(v);
        // Pré-sélectionner l'utilisateur connecté
        if (currentUser) setSelectedPreparateurs([currentUser.id]);
        // Pré-remplir le km
        setKm(String(v.dernierKilometrage));
      }
    }
  }, [vehicleId, currentUser]);

  const handleSearch = () => {
    const normalized = normalizeImmatriculation(searchImmat);
    if (!isValidImmatriculation(normalized)) {
      setErrors({ search: 'Format invalide (ex: AB-123-CD).' });
      return;
    }
    const found = vehicleRepository.getByImmatriculation(normalized);
    if (found) {
      setVehicle(found);
      setNotFound(false);
      setErrors({});
      if (currentUser) setSelectedPreparateurs([currentUser.id]);
      setKm(String(found.dernierKilometrage));
    } else {
      setVehicle(null);
      setNotFound(true);
    }
  };

  const togglePreparateur = (userId: string) => {
    setSelectedPreparateurs((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const kmNum = parseInt(km, 10);
    if (isNaN(kmNum) || kmNum < 0) errs.km = 'Kilométrage invalide.';
    if (vehicle && kmNum < vehicle.dernierKilometrage) {
      errs.km = `Km inférieur au dernier relevé (${formatKilometrage(vehicle.dernierKilometrage)}).`;
    }
    const autoNum = parseInt(autonomie, 10);
    if (isNaN(autoNum)) {
      errs.autonomie = 'Autonomie requise.';
    } else if (vehicle?.carburant === 'Electrique' && (autoNum < 0 || autoNum > 100)) {
      errs.autonomie = 'Batterie entre 0 et 100%.';
    } else if (vehicle?.carburant !== 'Electrique' && (autoNum < 0 || autoNum > 8)) {
      errs.autonomie = 'Niveau carburant entre 0 et 8.';
    }
    if (selectedPreparateurs.length === 0) errs.preparateurs = 'Sélectionnez au moins un préparateur.';
    if (blockMaintenance && !maintenanceRaison.trim()) errs.maintenanceRaison = 'Raison de maintenance requise.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const now = new Date().toISOString();
    const kmNum = parseInt(km, 10);
    const autoNum = parseInt(autonomie, 10);

    // Créer l'entrée de préparation
    const prep: PreparationRecord = {
      id: generateId(),
      vehicleId: vehicle.id,
      date: now,
      kilometrage: kmNum,
      autonomie: autoNum,
      carburantMis: carburantMis ? parseFloat(carburantMis) : undefined,
      commentaire: commentaire.trim() || undefined,
      preparateurIds: selectedPreparateurs,
      blockedMaintenance: blockMaintenance || undefined,
      blockedBuyBack: blockBuyBack || undefined,
    };

    // Mise à jour du véhicule
    const updated: Vehicle = {
      ...vehicle,
      dernierKilometrage: kmNum,
      maintenance: blockMaintenance || vehicle.maintenance,
      buyBack: blockBuyBack || vehicle.buyBack,
      localisation: blockMaintenance
        ? 'Maintenance'
        : blockBuyBack
        ? 'Bloquée Buy/Back'
        : vehicle.localisation,
      updatedAt: now,
      preparationHistory: [prep, ...vehicle.preparationHistory],
    };

    // Entrée maintenance si nécessaire
    if (blockMaintenance) {
      const maintRecord: MaintenanceRecord = {
        id: generateId(),
        vehicleId: vehicle.id,
        date: now,
        kilometrage: kmNum,
        raison: maintenanceRaison.trim(),
        commentaire: commentaire.trim() || undefined,
        preparateurIds: selectedPreparateurs,
      };
      updated.maintenanceHistory = [maintRecord, ...updated.maintenanceHistory];
    }

    updateVehicle(updated);
    toast.success(`Préparation enregistrée pour ${formatImmatriculation(vehicle.immatriculation)}.`);
    navigate(`/flotte/${vehicle.id}`);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(vehicle ? `/flotte/${vehicle.id}` : '/flotte')}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-900/50 rounded-lg flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 text-green-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Préparer un véhicule</h1>
        </div>
      </div>

      {/* Sélection véhicule si pas de vehicleId en URL */}
      {!vehicleId && !vehicle && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-300">Identifier le véhicule</h2>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchImmat}
                onChange={(e) => setSearchImmat(normalizeImmatriculation(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Plaque (ex: AB-123-CD)"
                maxLength={9}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm px-3 py-2.5 font-mono placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all uppercase"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSearch}
              icon={<Search className="w-4 h-4" />}
            >
              Chercher
            </Button>
          </div>
          {errors.search && <p className="text-xs text-red-400">{errors.search}</p>}
          {notFound && (
            <div className="bg-red-900/20 border border-red-900 rounded-lg px-3 py-2.5">
              <p className="text-sm text-red-300">Véhicule introuvable. Vérifiez la plaque.</p>
            </div>
          )}
          {/* Raccourci — sélection dans la flotte */}
          <p className="text-xs text-gray-600 pt-1">
            Ou{' '}
            <button
              onClick={() => navigate('/flotte')}
              className="text-blue-400 hover:underline"
            >
              accédez à la flotte
            </button>{' '}
            et cliquez sur "Préparer" depuis la fiche véhicule.
          </p>
        </div>
      )}

      {/* Formulaire de préparation */}
      {vehicle && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Infos véhicule */}
          <div className={cn(
            'bg-gray-900 border rounded-xl p-4',
            vehicle.agence === 'Europcar' ? 'border-green-800/40' : 'border-yellow-700/40'
          )}>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono font-bold text-xl text-white">
                    {formatImmatriculation(vehicle.immatriculation)}
                  </span>
                  <Badge variant={vehicle.agence === 'Europcar' ? 'europcar' : 'goldcar'}>
                    {vehicle.agence}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400">
                  {vehicle.marque} {vehicle.modele} · {vehicle.carburant} · {vehicle.boite}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Dernier km : {formatKilometrage(vehicle.dernierKilometrage)}
                </p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
            {/* Préparateurs */}
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-2">
                Préparateurs *
              </label>
              <div className="flex flex-wrap gap-2">
                {allUsers.map((user: User) => (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => togglePreparateur(user.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-all',
                      selectedPreparateurs.includes(user.id)
                        ? 'bg-green-900/40 text-green-300 border-green-700'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
                    )}
                  >
                    <Users className="w-3.5 h-3.5" />
                    {user.prenom || user.nom}
                  </button>
                ))}
              </div>
              {errors.preparateurs && (
                <p className="text-xs text-red-400 mt-1">{errors.preparateurs}</p>
              )}
            </div>

            {/* Km + Autonomie */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Kilométrage relevé *"
                type="number"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder={String(vehicle.dernierKilometrage)}
                min={vehicle.dernierKilometrage}
                error={errors.km}
              />
              <div>
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider block mb-1.5">
                  {vehicle.carburant === 'Electrique' ? (
                    <span className="flex items-center gap-1"><Battery className="w-3 h-3" /> Batterie restante (%) *</span>
                  ) : (
                    <span className="flex items-center gap-1"><Fuel className="w-3 h-3" /> Niveau carburant (/8) *</span>
                  )}
                </label>
                <input
                  type="number"
                  value={autonomie}
                  onChange={(e) => setAutonomie(e.target.value)}
                  min="0"
                  max={vehicle.carburant === 'Electrique' ? 100 : 8}
                  placeholder={vehicle.carburant === 'Electrique' ? '0-100' : '0-8'}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg text-gray-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
                />
                {errors.autonomie && <p className="text-xs text-red-400 mt-1">{errors.autonomie}</p>}
              </div>
            </div>

            {/* Carburant mis (thermique uniquement) */}
            {vehicle.carburant !== 'Electrique' && (
              <Input
                label="Carburant mis (litres)"
                type="number"
                value={carburantMis}
                onChange={(e) => setCarburantMis(e.target.value)}
                placeholder="0"
                min="0"
                max="100"
              />
            )}

            {/* Commentaire */}
            <Textarea
              label="Note / commentaire"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="État général, remarques..."
              rows={3}
            />

            {/* Actions optionnelles */}
            <div className="border-t border-gray-800 pt-4 space-y-3">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions de blocage (optionnel)
              </p>

              {/* Maintenance */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-transparent hover:border-red-900/50 hover:bg-red-900/10 transition-all">
                <input
                  type="checkbox"
                  checked={blockMaintenance}
                  onChange={(e) => setBlockMaintenance(e.target.checked)}
                  className="mt-0.5 rounded border-gray-600 bg-gray-800 text-red-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-gray-300">Bloquer en maintenance</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Le véhicule sera marqué "Maintenance" dans la flotte.</p>
                </div>
              </label>
              {blockMaintenance && (
                <Input
                  label="Raison de maintenance *"
                  value={maintenanceRaison}
                  onChange={(e) => setMaintenanceRaison(e.target.value)}
                  placeholder="Voyant moteur, révision..."
                  error={errors.maintenanceRaison}
                />
              )}

              {/* Buy/Back */}
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-transparent hover:border-purple-900/50 hover:bg-purple-900/10 transition-all">
                <input
                  type="checkbox"
                  checked={blockBuyBack}
                  onChange={(e) => setBlockBuyBack(e.target.checked)}
                  className="mt-0.5 rounded border-gray-600 bg-gray-800 text-purple-500"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-medium text-gray-300">Passer en buy/back</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">Le véhicule sera bloqué pour cession.</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate(`/flotte/${vehicle.id}`)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Valider la préparation
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

import React from 'react';
