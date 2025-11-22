import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ClassOffState = {
  offMap: Record<string, true>;
};

const STORAGE_KEY = "classOffMap";

function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function getLocalISODate(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  return `${year}-${month}-${day}`;
}

export function buildKey(
  date: string,
  teacherId: string,
  startTime: string
): string {
  return `${date}|${teacherId}|${startTime}`;
}

function loadInitialState(): ClassOffState {
  if (typeof window === "undefined") return { offMap: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { offMap: {} };
    const parsed = JSON.parse(raw) as ClassOffState | undefined;
    if (!parsed || typeof parsed !== "object" || !parsed.offMap) {
      return { offMap: {} };
    }
    const today = getLocalISODate();
    const cleaned: Record<string, true> = {};
    for (const key of Object.keys(parsed.offMap)) {
      if (key.startsWith(`${today}|`)) cleaned[key] = true;
    }
    return { offMap: cleaned };
  } catch {
    return { offMap: {} };
  }
}

const initialState: ClassOffState = loadInitialState();

export const classOffSlice = createSlice({
  name: "classOff",
  initialState,
  reducers: {
    markOff(
      state,
      action: PayloadAction<{
        teacherId: string;
        startTime: string; // HH:MM:SS
        date?: string; // yyyy-mm-dd
      }>
    ) {
      const { teacherId, startTime } = action.payload;
      if (!teacherId || !startTime) return;
      const date = action.payload.date ?? getLocalISODate();
      const key = buildKey(date, teacherId, startTime);
      state.offMap[key] = true;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    },
    markOn(
      state,
      action: PayloadAction<{
        teacherId: string;
        startTime: string;
        date?: string;
      }>
    ) {
      const { teacherId, startTime } = action.payload;
      if (!teacherId || !startTime) return;
      const date = action.payload.date ?? getLocalISODate();
      const key = buildKey(date, teacherId, startTime);
      if (state.offMap[key]) delete state.offMap[key];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    },
    cleanupForToday(state) {
      const today = getLocalISODate();
      const next: Record<string, true> = {};
      for (const key of Object.keys(state.offMap)) {
        if (key.startsWith(`${today}|`)) next[key] = true;
      }
      state.offMap = next;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    },
    resetAll(state) {
      state.offMap = {};
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    },
  },
});

export const { markOff, markOn, cleanupForToday, resetAll } = classOffSlice.actions;

export default classOffSlice.reducer;

export const isSlotOff = (
  state: { classOff: ClassOffState },
  teacherId: string | undefined,
  startTime: string | undefined,
  date: string = getLocalISODate()
): boolean => {
  if (!teacherId || !startTime) return false;
  const key = buildKey(date, teacherId, startTime);
  return !!state.classOff.offMap[key];
};
