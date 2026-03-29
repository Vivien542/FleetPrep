// Page formulaire ajout / modification d'un véhicule
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Car } from 'lucide-react';
import { vehicleRepository } from '@/repositories/vehicleRepository';
import { useFleetStore } from '@/features/fleet/fleetStore';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea, Checkbox } from '@/components/ui/Input';
import { formatImmatriculation, normalizeImmatriculation, isValidImmatriculation, generateId, generateQrCodeValue } from '@/utils/format';
import type { Vehicle, Agence, CategorieVehicule, Carburant, Boite, Localisation } from '@/types';

const AGENCES: { value: Agence; label: string }[] = [
  { value: 'Europcar', label: 'Europcar' },
  { value: 'Goldcar', label: 'Goldcar' },
];
const CATEGORIES: { value: CategorieVehicule; label: string }[] = [
  { value: 'B', label: 'B — Citadine' },
  { value: 'C', label: 'C — Compacte' },
  { value: 'Prestige', label: 'Prestige' },
  { value: 'Electrique', label: 'Électrique' },
  { value: 'Minibus', label: 'Minibus' },
];
const CARBURANTS: { value: Carburant; label: string }[] = [
  { value: 'Essence', label: 'Essence' },
  { value: 'Diesel', label: 'Diesel' },
  { value: 'Electrique', label: 'Électrique' },
];
const BOITES: { value: Boite; label: string }[] = [
  { value: 'Manuelle', label: 'Manuelle' },
  { value: 'Automatique', label: 'Automatique' },
];
const LOCALISATIONS: { value: Localisation; label: string }[] = [
  { value: 'Agence', label: 'Agence' },
  { value: 'Base arrière', label: 'Base arrière' },
  { value: 'Maintenance', label: 'Maintenance' },
  { value: 'Parc du midi', label: 'Parc du midi' },
  { value: 'Bloquée Buy/Back', label: 'Bloquée Buy/Back' },
];

interface FormData {
  immatriculation: string;
  agence: Agence;
  categorie: CategorieVehicule;
  marque: string;
  modele: string;
  dernierKilometrage: string;
  dateDerniersNiveaux: string;
  carburant: Carburant;
  noteCourte: string;
  boite: Boite;
  pneuNeige: boolean;
  buyBack: boolean;
  dateBuyBack: string;
  maintenance: boolean;
  localisation: Localisation;
}

const DEFAULT_FORM: FormData = {
  immatriculation: '',
  agence: 'Europcar',
  categorie: 'B',
  marque: '',
  modele: '',
  dernierKilometrage: '',
  dateDerniersNiveaux: '',
  carburant: 'Essence',
  noteCourte: '',
  boite: 'Manuelle',
  pneuNeige: false,
  buyBack: false,
  dateBuyBack: '',
  maintenance: false,
  localisation: 'Agence',
};

