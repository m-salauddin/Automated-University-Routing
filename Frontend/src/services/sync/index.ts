/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getValidToken } from "../auth";

const API_BASE = process.env.NEXT_PUBLIC_BASE_API;

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `Request failed`;
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage =
                errorJson.detail ||
                errorJson.non_field_errors?.[0] ||
                errorJson.message ||
                errorMessage;
        } catch {
            console.error(`[API] Non-JSON Error: ${errorText.slice(0, 100)}`);
        }
        return { success: false, message: `${errorMessage} (Code: ${res.status})`, data: null };
    }

    if (res.status === 204) {
        return { success: true, data: null };
    }

    const data = await res.json();
    return { success: true, data };
};

export const exportExcel = async (modelName: string) => {
    try {
        const token = await getValidToken();

        if (!token) return { success: false, message: "No access token found. Please log in.", data: null };

        const res = await fetch(`${API_BASE}/academic/export-excel/?model_name=${modelName}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            return { success: false, message: `Export failed: ${errorText || res.statusText}`, data: null };
        }

        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");
        return { success: true, data: base64 };
    } catch (error) {
        console.error("[Sync] Export Excel error:", error);
        return { success: false, message: "Network error exporting excel", data: null };
    }
};

export const importExcel = async (formData: FormData) => {
    try {
        const token = await getValidToken();

        if (!token) return { success: false, message: "No access token found. Please log in.", data: null };

        const res = await fetch(`${API_BASE}/academic/import-excel/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                
            },
            body: formData,
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Sync] Import Excel error:", error);
        return { success: false, message: "Network error importing excel", data: null };
    }
};

export const syncExcelSnapshot = async (formData: FormData) => {
    try {
        const token = await getValidToken();

        if (!token) return { success: false, message: "No access token found. Please log in.", data: null };

        const res = await fetch(`${API_BASE}/academic/sync/excel//`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Sync] Sync Excel error:", error);
        return { success: false, message: "Network error syncing excel snapshot", data: null };
    }
};

export const getSyncExcelSnapshot = async () => {
    try {
        const token = await getValidToken();

        if (!token) return { success: false, message: "No access token found. Please log in.", data: null };

        const res = await fetch(`${API_BASE}/academic/sync/excel/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Sync] Get sync excel error:", error);
        return { success: false, message: "Network error fetching sync excel status", data: null };
    }
};

export const manageSnapshot = async (action: "backup" | "restore", name?: string, backupId?: number) => {
    try {
        const token = await getValidToken();

        if (!token) return { success: false, message: "No access token found. Please log in.", data: null };

        const bodyData: Record<string, any> = { action };
        if (name !== undefined) bodyData.name = name;
        if (backupId !== undefined) bodyData.backup_id = backupId;

        const res = await fetch(`${API_BASE}/academic/sync/snapshot/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyData),
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Sync] Manage snapshot error:", error);
        return { success: false, message: "Network error managing snapshot", data: null };
    }
};
