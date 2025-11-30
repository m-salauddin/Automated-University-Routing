"use server"
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cookies } from "next/headers";

interface SemesterData {
    name: string;
    order: number;
    [key: string]: any;
}

export const getAllSemesters = async () => {
    try {
        const SEMESTERS_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/semesters/`;
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "No access token found" };
        }

        const res = await fetch(SEMESTERS_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Semesters failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage =
                    errorJson.detail ||
                    errorJson.non_field_errors?.[0] ||
                    errorJson.message ||
                    errorMessage;
            } catch {
                console.error(
                    `[Auth] Non-JSON Error Body: ${errorText.slice(0, 200)}`
                );
            }
            return { success: false, message: errorMessage };
        }

        const result = await res.json();
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: `Semesters failed: ${error}` };
    }
};

export const addSemester = async (semesterData: SemesterData) => {
    try {
        const SEMESTERS_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/semesters/`;
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "No access token found" };
        }

        const res = await fetch(SEMESTERS_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify(semesterData),
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Creation failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage =
                    errorJson.detail ||
                    errorJson.non_field_errors?.[0] ||
                    errorJson.message ||
                    errorMessage;
            } catch {
                console.error(
                    `[Auth] Non-JSON Error Body: ${errorText.slice(0, 200)}`
                );
            }
            return { success: false, message: errorMessage };
        }

        const result = await res.json();
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: `Creation failed: ${error}` };
    }
};

export const updateSemester = async (
    semesterId: number | string,
    semesterData: SemesterData
) => {
    try {
        const SEMESTERS_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/semesters/${semesterId}/`;
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "No access token found" };
        }

        const res = await fetch(SEMESTERS_URL, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
            body: JSON.stringify(semesterData),
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Update failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage =
                    errorJson.detail ||
                    errorJson.non_field_errors?.[0] ||
                    errorJson.message ||
                    errorMessage;
            } catch {
                console.error(
                    `[Auth] Non-JSON Error Body: ${errorText.slice(0, 200)}`
                );
            }
            return { success: false, message: errorMessage };
        }

        const result = await res.json();
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: `Update failed: ${error}` };
    }
};

export const deleteSemester = async (semesterId: number | string) => {
    try {
        const SEMESTERS_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/semesters/${semesterId}/`;
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "No access token found" };
        }

        const res = await fetch(SEMESTERS_URL, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Delete failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage =
                    errorJson.detail ||
                    errorJson.non_field_errors?.[0] ||
                    errorJson.message ||
                    errorMessage;
            } catch {
                console.error(
                    `[Auth] Non-JSON Error Body: ${errorText.slice(0, 200)}`
                );
            }
            return { success: false, message: errorMessage };
        }

        if (res.status === 204) {
            return { success: true, data: null };
        }

        const text = await res.text();
        const result = text ? JSON.parse(text) : null;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, message: `Delete failed: ${error}` };
    }
};