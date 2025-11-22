"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/store";
import { resetAuth, setAuthenticated } from "@/store/authSlice";
import { toast } from "sonner";

function hasAccessTokenCookie() {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith("accessToken="));
}

function isProtectedPath(pathname: string) {
  return pathname.startsWith("/dashboard");
}

function queueToast(type: "error" | "warning" | "message", msg: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("pendingToast", JSON.stringify({ type, msg }));
  } catch {}
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
    flushQueuedToast();

    const hasToken = hasAccessTokenCookie();

    if (hasToken && !isAuthed) {
      dispatch(setAuthenticated(true));
    } else if (!hasToken && isAuthed) {
      dispatch(resetAuth());
    }

    if (isProtectedPath(pathname) && !hasToken) {
      if (!notifiedRef.current) {
        const msg = "You must be logged in to visit this page.";
        queueToast("error", msg);
        notifiedRef.current = true;
      }
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect=${redirect}`);
    }

    if (pathname === "/login" && hasToken) {
      const msg = "You are already logged in.";
      queueToast("warning", msg);
      router.replace("/dashboard/analytics");
      return;
    }

    if (!isProtectedPath(pathname)) {
      notifiedRef.current = false;
    }
  }, [dispatch, isAuthed, pathname, router]);

  return null;
}