export function VehicleFormPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { addVehicle, updateVehicle } = useFleetStore();

  const isEdit = Boolean(vehicleId);
  const [form, setForm] = useState<FormData>({ ...DEFAULT_FORM });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [loading, setLoading] = useState(false);

  // Pré-remplissage en mode édition
  useEffect(() => {
    if (!vehicleId) return;
    const v = vehicleRepository.getById(vehicleId);
    if (!v) return;
    setForm({
      immatriculation: v.immatriculation,
      agence: v.agence,
      categorie: v.categorie,
      marque: v.marque,
      modele: v.modele,
      dernierKilometrage: String(v.dernierKilometrage),
      dateDerniersNiveaux: v.dateDerniersNiveaux || '',
      carburant: v.carburant,
      noteCourte: v.noteCourte || '',
      boite: v.boite,
      pneuNeige: v.pneuNeige,
      buyBack: v.buyBack,
      dateBuyBack: v.dateBuyBack || '',
      maintenance: v.maintenance,
      localisation: v.localisation,
    });
  }, [vehicleId]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormData, string>> = {};
    const immat = normalizeImmatriculation(form.immatriculation);
    if (!immat) {
      errs.immatriculation = 'Immatriculation requise.';
    } else if (!isValidImmatriculation(immat)) {
      errs.immatriculation = 'Format invalide (ex: AB-123-CD).';
    }
    if (!form.marque.trim()) errs.marque = 'Marque requise.';
    if (!form.modele.trim()) errs.modele = 'Modèle requis.';
    const km = parseInt(form.dernierKilometrage, 10);
    if (isNaN(km) || km < 0) errs.dernierKilometrage = 'Kilométrage invalide.';
    if (form.buyBack && !form.dateBuyBack) errs.dateBuyBack = 'Date buy/back requise.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 300));

    const immat = normalizeImmatriculation(form.immatriculation);
    const now = new Date().toISOString();

    if (isEdit && vehicleId) {
      const existing = vehicleRepository.getById(vehicleId)!;
      const updated: Vehicle = {
        ...existing,
        immatriculation: immat,
        agence: form.agence,
        categorie: form.categorie,
        marque: form.marque.trim(),
        modele: form.modele.trim(),
        dernierKilometrage: parseInt(form.dernierKilometrage, 10),
        dateDerniersNiveaux: form.dateDerniersNiveaux || undefined,
        carburant: form.carburant,
        noteCourte: form.noteCourte.trim() || undefined,
        boite: form.boite,
        pneuNeige: form.pneuNeige,
        buyBack: form.buyBack,
        dateBuyBack: form.buyBack ? form.dateBuyBack : undefined,
        maintenance: form.maintenance,
        localisation: form.localisation,
        updatedAt: now,
      };
      updateVehicle(updated);
      toast.success(`Véhicule ${formatImmatriculation(immat)} modifié.`);
      navigate(`/flotte/${vehicleId}`);
    } else {
      const id = generateId();
      const newVehicle: Vehicle = {
        id,
        qrCodeValue: generateQrCodeValue(id),
        immatriculation: immat,
        agence: form.agence,
        categorie: form.categorie,
        marque: form.marque.trim(),
        modele: form.modele.trim(),
        dernierKilometrage: parseInt(form.dernierKilometrage, 10),
        dateDerniersNiveaux: form.dateDerniersNiveaux || undefined,
        carburant: form.carburant,
        noteCourte: form.noteCourte.trim() || undefined,
        boite: form.boite,
        pneuNeige: form.pneuNeige,
        buyBack: form.buyBack,
        dateBuyBack: form.buyBack ? form.dateBuyBack : undefined,
        maintenance: form.maintenance,
        localisation: form.localisation,
        createdAt: now,
        updatedAt: now,
        preparationHistory: [],
        maintenanceHistory: [],
        damageHistory: [],
        noteHistory: [],
      };
      addVehicle(newVehicle);
      toast.success(`Véhicule ${formatImmatriculation(immat)} ajouté. QR code généré.`);
      navigate(`/flotte/${id}`);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(isEdit ? `/flotte/${vehicleId}` : '/flotte')}
          className="text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
            <Car className="w-4 h-4 text-gray-400" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {isEdit ? 'Modifier le véhicule' : 'Ajouter un véhicule'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-5">
        {/* Identification */}
        <Section title="Identification">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                label="Immatriculation *"
                value={form.immatriculation}
                onChange={(e) => set('immatriculation', normalizeImmatriculation(e.target.value))}
                placeholder="AB-123-CD"
                error={errors.immatriculation}
                maxLength={9}
              />
              {form.immatriculation && isValidImmatriculation(form.immatriculation) && (
                <p className="text-xs text-green-400 mt-1">
                  → {formatImmatriculation(form.immatriculation)}
                </p>
              )}
            </div>
            <Select
              label="Agence *"
              value={form.agence}
              onChange={(e) => set('agence', e.target.value as Agence)}
              options={AGENCES}
            />
            <Input
              label="Marque *"
              value={form.marque}
              onChange={(e) => set('marque', e.target.value)}
              placeholder="Renault, Peugeot..."
              error={errors.marque}
            />
            <Input
              label="Modèle *"
              value={form.modele}
              onChange={(e) => set('modele', e.target.value)}
              placeholder="Clio, 208..."
              error={errors.modele}
            />
            <Select
              label="Catégorie *"
              value={form.categorie}
              onChange={(e) => set('categorie', e.target.value as CategorieVehicule)}
              options={CATEGORIES}
            />
          </div>
        </Section>

        {/* Caractéristiques */}
        <Section title="Caractéristiques">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Carburant *"
              value={form.carburant}
              onChange={(e) => set('carburant', e.target.value as Carburant)}
              options={CARBURANTS}
            />
            <Select
              label="Boîte *"
              value={form.boite}
              onChange={(e) => set('boite', e.target.value as Boite)}
              options={BOITES}
            />
            <Input
              label="Dernier kilométrage *"
              type="number"
              value={form.dernierKilometrage}
              onChange={(e) => set('dernierKilometrage', e.target.value)}
              placeholder="0"
              min="0"
              error={errors.dernierKilometrage}
            />
            <Input
              label="Date derniers niveaux"
              type="date"
              value={form.dateDerniersNiveaux}
              onChange={(e) => set('dateDerniersNiveaux', e.target.value)}
            />
          </div>
        </Section>

        {/* Localisation & Statuts */}
        <Section title="Localisation & Statuts">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Localisation *"
              value={form.localisation}
              onChange={(e) => set('localisation', e.target.value as Localisation)}
              options={LOCALISATIONS}
            />
            <div className="flex flex-col justify-end gap-3 pb-1">
              <Checkbox
                label="Pneus neige montés"
                checked={form.pneuNeige}
                onChange={(e) => set('pneuNeige', e.target.checked)}
              />
              <Checkbox
                label="En maintenance"
                checked={form.maintenance}
                onChange={(e) => set('maintenance', e.target.checked)}
              />
              <Checkbox
                label="Buy/Back"
                checked={form.buyBack}
                onChange={(e) => set('buyBack', e.target.checked)}
              />
            </div>
            {form.buyBack && (
              <Input
                label="Date buy/back *"
                type="date"
                value={form.dateBuyBack}
                onChange={(e) => set('dateBuyBack', e.target.value)}
                error={errors.dateBuyBack}
              />
            )}
          </div>
        </Section>

        {/* Note */}
        <Section title="Note courte">
          <Textarea
            value={form.noteCourte}
            onChange={(e) => set('noteCourte', e.target.value)}
            placeholder="Remarques rapides (visible dans la flotte)..."
            rows={2}
          />
        </Section>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-800">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate(isEdit ? `/flotte/${vehicleId}` : '/flotte')}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            icon={<Save className="w-4 h-4" />}
          >
            {isEdit ? 'Enregistrer' : 'Ajouter le véhicule'}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
      {children}
    </div>
  );
}

import React from 'react';
