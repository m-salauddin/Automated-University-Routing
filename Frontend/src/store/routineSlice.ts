import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type APIRoutineItem = {
  id: number;
  day: number | string;
  day_name: string;
  start_time: string;
  end_time: string;
  course_name: string;
  course_code: string;
  teacher_name: string;
  department_name: string;
  semester_name: string;
  room_number: string;
  is_cancelled?: boolean;
  cancel_message?: string | null;
};

export interface RoutineState {
    isLocked: boolean;
    routineList: APIRoutineItem[];
    isLoading: boolean;
}

function safeLocalStorageGet(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

function safeLocalStorageSet(key: string, value: string | null) {
    if (typeof window === "undefined") return;
    try {
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, value);
    } catch { }
}

const initialState: RoutineState = {
    isLocked: false,
    routineList: [],
    isLoading: false,
};

if (typeof window !== "undefined") {
    const persistedLocked = safeLocalStorageGet("routine_isLocked");
    if (persistedLocked !== null) {
        initialState.isLocked = persistedLocked === "true";
    }
}

const routineSlice = createSlice({
    name: "routine",
    initialState,
    reducers: {
        setIsLocked(state, action: PayloadAction<boolean>) {
            state.isLocked = action.payload;
            safeLocalStorageSet("routine_isLocked", action.payload ? "true" : "false");
        },
        setRoutineList(state, action: PayloadAction<APIRoutineItem[]>) {
            state.routineList = action.payload;
        },
        setIsLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        swapRoutinesOptimistic(state, action: PayloadAction<{ id1: number; id2: number }>) {
            const item1 = state.routineList.find(r => r.id === action.payload.id1);
            const item2 = state.routineList.find(r => r.id === action.payload.id2);
            if (item1 && item2) {
                const tempDay = item1.day;
                const tempDayName = item1.day_name;
                const tempStart = item1.start_time;
                const tempEnd = item1.end_time;

                item1.day = item2.day;
                item1.day_name = item2.day_name;
                item1.start_time = item2.start_time;
                item1.end_time = item2.end_time;

                item2.day = tempDay;
                item2.day_name = tempDayName;
                item2.start_time = tempStart;
                item2.end_time = tempEnd;
            }
        },
        updateRoutineOptimistic(state, action: PayloadAction<{ id: number; day: number | string; day_name: string; start_time: string; end_time: string }>) {
            const item = state.routineList.find(r => r.id === action.payload.id);
            if (item) {
                item.day = action.payload.day;
                item.day_name = action.payload.day_name;
                item.start_time = action.payload.start_time;
                item.end_time = action.payload.end_time;
            }
        }
    },
});

export const {
    setIsLocked,
    setRoutineList,
    setIsLoading,
    swapRoutinesOptimistic,
    updateRoutineOptimistic
} = routineSlice.actions;

export default routineSlice.reducer;
