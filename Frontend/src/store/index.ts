import { configureStore } from "@reduxjs/toolkit";
import teacherAvailabilityReducer from "./teacherAvailabilitySlice";
import authReducer from "./authSlice";
import classOffReducer from "./classOffSlice";
import routineReducer from "./routineSlice";

export const store = configureStore({
  reducer: {
    teacherAvailability: teacherAvailabilityReducer,
    auth: authReducer,
    classOff: classOffReducer,
    routine: routineReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
