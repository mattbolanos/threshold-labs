import { create } from "zustand";

interface DayOfWeekState {
  dayOfWeek: number;
  setDayOfWeek: (dayOfWeek: number) => void;
}

export const useDayOfWeek = create<DayOfWeekState>((set) => ({
  dayOfWeek: new Date().getDay(),
  setDayOfWeek: (dayOfWeek) => set({ dayOfWeek }),
}));
