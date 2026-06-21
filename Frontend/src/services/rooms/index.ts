/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { cookies } from "next/headers";

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

export const getAllRooms = async (search?: string) => {
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) return { success: false, message: "No access token found", data: null };

        const queryParams = new URLSearchParams();
        if (search) {
            queryParams.append("search", search);
        }
        const queryString = queryParams.toString();

        const res = await fetch(`${API_BASE}/academic/rooms/${queryString ? `?${queryString}` : ""}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Rooms] Fetch error:", error);
        return { success: false, message: "Network error fetching rooms", data: null };
    }
};

export const createRoom = async (roomData: any) => {
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/academic/rooms/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(roomData),
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Rooms] Create error:", error);
        return { success: false, message: "Network error creating room", data: null };
    }
};

export const getRoomDetails = async (roomId: number | string) => {
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/academic/rooms/${roomId}/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Rooms] Read details error:", error);
        return { success: false, message: "Network error fetching room details", data: null };
    }
};

export const updateRoom = async (roomId: number | string, roomData: any) => {
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/academic/rooms/${roomId}/`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(roomData),
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Rooms] Update error:", error);
        return { success: false, message: "Network error updating room", data: null };
    }
};

export const partialUpdateRoom = async (roomId: number | string, roomData: any) => {
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/academic/rooms/${roomId}/`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(roomData),
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Rooms] Partial update error:", error);
        return { success: false, message: "Network error updating room", data: null };
    }
};

export const deleteRoom = async (roomId: number | string) => {
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/academic/rooms/${roomId}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Rooms] Delete error:", error);
        return { success: false, message: "Network error deleting room", data: null };
    }
};
