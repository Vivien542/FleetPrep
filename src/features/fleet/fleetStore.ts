// Store flotte — gestion centralisée des véhicules
import { create } from 'zustand';
import type { Vehicle, FleetFilters } from '@/types';
import { vehicleRepository } from '@/repositories/vehicleRepository';

interface FleetStore {
  vehicles: Vehicle[];
  filters: FleetFilters;
  load: () => void;
  addVehicle: (v: Vehicle) => void;
  updateVehicle: (v: Vehicle) => void;
  removeVehicle: (id: string) => void;
  setFilter: <K extends keyof FleetFilters>(key: K, value: FleetFilters[K]) => void;
  resetFilters: () => void;
  filteredVehicles: () => Vehicle[];
}

const DEFAULT_FILTERS: FleetFilters = {
  search: '',
  agence: '',
  categorie: '',
  carburant: '',
  localisation: '',
  maintenance: null,
  buyBack: null,
  pneuNeige: null,
};

export const useFleetStore = create<FleetStore>((set, get) => ({
  vehicles: [],
  filters: { ...DEFAULT_FILTERS },

  load: () => {
    set({ vehicles: vehicleRepository.getAll() });
  },

  addVehicle: (v) => {
    vehicleRepository.save(v);
    set({ vehicles: vehicleRepository.getAll() });
  },

  updateVehicle: (v) => {
    vehicleRepository.save(v);
    set({ vehicles: vehicleRepository.getAll() });
  },

  removeVehicle: (id) => {
    vehicleRepository.remove(id);
    set((state) => ({ vehicles: state.vehicles.filter((v) => v.id !== id) }));
  },

  setFilter: (key, value) => {
    set((state) => ({ filters: { ...state.filters, [key]: value } }));
  },

  resetFilters: () => {
    set({ filters: { ...DEFAULT_FILTERS } });
  },

  filteredVehicles: () => {
    const { vehicles, filters } = get();
    return vehicles.filter((v) => {
      // Recherche textuelle plein texte
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const immatDisplay = `${v.immatriculation.slice(0, 2)}-${v.immatriculation.slice(2, 5)}-${v.immatriculation.slice(5)}`.toLowerCase();
        const match =
          v.immatriculation.toLowerCase().includes(q) ||
          immatDisplay.includes(q) ||
          v.marque.toLowerCase().includes(q) ||
          v.modele.toLowerCase().includes(q) ||
          v.agence.toLowerCase().includes(q) ||
          v.localisation.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.agence && v.agence !== filters.agence) return false;
      if (filters.categorie && v.categorie !== filters.categorie) return false;
      if (filters.carburant && v.carburant !== filters.carburant) return false;
      if (filters.localisation && v.localisation !== filters.localisation) return false;
      if (filters.maintenance !== null && v.maintenance !== filters.maintenance) return false;
      if (filters.buyBack !== null && v.buyBack !== filters.buyBack) return false;
      if (filters.pneuNeige !== null && v.pneuNeige !== filters.pneuNeige) return false;
      return true;
    });
  },
}));
