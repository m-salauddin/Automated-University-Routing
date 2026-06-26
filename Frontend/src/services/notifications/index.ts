"use server";

import { getValidToken } from "../auth";

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
