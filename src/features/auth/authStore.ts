// Store d'authentification — Zustand
// Gère la session utilisateur en localStorage (MVP local)

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { userRepository } from '@/repositories/userRepository';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (nom: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUser: (updated: User) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: (nom, password) => {
        const found = userRepository.findByCredentials(nom, password);
        if (!found) {
          return { success: false, error: 'Identifiant ou mot de passe incorrect.' };
        }
        set({ user: found, isAuthenticated: true });
        userRepository.addLog(found.id, 'Connexion', `Connexion depuis le navigateur`);
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateUser: (updated) => {
        userRepository.save(updated);
        set({ user: updated });
      },
    }),
    {
      name: 'fleetprep_auth',
      // On ne persiste que l'id et le flag, pas le mot de passe
      partialize: (state) => ({
        user: state.user ? { ...state.user, password: '' } : null,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
