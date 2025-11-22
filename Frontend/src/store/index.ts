import { configureStore } from "@reduxjs/toolkit";
import teacherAvailabilityReducer from "./teacherAvailabilitySlice";
import authReducer from "./authSlice";

export const store = configureStore({
  reducer: {
    teacherAvailability: teacherAvailabilityReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
