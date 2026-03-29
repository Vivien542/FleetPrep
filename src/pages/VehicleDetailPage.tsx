// Page de détail d'un véhicule
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Edit2, Trash2, ClipboardCheck, Car,
  Gauge, Calendar, MapPin, QrCode, ChevronDown, ChevronUp,
  Wrench, FileText, AlertCircle
} from 'lucide-react';
import { QRCodeSVG as QRCode } from 'qrcode.react';
import { vehicleRepository } from '@/repositories/vehicleRepository';
import { userRepository } from '@/repositories/userRepository';
import { useFleetStore } from '@/features/fleet/fleetStore';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { VehicleStatusBadges } from '@/components/vehicle/VehicleStatusBadges';
import { AutonomieIndicator } from '@/components/vehicle/AutonomieIndicator';
import { ConfirmModal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatImmatriculation, formatKilometrage, formatDateHeure, formatDate } from '@/utils/format';
import type { Vehicle } from '@/types';
import { cn } from '@/lib/cn';

export function VehicleDetailPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();
  const { removeVehicle } = useFleetStore();
  const toast = useToast();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [showPrepHistory, setShowPrepHistory] = useState(true);
  const [showMaintHistory, setShowMaintHistory] = useState(false);
  const [showNoteHistory, setShowNoteHistory] = useState(false);
  const [showDamageHistory, setShowDamageHistory] = useState(false);

  useEffect(() => {
    if (!vehicleId) return;
    const v = vehicleRepository.getById(vehicleId);
    setVehicle(v);
  }, [vehicleId]);

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="w-10 h-10 text-gray-600" />
        <p className="text-gray-500">Véhicule introuvable.</p>
        <Button onClick={() => navigate('/flotte')}>Retour à la flotte</Button>
      </div>
    );
  }

  const handleDelete = () => {
    removeVehicle(vehicle.id);
    toast.success(`Véhicule ${formatImmatriculation(vehicle.immatriculation)} supprimé.`);
    navigate('/flotte');
  };

  // Couleur dominante selon agence
  const agenceColor = vehicle.agence === 'Europcar'
    ? 'from-green-900/40 to-transparent border-green-800/30'
    : 'from-yellow-900/30 to-transparent border-yellow-800/30';

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Actions header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={() => navigate('/flotte')}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour flotte
        </button>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            icon={<ClipboardCheck className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/preparation/${vehicle.id}`)}
          >
            Préparer
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Edit2 className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/flotte/${vehicle.id}/modifier`)}
          >
            Modifier
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setConfirmDelete(true)}
          >
            Supprimer
          </Button>
        </div>
      </div>

      {/* Bloc principal */}
      <div className={cn(
        'bg-gray-900 border rounded-xl overflow-hidden',
        vehicle.agence === 'Europcar' ? 'border-green-800/30' : 'border-yellow-700/30'
      )}>
        {/* Header coloré agence */}
        <div className={cn('bg-gradient-to-r p-5 border-b', agenceColor)}>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <h1 className="text-2xl font-bold font-mono text-white tracking-wider">
                  {formatImmatriculation(vehicle.immatriculation)}
                </h1>
                <Badge variant={vehicle.agence === 'Europcar' ? 'europcar' : 'goldcar'} size="md">
                  {vehicle.agence}
                </Badge>
                <Badge variant="muted" size="md">{vehicle.categorie}</Badge>
              </div>
              <p className="text-lg text-gray-300">{vehicle.marque} {vehicle.modele}</p>
              <p className="text-sm text-gray-500 mt-1">{vehicle.carburant} · {vehicle.boite}</p>
            </div>
            {/* QR code toggle */}
            <div>
              <button
                onClick={() => setShowQr(!showQr)}
                className="flex flex-col items-center gap-1 p-3 bg-gray-800/60 hover:bg-gray-700/60 border border-gray-700 rounded-xl transition-colors"
              >
                <QrCode className="w-5 h-5 text-gray-400" />
                <span className="text-xs text-gray-500">{showQr ? 'Masquer' : 'QR Code'}</span>
              </button>
              {showQr && (
                <div className="mt-2 p-3 bg-white rounded-xl">
                  {/* URL toujours recalculée dynamiquement selon l'hébergement */}
                  <QRCode value={`${window.location.origin}/flotte/${vehicle.id}`} size={120} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Corps infos */}
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <InfoItem icon={<Gauge className="w-4 h-4" />} label="Kilométrage">
            {formatKilometrage(vehicle.dernierKilometrage)}
          </InfoItem>
          <InfoItem icon={<MapPin className="w-4 h-4" />} label="Localisation">
            <LocalisationBadge localisation={vehicle.localisation} />
          </InfoItem>
          <InfoItem icon={<Calendar className="w-4 h-4" />} label="Derniers niveaux">
            {vehicle.dateDerniersNiveaux ? formatDate(vehicle.dateDerniersNiveaux) : '—'}
          </InfoItem>
          <InfoItem icon={<Car className="w-4 h-4" />} label="Dernière autonomie">
            {vehicle.preparationHistory.length > 0 ? (
              <AutonomieIndicator
                autonomie={vehicle.preparationHistory[0].autonomie}
                carburant={vehicle.carburant}
                showLabel
              />
            ) : '—'}
          </InfoItem>

          {/* Statuts */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-4 flex flex-wrap gap-2 items-center pt-2 border-t border-gray-800">
            <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Statuts :</span>
            <VehicleStatusBadges vehicle={vehicle} size="md" />
            {vehicle.buyBack && vehicle.dateBuyBack && (
              <span className="text-xs text-gray-500">depuis le {formatDate(vehicle.dateBuyBack)}</span>
            )}
            {!vehicle.maintenance && !vehicle.buyBack && !vehicle.pneuNeige && (
              <Badge variant="success" size="md">Disponible</Badge>
            )}
          </div>

          {/* Note courte */}
          {vehicle.noteCourte && (
            <div className="col-span-2 sm:col-span-3 lg:col-span-4">
              <div className="bg-yellow-900/20 border border-yellow-800/40 rounded-lg px-3 py-2.5">
                <p className="text-xs text-yellow-400 font-medium mb-0.5">Note</p>
                <p className="text-sm text-yellow-200">{vehicle.noteCourte}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historique préparations */}
      <HistorySection
        title="Historique des préparations"
        count={vehicle.preparationHistory.length}
        icon={<ClipboardCheck className="w-4 h-4" />}
        open={showPrepHistory}
        onToggle={() => setShowPrepHistory(!showPrepHistory)}
      >
        {vehicle.preparationHistory.length === 0 ? (
          <EmptyHistory message="Aucune préparation enregistrée." />
        ) : (
          <div className="space-y-2">
            {vehicle.preparationHistory.map((prep) => (
              <div key={prep.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-200">{formatDateHeure(prep.date)}</span>
                  <div className="flex gap-2 items-center">
                    <span className="text-xs text-gray-500">{formatKilometrage(prep.kilometrage)}</span>
                    <AutonomieIndicator autonomie={prep.autonomie} carburant={vehicle.carburant} />
                    {prep.blockedMaintenance && <Badge variant="maintenance" size="sm">→ Maintenance</Badge>}
                    {prep.blockedBuyBack && <Badge variant="buyback" size="sm">→ Buy/Back</Badge>}
                  </div>
                </div>
                {prep.carburantMis !== undefined && prep.carburantMis > 0 && (
                  <p className="text-xs text-gray-500">Carburant mis : {prep.carburantMis}L</p>
                )}
                {prep.commentaire && (
                  <p className="text-xs text-gray-400 mt-1">{prep.commentaire}</p>
                )}
                <PreparateursLine ids={prep.preparateurIds} />
              </div>
            ))}
          </div>
        )}
      </HistorySection>

      {/* Historique maintenance */}
      <HistorySection
        title="Historique maintenance"
        count={vehicle.maintenanceHistory.length}
        icon={<Wrench className="w-4 h-4" />}
        open={showMaintHistory}
        onToggle={() => setShowMaintHistory(!showMaintHistory)}
        accent="red"
      >
        {vehicle.maintenanceHistory.length === 0 ? (
          <EmptyHistory message="Aucune maintenance enregistrée." />
        ) : (
          <div className="space-y-2">
            {vehicle.maintenanceHistory.map((m) => (
              <div key={m.id} className="bg-red-900/10 border border-red-900/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-200">{formatDateHeure(m.date)}</span>
                  <span className="text-xs text-gray-500">{formatKilometrage(m.kilometrage)}</span>
                </div>
                <p className="text-sm text-red-300 font-medium">{m.raison}</p>
                {m.commentaire && <p className="text-xs text-gray-400 mt-1">{m.commentaire}</p>}
                <PreparateursLine ids={m.preparateurIds} />
              </div>
            ))}
          </div>
        )}
      </HistorySection>

      {/* Notes véhicule */}
      <HistorySection
        title="Notes"
        count={vehicle.noteHistory.length}
        icon={<FileText className="w-4 h-4" />}
        open={showNoteHistory}
        onToggle={() => setShowNoteHistory(!showNoteHistory)}
      >
        {vehicle.noteHistory.length === 0 ? (
          <EmptyHistory message="Aucune note." />
        ) : (
          <div className="space-y-2">
            {vehicle.noteHistory.map((n) => {
              const author = userRepository.getById(n.userId);
              return (
                <div key={n.id} className="bg-gray-800/50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{formatDateHeure(n.date)}</span>
                    {author && <span className="text-xs text-gray-500">{author.prenom} {author.nom}</span>}
                  </div>
                  <p className="text-sm text-gray-300">{n.contenu}</p>
                </div>
              );
            })}
          </div>
        )}
      </HistorySection>

      {/* Dommages */}
      <HistorySection
        title="Dommages"
        count={vehicle.damageHistory.length}
        icon={<AlertCircle className="w-4 h-4" />}
        open={showDamageHistory}
        onToggle={() => setShowDamageHistory(!showDamageHistory)}
        accent="yellow"
      >
        {vehicle.damageHistory.length === 0 ? (
          <EmptyHistory message="Aucun dommage enregistré." />
        ) : (
          <div className="space-y-2">
            {vehicle.damageHistory.map((d) => (
              <div key={d.id} className="bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
                  <span className="text-sm font-medium text-gray-200">{d.zone}</span>
                  <span className="text-xs text-gray-500">{formatDate(d.date)}</span>
                </div>
                {d.description && <p className="text-xs text-gray-400">{d.description}</p>}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {d.montant && <Badge variant="warning" size="sm">{d.montant}€</Badge>}
                  <Badge variant={d.regle ? 'success' : 'danger'} size="sm">
                    {d.regle ? 'Réglé' : 'Non réglé'}
                  </Badge>
                  <Badge variant={d.facture ? 'info' : 'muted'} size="sm">
                    {d.facture ? 'Facturé' : 'Non facturé'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </HistorySection>

      {/* Modal confirmation suppression */}
      <ConfirmModal
        open={confirmDelete}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
        title="Supprimer le véhicule"
        message={`Êtes-vous sûr de vouloir supprimer le véhicule ${formatImmatriculation(vehicle.immatriculation)} ? Cette action est irréversible.`}
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}

// ─── Composants locaux ──────────────────────────────────────────────────────────

function InfoItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium uppercase tracking-wider">
        {icon}
        {label}
      </div>
      <div className="text-sm text-gray-200">{children}</div>
    </div>
  );
}

function HistorySection({
  title, count, icon, open, onToggle, children, accent
}: {
  title: string;
  count: number;
  icon: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  accent?: 'red' | 'yellow';
}) {
  return (
    <Card className="!p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-gray-400',
            accent === 'red' && 'text-red-400',
            accent === 'yellow' && 'text-yellow-400'
          )}>{icon}</span>
          <span className="text-sm font-semibold text-gray-200">{title}</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{count}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-800">
          <div className="mt-3">{children}</div>
        </div>
      )}
    </Card>
  );
}

function PreparateursLine({ ids }: { ids: string[] }) {
  const users = ids.map((id) => userRepository.getById(id)).filter(Boolean);
  if (users.length === 0) return null;
  return (
    <p className="text-xs text-gray-500 mt-1">
      Par : {users.map((u) => `${u!.prenom || ''} ${u!.nom}`).join(', ')}
    </p>
  );
}

function EmptyHistory({ message }: { message: string }) {
  return <p className="text-sm text-gray-600 italic py-2">{message}</p>;
}

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

import React from 'react';
