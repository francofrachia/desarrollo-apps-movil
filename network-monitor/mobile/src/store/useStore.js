import { create } from 'zustand';
import { getMeasurements } from '../db/database';

export const useStore = create((set) => ({
  isScanning: false,
  lastMeasurement: null,
  history: [],
  setIsScanning: (status) => set({ isScanning: status }),
  setLastMeasurement: (data) => set({ lastMeasurement: data }),
  loadHistory: async () => {
    const data = await getMeasurements();
    set({ history: data });
  },
}));
