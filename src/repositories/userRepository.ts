// Repository utilisateurs

import type { User, UserLog } from '@/types';
import { SEED_USERS } from '@/data/seed';
import { generateId } from '@/utils/format';

const STORAGE_KEY = 'fleetprep_users';

function init(): void {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
  }
}

function getAll(): User[] {
  init();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function getById(id: string): User | null {
  return getAll().find((u) => u.id === id) ?? null;
}

function findByCredentials(nom: string, password: string): User | null {
  // Recherche par nom (insensible à la casse) ou par prénom
  const users = getAll();
  return (
    users.find(
      (u) =>
        (u.nom.toLowerCase() === nom.toLowerCase() ||
          (u.prenom && u.prenom.toLowerCase() === nom.toLowerCase())) &&
        u.password === password
    ) ?? null
  );
}

function save(user: User): void {
  const all = getAll();
  const idx = all.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    all[idx] = user;
  } else {
    all.push(user);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function remove(id: string): void {
  const all = getAll().filter((u) => u.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function addLog(userId: string, action: string, details?: string): void {
  const all = getAll();
  const idx = all.findIndex((u) => u.id === userId);
  if (idx >= 0) {
    const log: UserLog = { id: generateId(), date: new Date().toISOString(), action, details };
    all[idx].logs = [log, ...(all[idx].logs || [])].slice(0, 100); // garder 100 derniers
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}

export const userRepository = { getAll, getById, findByCredentials, save, remove, addLog };
