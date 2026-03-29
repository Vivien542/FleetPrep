// Utilitaires de formatage pour FleetPrep

import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une immatriculation pour l'affichage : XX123XX → XX-123-XX
 */
export function formatImmatriculation(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[-\s]/g, '');
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 2)}-${cleaned.slice(2, 5)}-${cleaned.slice(5, 7)}`;
  }
  return raw;
}

/**
 * Normalise une immatriculation pour le stockage : retire tirets et espaces, majuscules
 */
export function normalizeImmatriculation(input: string): string {
  return input.toUpperCase().replace(/[-\s]/g, '');
}

/**
 * Valide le format d'immatriculation française moderne : AA-123-BB
 */
export function isValidImmatriculation(raw: string): boolean {
  const cleaned = normalizeImmatriculation(raw);
  return /^[A-Z]{2}[0-9]{3}[A-Z]{2}$/.test(cleaned);
}

/**
 * Formate un kilométrage avec séparateurs de milliers
 */
export function formatKilometrage(km: number): string {
  return new Intl.NumberFormat('fr-FR').format(km) + ' km';
}

/**
 * Formate une date ISO en format français lisible
 */
export function formatDate(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, 'dd/MM/yyyy', { locale: fr });
  } catch {
    return dateStr;
  }
}

/**
 * Formate une date ISO avec heure
 */
export function formatDateHeure(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, 'dd/MM/yyyy à HH:mm', { locale: fr });
  } catch {
    return dateStr;
  }
}

/**
 * Formate une date pour affichage court (ex: "lun. 28 mars")
 */
export function formatDateCourt(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) return dateStr;
    return format(date, 'EEE d MMM', { locale: fr });
  } catch {
    return dateStr;
  }
}

/**
 * Retourne le label d'autonomie selon le type de carburant
 * - Électrique : pourcentage (0-100%)
 * - Thermique : niveau sur 8 (0-8)
 */
export function formatAutonomie(autonomie: number, carburant: string): string {
  if (carburant === 'Electrique') {
    return `${autonomie}%`;
  }
  return `${autonomie}/8`;
}

/**
 * Génère un identifiant unique simple
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Génère la valeur du QR code pour un véhicule
 */
export function generateQrCodeValue(vehicleId: string): string {
  // En production, ce serait l'URL complète de l'application
  return `fleetprep://vehicle/${vehicleId}`;
}
