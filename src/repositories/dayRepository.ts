// Repository journées/planning

import type { DayRecord } from '@/types';
import { SEED_DAYS } from '@/data/seed';

const STORAGE_KEY = 'fleetprep_days';

function init(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DAYS));
  }
}

function getAll(): DayRecord[] {
  init();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function getByDate(date: string): DayRecord | null {
  return getAll().find((d) => d.date === date) ?? null;
}

// Retourne les journées d'une semaine (lundi à dimanche)
function getWeek(mondayDate: string): DayRecord[] {
  const all = getAll();
  const monday = new Date(mondayDate);
  const days: DayRecord[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = d.toISOString().slice(0, 10);
    const existing = all.find((r) => r.date === dateStr);
    if (existing) {
      days.push(existing);
    } else {
      // Créer un placeholder vide pour les jours sans données
      days.push({
        id: `day-${dateStr}`,
        date: dateStr,
        personnel: { equipeMatin: [], equipeSoir: [] },
        stats: { nombreVehiculesPrepares: 0 },
      });
    }
  }
  return days;
}

function save(day: DayRecord): void {
  const all = getAll();
  const idx = all.findIndex((d) => d.id === day.id || d.date === day.date);
  if (idx >= 0) {
    all[idx] = day;
  } else {
    all.push(day);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export const dayRepository = { getAll, getByDate, getWeek, save };
