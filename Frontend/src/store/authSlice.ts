import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";

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

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const decodeRoleFromToken = (token: string): UserRole => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const rawRole = JSON.parse(jsonPayload).role;

    const role = rawRole ? rawRole.toLowerCase() : null;

    if (role === "teacher" || role === "student" || role === "admin") {
      return role;
    }
    return "student";
  } catch (error) {
    console.error("Failed to decode token", error);
    return null;
  }
};

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

export const initializeAuth = () => (dispatch: Dispatch) => {
  try {
    dispatch(setLoading(true));
    const token = getCookie("accessToken");

    if (token) {
      const role = decodeRoleFromToken(token);
      if (role) {
        dispatch(setUserData({ role }));
        dispatch(setAuthenticated(true));
      } else {
        dispatch(setAuthenticated(false));
      }
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