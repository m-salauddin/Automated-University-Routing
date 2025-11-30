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
        // Append status code for clarity
        return { success: false, message: `${errorMessage} (Code: ${res.status})`, data: null };
    }

    // Handle 204 No Content (often used for DELETE or updates)
    if (res.status === 204) {
        return { success: true, data: null };
    }

    const data = await res.json();
    return { success: true, data };
};

export const getAllCourses = async () => {
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/academic/courses/`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Courses] Fetch error:", error);
        return { success: false, message: "Network error fetching courses", data: null };
    }
};

export const createCourse = async (courseData: any) => {
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/academic/courses/`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(courseData),
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Courses] Create error:", error);
        return { success: false, message: "Network error creating course", data: null };
    }
};

export const updateCourse = async (courseId: number, courseData: any) => {
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/academic/courses/${courseId}/`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(courseData),
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Courses] Update error:", error);
        return { success: false, message: "Network error updating course", data: null };
    }
};

export const deleteCourse = async (courseId: number) => {
    try {
        const cookiesStore = await cookies();
        const token = cookiesStore.get("accessToken")?.value;

        if (!token) return { success: false, message: "No access token found", data: null };

        const res = await fetch(`${API_BASE}/academic/courses/${courseId}/`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        return handleResponse(res);
    } catch (error) {
        console.error("[Courses] Delete error:", error);
        return { success: false, message: "Network error deleting course", data: null };
    }
};