/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { resetAuth, setAuthenticated } from "@/store/authSlice";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { logout } from "@/services/auth";

function getAccessTokenFromCookie() {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith("accessToken="));
  if (!match) return null;
  return match.split("=")[1];
}

function isTokenExpired(token: string) {
  try {
    const decoded = jwtDecode<{ exp?: number }>(token);
    if (!decoded.exp) return false;
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true; 
  }
}

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/dashboard");
}

function flushQueuedToast() {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem("pendingToast");
    if (!raw) return;
    sessionStorage.removeItem("pendingToast");
    const { type, msg } = JSON.parse(raw) as { type: string; msg: string };
    if (type === "error") toast.error(msg);
    else if (type === "warning") toast.warning(msg);
    else toast(msg);
  } catch {}
}

export default function TokenGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const isAuthed = useSelector((s: RootState) => s.auth.isAuthenticated);
  const notifiedRef = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      flushQueuedToast();

      if (pathname === "/login" && typeof window !== "undefined") {
        sessionStorage.removeItem("isLoggingOut");
      }

      const token = getAccessTokenFromCookie();
      const hasToken = !!token;

      if (pathname === "/login" && hasToken) {
        if (!isTokenExpired(token)) {
          router.replace("/dashboard/analytics");
          return;
        }
      }

      if (hasToken && isTokenExpired(token)) {
        await logout(); 
        dispatch(resetAuth()); 

        if (isProtectedPath(pathname)) {
          const redirect = encodeURIComponent(pathname);
          router.replace(`/login?redirect=${redirect}`);
          toast.error("Session expired. Please login again.");
        }
        return;
      }

      if (hasToken && !isAuthed) {
        dispatch(setAuthenticated(true));
      } else if (!hasToken && isAuthed) {
        dispatch(resetAuth());
      }

      if (isProtectedPath(pathname) && !hasToken) {
        const isLoggingOut =
          typeof window !== "undefined" &&
          sessionStorage.getItem("isLoggingOut") === "true";

        if (!isLoggingOut) {
          const redirect = encodeURIComponent(pathname);
          router.replace(`/login?redirect=${redirect}`);
        }
      }

      if (!isProtectedPath(pathname)) {
        notifiedRef.current = false;
      }
    };

    checkAuth();
  }, [dispatch, isAuthed, pathname, router]);

  return null;
}
