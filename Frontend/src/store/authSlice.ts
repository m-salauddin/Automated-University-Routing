import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
import { getCurrentUser } from "@/services/auth";

export type UserRole = "student" | "teacher" | "admin" | null;

export type AuthState = {
  isAuthenticated: boolean;
  username: string | null;
  role: UserRole;
  email: string | null;
  department_name: string | null;
  department_id: number | null;
  semester_name: string | null;
  student_id: string | null;
  isLoading: boolean;
};

const initialState: AuthState = {
  isAuthenticated: false,
  username: null,
  role: null,
  email: null,
  department_name: null,
  department_id: null,
  semester_name: null,
  student_id: null,
  isLoading: true,
};

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

const preloaded: Partial<AuthState> = {};
if (typeof window !== "undefined") {
  preloaded.username = safeLocalStorageGet("username");
  preloaded.email = safeLocalStorageGet("email");
  preloaded.department_name = safeLocalStorageGet("department_name");
  preloaded.department_id = Number(safeLocalStorageGet("department_id"));
  preloaded.semester_name = safeLocalStorageGet("semester_name");
}

const authSlice = createSlice({
  name: "auth",
  initialState: { ...initialState, ...preloaded },
  reducers: {
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
      safeLocalStorageSet("isAuthenticated", action.payload ? "true" : null);
    },
    setUserData(state, action: PayloadAction<Partial<AuthState>>) {
      const {
        username,
        role,
        email,
        department_name,
        department_id,
        semester_name,
      } = action.payload;

      if (username) {
        state.username = username;
        safeLocalStorageSet("username", username);
      }
      if (role) {
        state.role = role;
      }
      if (email) {
        state.email = email;
        safeLocalStorageSet("email", email);
      }
      if (department_name) {
        state.department_name = department_name;
        safeLocalStorageSet("department_name", department_name);
      }
      if (department_id) {
        state.department_id = department_id;
        safeLocalStorageSet("department_id", department_id.toString());
      }
      if (semester_name) {
        state.semester_name = semester_name;
        safeLocalStorageSet("semester_name", semester_name);
      }
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    resetAuth(state) {
      Object.assign(state, initialState);
      const keysToRemove = [
        "isAuthenticated",
        "username",
        "role",
        "email",
        "department_name",
        "semester_name",
        "department_id",
      ];
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
    },
  },
});

export const { setAuthenticated, setUserData, resetAuth, setLoading } =
  authSlice.actions;

export const initializeAuth = () => async (dispatch: Dispatch) => {
  try {
    dispatch(setLoading(true));

    const user = await getCurrentUser();

    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawRole = (user as any).role;
      const normalizedRole = rawRole ? rawRole.toLowerCase() : null;

      let finalRole: UserRole = "student";
      if (normalizedRole === "teacher" || normalizedRole === "student" || normalizedRole === "admin") {
        finalRole = normalizedRole;
      }

      dispatch(setUserData({
        ...user,
        role: finalRole
      }));

      dispatch(setAuthenticated(true));
    } else {
      dispatch(setAuthenticated(false));
    }
  } catch (error) {
    console.error("Auth initialization failed", error);
    dispatch(setAuthenticated(false));
  } finally {
    dispatch(setLoading(false));
  }
};

export default authSlice.reducer;