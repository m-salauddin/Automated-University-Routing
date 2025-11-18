"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type UserRole = "student" | "teacher";

export type AuthState = {
  isAuthenticated: boolean;
  username: string | null;
  role: UserRole;
};

export type AuthContextValue = AuthState & {
  setRole: (role: UserRole) => void;
  setUsername: (name: string | null) => void;
  setAuthenticated: (authed: boolean) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("student");

  // hydrate from localStorage on mount
  useEffect(() => {
    try {
      const authed = localStorage.getItem("isAuthenticated") === "true";
      const name = localStorage.getItem("username");
      const storedRole = (localStorage.getItem("role") as UserRole) || "student";
      setIsAuthenticated(authed);
      setUsername(name);
      setRole(storedRole);
    } catch {
      // ignore
    }
  }, []);

  // persist on change
  useEffect(() => {
    try {
      localStorage.setItem("role", role);
    } catch {}
  }, [role]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      username,
      role,
      setRole: (r: UserRole) => setRole(r),
      setUsername: (n: string | null) => {
        setUsername(n);
        try {
          if (n == null) localStorage.removeItem("username");
          else localStorage.setItem("username", n);
        } catch {}
      },
      setAuthenticated: (a: boolean) => {
        setIsAuthenticated(a);
        try {
          localStorage.setItem("isAuthenticated", a ? "true" : "false");
        } catch {}
      },
    }),
    [isAuthenticated, username, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
