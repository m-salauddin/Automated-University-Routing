"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

const getValidToken = async (): Promise<string | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return null;

    try {
        const decoded = jwtDecode<{ exp?: number; token_type?: string }>(token);
        const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : false;
        if (!isExpired) return token;
    } catch {
        console.warn("[Auth] Could not decode token — will try refresh");
    }

    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (refreshToken) {
        try {
            const refreshRes = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API}/token/refresh/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: refreshToken }),
                    cache: "no-store",
                }
            );
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                const newToken = data.access;
                if (newToken) {
                    cookieStore.set("accessToken", newToken, { httpOnly: false, secure: process.env.NODE_ENV === "production", path: "/" });
                    return newToken;
                }
            }
        } catch (e) {
            console.warn("[Auth] Token refresh error:", e);
        }
    }

    return token;
};

export const getAllLogs = async () => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found" };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/logs/all/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errText = await res.text();
            return { success: false, message: `Failed to fetch logs: ${res.status}` };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error("[Logs] Fetch all logs error:", error);
        return { success: false, message: "Failed to fetch logs" };
    }
};

export const getRecentLogs = async () => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found" };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/logs/recent/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errText = await res.text();
            return { success: false, message: `Failed to fetch recent logs: ${res.status}` };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error("[Logs] Fetch recent logs error:", error);
        return { success: false, message: "Failed to fetch recent logs" };
    }
};

export const hideLog = async (logId: number | string) => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found" };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/logs/${logId}/hide/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errText = await res.text();
            return { success: false, message: `Failed to hide log: ${res.status}` };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error("[Logs] Hide log error:", error);
        return { success: false, message: "Failed to hide log" };
    }
};

export const createLog = async (action: string, message: string) => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found" };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/logs/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ action, message }),
            cache: "no-store",
        });

        if (!res.ok) {
            const errText = await res.text();
            console.warn("[Logs] Failed to create log:", res.status, errText);
            return { success: false, message: `Failed to create log: ${res.status}` };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error("[Logs] Create log error:", error);
        return { success: false, message: "Failed to create log" };
    }
};
