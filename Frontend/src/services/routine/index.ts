"use server";
import { cookies } from "next/headers";

export interface GetRoutineParams {
    day?: number | string;
    department_id?: number | string;
    semester_id?: number | string;
}

export interface GenerateRoutineParams {
    department_id: number;
    semester_id?: number;
    ignore_warnings?: boolean;
}

const getRoutine = async (params?: GetRoutineParams) => {
    try {
        const queryParams = new URLSearchParams();
        if (params?.day !== undefined && params.day !== null) {
            queryParams.append("day", String(params.day));
        }
        if (params?.department_id !== undefined && params.department_id !== null) {
            queryParams.append("department_id", String(params.department_id));
        }
        if (params?.semester_id !== undefined && params.semester_id !== null) {
            queryParams.append("semester_id", String(params.semester_id));
        }

        const queryString = queryParams.toString();
        const ROUTINE_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/view-routine/${queryString ? `?${queryString}` : ""}`;

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

        // Normalize: handle both plain array and DRF paginated response {count, results: [...]}
        let normalizedData = rawResult;
        if (!Array.isArray(rawResult) && rawResult !== null && typeof rawResult === "object") {
            if (Array.isArray(rawResult.results)) {
                normalizedData = rawResult.results;
            }
        }

        return { success: true, data: normalizedData };
    } catch (error) {
        console.error("[Routine] Failed to fetch routine:", error);
        return { success: false, message: "Failed to fetch routine" };
    }
};

const generateRoutine = async (params: GenerateRoutineParams) => {
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
            body: JSON.stringify(params),
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Routine generation failed (${res.status})`;
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

const rollbackRoutine = async (params: { department_id: number }) => {
    try {
        const ROLLBACK_ROUTINE_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/rollback-routine/`;
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return { success: false, message: "No access token found" };
        }

        const res = await fetch(ROLLBACK_ROUTINE_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Rollback failed (${res.status})`;
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
        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to rollback routine:", error);
        return { success: false, message: "Failed to rollback routine" };
    }
};

export { getRoutine, generateRoutine, rollbackRoutine };