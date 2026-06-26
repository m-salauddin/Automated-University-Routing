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

export const getNotifications = async () => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found" };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/notifications/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errText = await res.text();
            return { success: false, message: `Failed to fetch notifications: ${res.status}` };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error("[Notifications] Fetch error:", error);
        return { success: false, message: "Failed to fetch notifications" };
    }
};

export const getUnreadCount = async () => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found" };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/notifications/unread-count/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errText = await res.text();
            return { success: false, message: `Failed to fetch unread count: ${res.status}` };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error("[Notifications] Fetch unread count error:", error);
        return { success: false, message: "Failed to fetch unread count" };
    }
};

export const markNotificationRead = async (notificationId: number | string) => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found" };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/notifications/${notificationId}/read/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errText = await res.text();
            return { success: false, message: `Failed to mark notification as read: ${res.status}` };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error("[Notifications] Mark read error:", error);
        return { success: false, message: "Failed to mark notification as read" };
    }
};
