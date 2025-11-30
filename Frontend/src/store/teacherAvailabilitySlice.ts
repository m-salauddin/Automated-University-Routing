import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type TeacherAvailabilityState = {
  // teacherId -> true (On) | false (Off)
  map: Record<string, boolean>;
};

const STORAGE_KEY = "teacherAvailability";

function loadInitialState(): TeacherAvailabilityState {
  if (typeof window === "undefined") return { map: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.map) {
        return { map: parsed.map } as TeacherAvailabilityState;
      }
    }
  } catch {}
  return { map: {} };
}

const initialState: TeacherAvailabilityState = loadInitialState();

export const teacherAvailabilitySlice = createSlice({
  name: "teacherAvailability",
  initialState,
  reducers: {
    setTeacherStatus(
      state,
      action: PayloadAction<{ teacherId: string; isOn: boolean }>
    ) {
      const { teacherId, isOn } = action.payload;
      if (!teacherId) return;
      state.map[teacherId] = isOn;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    },
    toggleTeacherStatus(state, action: PayloadAction<{ teacherId: string }>) {
      const { teacherId } = action.payload;
      if (!teacherId) return;
      const current = state.map[teacherId];
      state.map[teacherId] = !(current === false ? false : true); // default true -> toggle to false
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    },
    bulkSet(state, action: PayloadAction<Record<string, boolean>>) {
      state.map = { ...state.map, ...action.payload };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch {}
    },
    resetAll(state) {
      state.map = {};
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
    },
  },
});

export const { setTeacherStatus, toggleTeacherStatus, bulkSet, resetAll } =
  teacherAvailabilitySlice.actions;

export default teacherAvailabilitySlice.reducer;
