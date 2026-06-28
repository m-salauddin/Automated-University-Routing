"use server";

import { getValidToken } from "../auth";

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
