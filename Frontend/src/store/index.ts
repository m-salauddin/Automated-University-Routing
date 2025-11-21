import { configureStore } from "@reduxjs/toolkit";
import teacherAvailabilityReducer from "./teacherAvailabilitySlice";

export const store = configureStore({
  reducer: {
    teacherAvailability: teacherAvailabilityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
