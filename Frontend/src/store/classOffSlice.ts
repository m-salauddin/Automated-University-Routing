import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ClassOffRecord = {
  status: boolean;
  reason: string;
};

export type ClassOffState = {
  offMap: Record<string, ClassOffRecord>;
};

const STORAGE_KEY = "classOffMap";

// --- HELPER 1: Exported Normalize Time ---
export const normalizeTime = (timeStr: string) => {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":");
  // Pad hours with 0 if needed (e.g., "8" -> "08")
  const normalizedH = h.padStart(2, "0");
  return `${normalizedH}:${m}`;
};

// --- HELPER 2: Exported Date Helper ---
export const getLocalISODate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().split("T")[0];
};

// --- HELPER 3: Exported Key Generator ---
export const generateClassKey = (teacherId: string, startTime: string) => {
  const today = getLocalISODate();
  const time = normalizeTime(startTime);
  const safeId = teacherId.trim();
  return `${today}|${safeId}|${time}`;
};

function loadInitialState(): ClassOffState {
  if (typeof window === "undefined") return { offMap: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const rawMap = parsed.offMap || parsed;
      const normalizedMap: Record<string, ClassOffRecord> = {};

      Object.keys(rawMap).forEach((key) => {
        const val = rawMap[key];
        if (typeof val === "boolean") {
          if (val === true) {
            normalizedMap[key] = { status: true, reason: "No reason provided." };
          }
        } else if (typeof val === "object" && val !== null) {
          normalizedMap[key] = {
            status: !!val.status,
            reason: val.reason || "No reason provided.",
          };
        }
      });
      return { offMap: normalizedMap };
    }
  } catch (e) {
    console.error("Failed to load class off state:", e);
  }
  return { offMap: {} };
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
        startTime: string;
        reason?: string;
      }>
    ) {
      const { teacherId, startTime, reason } = action.payload;
      const key = generateClassKey(teacherId, startTime);

      state.offMap[key] = {
        status: true,
        reason: reason || "No reason provided.",
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { }
    },
    markOn(
      state,
      action: PayloadAction<{ teacherId: string; startTime: string }>
    ) {
      const { teacherId, startTime } = action.payload;
      const key = generateClassKey(teacherId, startTime);

      if (state.offMap[key]) {
        delete state.offMap[key];
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { }
    },
    // --- ADDED MISSING REDUCER HERE ---
    cleanupForToday(state) {
      const today = getLocalISODate();
      const keys = Object.keys(state.offMap);

      keys.forEach((key) => {
        // Keys are formatted as: DATE|ID|TIME
        // If the key does not start with today's date, remove it
        if (!key.startsWith(today)) {
          delete state.offMap[key];
        }
      });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch { }
    },
    resetAll(state) {
      state.offMap = {};
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch { }
    },
  },
});

// Export all actions, including cleanupForToday
export const { markOff, markOn, resetAll, cleanupForToday } = classOffSlice.actions;

export default classOffSlice.reducer;