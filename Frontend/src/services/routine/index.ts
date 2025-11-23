"use server";
import { cookies } from "next/headers";

const getRoutine = async () => {
    try {
        const ROUTINE_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/view-routine/`;

        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "No access token found" };
        }

        const res = await fetch(ROUTINE_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Routine failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage =
                    errorJson.detail ||
                    errorJson.non_field_errors?.[0] ||
                    errorJson.message ||
                    errorMessage;
            } catch {
                console.error(
                    `[Routine] Non-JSON Error Body: ${errorText.slice(0, 200)}`
                );
            }
            return { success: false, message: errorMessage };
        }

        const rawResult = await res.json();
        console.log("[Routine] API Response:", JSON.stringify(rawResult, null, 2));

        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to fetch routine:", error);
        return { success: false, message: "Failed to fetch routine" };
    }
};

const generateRoutine = async () => {
    try {
        const GENERATE_ROUTINE_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/generate-routine/`;
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "No access token found" };
        }

        const res = await fetch(GENERATE_ROUTINE_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Routine failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage =
                    errorJson.detail ||
                    errorJson.non_field_errors?.[0] ||
                    errorJson.message ||
                    errorMessage;
            } catch {
                console.error(
                    `[Routine] Non-JSON Error Body: ${errorText.slice(0, 200)}`
                );
            }
            return { success: false, message: errorMessage };
        }

        const rawResult = await res.json();
        console.log("[Routine] API Response:", JSON.stringify(rawResult, null, 2));

        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to generate routine:", error);
        return { success: false, message: "Failed to generate routine" };
    }
};

export { getRoutine, generateRoutine };