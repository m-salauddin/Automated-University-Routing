import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface RoutineState {
    isLocked: boolean;
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
};

// Load initial state from local storage
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
    },
});

export const { setIsLocked } = routineSlice.actions;
export default routineSlice.reducer;
