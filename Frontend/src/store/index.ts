import { configureStore } from "@reduxjs/toolkit";
import teacherAvailabilityReducer from "./teacherAvailabilitySlice";
import authReducer from "./authSlice";
import classOffReducer from "./classOffSlice";

export const store = configureStore({
  reducer: {
    teacherAvailability: teacherAvailabilityReducer,
    auth: authReducer,
    classOff: classOffReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
