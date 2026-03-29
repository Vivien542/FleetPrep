// Repository véhicules — couche d'abstraction pour le stockage local
// En production, remplacer les appels localStorage par des appels API

import type { Vehicle } from '@/types';
import { SEED_VEHICLES } from '@/data/seed';

const STORAGE_KEY = 'fleetprep_vehicles';

// Initialisation avec les données seed si le stockage est vide
function init(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_VEHICLES));
  }
}

function getAll(): Vehicle[] {
  init();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function getById(id: string): Vehicle | null {
  return getAll().find((v) => v.id === id) ?? null;
}

function getByImmatriculation(immat: string): Vehicle | null {
  const normalized = immat.toUpperCase().replace(/[-\s]/g, '');
  return getAll().find((v) => v.immatriculation === normalized) ?? null;
}

function save(vehicle: Vehicle): void {
  const all = getAll();
  const idx = all.findIndex((v) => v.id === vehicle.id);
  if (idx >= 0) {
    all[idx] = vehicle;
  } else {
    all.push(vehicle);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function remove(id: string): void {
  const all = getAll().filter((v) => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function reset(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_VEHICLES));
}

export const vehicleRepository = { getAll, getById, getByImmatriculation, save, remove, reset };
