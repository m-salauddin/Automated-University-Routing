"use server";
import { getValidToken } from "../auth";

const API_BASE = process.env.NEXT_PUBLIC_BASE_API;

const getAuthHeaders = async () => {
    const token = await getValidToken();
    if (!token) return null;
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = `Request failed (${res.status})`;
        try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.detail || errorJson.non_field_errors?.[0] || errorJson.message || errorMessage;
        } catch {}
        return { success: false, message: errorMessage, data: null };
    }
    const text = await res.text();
    return { success: true, data: text ? JSON.parse(text) : {} };
};

export const getAdminPanel = async () => {
    try {
        const headers = await getAuthHeaders();
        if (!headers) return { success: false, message: "No access token found", data: null };
        const res = await fetch(`${API_BASE}/panel/admin/`, {
            method: "GET",
            headers,
            cache: "no-store",
        });
        return handleResponse(res);
    } catch (error) {
        return { success: false, message: "Network error occurred", data: null };
    }
};

export const getStudentPanel = async () => {
    try {
        const headers = await getAuthHeaders();
        if (!headers) return { success: false, message: "No access token found", data: null };
        const res = await fetch(`${API_BASE}/panel/student/`, {
            method: "GET",
            headers,
            cache: "no-store",
        });
        return handleResponse(res);
    } catch (error) {
        return { success: false, message: "Network error occurred", data: null };
    }
};

export const getTeacherPanel = async () => {
    try {
        const headers = await getAuthHeaders();
        if (!headers) return { success: false, message: "No access token found", data: null };
        const res = await fetch(`${API_BASE}/panel/teacher/`, {
            method: "GET",
            headers,
            cache: "no-store",
        });
        return handleResponse(res);
    } catch (error) {
        return { success: false, message: "Network error occurred", data: null };
    }
};
