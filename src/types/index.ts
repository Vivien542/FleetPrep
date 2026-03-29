// Types métier FleetPrep
// Toutes les interfaces sont centralisées ici pour faciliter la maintenance

// ─── ÉNUMÉRATIONS ──────────────────────────────────────────────────────────────

export type Agence = 'Europcar' | 'Goldcar';

export type CategorieVehicule = 'B' | 'C' | 'Prestige' | 'Electrique' | 'Minibus';

export type Carburant = 'Essence' | 'Diesel' | 'Electrique';

export type Boite = 'Manuelle' | 'Automatique';

export type Localisation =
  | 'Agence'
  | 'Base arrière'
  | 'Maintenance'
  | 'Parc du midi'
  | 'Bloquée Buy/Back';

// ─── UTILISATEUR ───────────────────────────────────────────────────────────────

export interface UserLog {
  id: string;
  date: string;
  action: string;
  details?: string;
}

export interface User {
  id: string;
  isAdmin: boolean;
  password: string; // MVP local uniquement — à remplacer par hash en prod
  nom: string;
  prenom?: string;
  role: string; // ex: Préparateur, Chef d'équipe, Admin, Convoyeur
  telephone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
  logs: UserLog[];
}

// ─── VÉHICULE ──────────────────────────────────────────────────────────────────

export interface PreparationRecord {
  id: string;
  vehicleId: string;
  date: string; // ISO
  kilometrage: number;
  autonomie: number;
  carburantMis?: number;
  commentaire?: string;
  preparateurIds: string[];
  blockedMaintenance?: boolean;
  blockedBuyBack?: boolean;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  kilometrage: number;
  raison: string;
  commentaire?: string;
  preparateurIds: string[];
}

export interface DamageRecord {
  id: string;
  vehicleId: string;
  userIds: string[];
  date: string;
  zone: string;
  prestationsNecessaires?: string;
  description?: string;
  commentaires?: string;
  photos: string[];
  montant?: number;
  facture: boolean;
  regle: boolean;
}

export interface VehicleNote {
  id: string;
  vehicleId: string;
  date: string;
  userId: string;
  contenu: string;
}

export interface Vehicle {
  id: string;
  qrCodeValue: string;
  immatriculation: string; // stocké sans tirets : XX123XX
  agence: Agence;
  categorie: CategorieVehicule;
  marque: string;
  modele: string;
  dernierKilometrage: number;
  dateDerniersNiveaux?: string;
  carburant: Carburant;
  noteCourte?: string;
  boite: Boite;
  pneuNeige: boolean;
  buyBack: boolean;
  dateBuyBack?: string;
  maintenance: boolean;
  localisation: Localisation;
  createdAt: string;
  updatedAt: string;
  preparationHistory: PreparationRecord[];
  maintenanceHistory: MaintenanceRecord[];
  damageHistory: DamageRecord[];
  noteHistory: VehicleNote[];
}

// ─── PLANNING / JOURNÉE ────────────────────────────────────────────────────────

export interface DayStaff {
  equipeMatin: string[]; // IDs utilisateurs
  equipeSoir: string[];
  chefs?: string[];
  cdd?: string[];
  interimaires?: string[];
}

export interface DayStats {
  nombreVehiculesPrepares: number;
  topPreparateurs?: Array<{
    userId: string;
    count: number;
  }>;
}

export interface DayRecord {
  id: string;
  date: string; // YYYY-MM-DD
  personnel: DayStaff;
  stats: DayStats;
  releveCarburant?: string;
  notes?: string;
  absencesRetards?: string;
  departs?: number;
  retours?: number;
}

// ─── AUTH ──────────────────────────────────────────────────────────────────────

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// ─── FILTRES FLOTTE ────────────────────────────────────────────────────────────

export interface FleetFilters {
  search: string;
  agence: Agence | '';
  categorie: CategorieVehicule | '';
  carburant: Carburant | '';
  localisation: Localisation | '';
  maintenance: boolean | null;
  buyBack: boolean | null;
  pneuNeige: boolean | null;
}
