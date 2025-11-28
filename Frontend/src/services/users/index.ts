/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";

const API_BASE = process.env.NEXT_PUBLIC_BASE_API;

type ActionResponse = {
    success: boolean;
    message?: string;
    data?: any;
};


const getAuthHeaders = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return null;

    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};

const handleResponse = async (res: Response, successCode = 200): Promise<ActionResponse> => {
    if (res.ok) {
        if (res.status === 204) {
            return { success: true, data: null };
        }
        const text = await res.text();
        return { success: true, data: text ? JSON.parse(text) : {} };
    }

    const errorText = await res.text();
    let errorMessage = `Request failed (${res.status})`;

    try {
        const errorJson = JSON.parse(errorText);

        const keys = Object.keys(errorJson);
        if (keys.length > 0 && Array.isArray(errorJson[keys[0]])) {
            errorMessage = `${keys[0]}: ${errorJson[keys[0]][0]}`;
        } else {
            errorMessage =
                errorJson.detail ||
                errorJson.non_field_errors?.[0] ||
                errorJson.message ||
                errorMessage;
        }
    } catch {
        console.error(`[API Error] Non-JSON response: ${errorText.slice(0, 200)}`);
    }

    return { success: false, message: errorMessage, data: null };
};


export const getAllUsers = async (): Promise<ActionResponse> => {
    try {
        const headers = await getAuthHeaders();
        if (!headers) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/users/`, {
            method: "GET",
            headers,
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        return { success: false, message: "Network error occurred", data: null };
    }
};

export const createUser = async (userData: Record<string, any>): Promise<ActionResponse> => {
    try {
        const headers = await getAuthHeaders();
        if (!headers) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/register/`, {
            method: "POST",
            headers,
            body: JSON.stringify(userData),
            cache: "no-store",
        });

        return handleResponse(res, 201);
    } catch (error) {
        return { success: false, message: "Network error occurred", data: null };
    }
};

export const updateUser = async (userId: string, userData: Record<string, any>): Promise<ActionResponse> => {
    try {
        const headers = await getAuthHeaders();
        if (!headers) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/users/${userId}/`, {
            method: "PATCH",
            headers,
            body: JSON.stringify(userData),
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        return { success: false, message: "Network error occurred", data: null };
    }
};

export const deleteUser = async (userId: string): Promise<ActionResponse> => {
    try {
        const headers = await getAuthHeaders();
        if (!headers) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/users/${userId}/`, {
            method: "DELETE",
            headers,
            cache: "no-store",
        });

        return handleResponse(res, 204);
    } catch (error) {
        return { success: false, message: "Network error occurred", data: null };
    }
};