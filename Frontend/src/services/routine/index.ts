"use server";
import { getValidToken } from "../auth";
import { jwtDecode } from "jwt-decode";

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

        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
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
            }
            return { success: false, message: errorMessage };
        }

        const rawResult = await res.json();


        let normalizedData = rawResult;
        if (!Array.isArray(rawResult) && rawResult !== null && typeof rawResult === "object") {
            if (Array.isArray(rawResult.data)) {
                normalizedData = rawResult.data;
            } else if (Array.isArray(rawResult.results)) {
                normalizedData = rawResult.results;
            }
        }

        return { success: true, data: normalizedData };
    } catch (error) {
        console.error("[Routine] Failed to fetch routine:", error);
        return { success: false, message: "Failed to fetch routine" };
    }
};

const getDepartmentRoutine = async () => {
    try {
        const ROUTINE_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/department-routine/`;

        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
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

        let normalizedData = rawResult;
        if (!Array.isArray(rawResult) && rawResult !== null && typeof rawResult === "object") {
            if (Array.isArray(rawResult.data)) {
                normalizedData = rawResult.data;
            } else if (Array.isArray(rawResult.results)) {
                normalizedData = rawResult.results;
            }
        }

        return { success: true, data: normalizedData };
    } catch (error) {
        console.error("[Routine] Failed to fetch department routine:", error);
        return { success: false, message: "Failed to fetch department routine" };
    }
};

const generateRoutine = async (params: GenerateRoutineParams) => {
    try {
        const GENERATE_ROUTINE_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/generate-routine/`;
        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
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
            let errorData = null;
            try {
                const errorJson = JSON.parse(errorText);
                errorData = errorJson;
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
            return { success: false, message: errorMessage, data: errorData };
        }

        const rawResult = await res.json();

        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to generate routine:", error);
        return { success: false, message: "Failed to generate routine" };
    }
};

const rollbackRoutine = async (params: { department_id: number }) => {
    try {
        const ROLLBACK_ROUTINE_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/rollback-routine/`;
        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
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

const cancelClass = async (routineId: number, cancelMessage: string) => {
    try {
        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
        }

        let isAdmin = false;
        try {
            const decoded = jwtDecode<{ role?: string }>(token);
            isAdmin = decoded.role?.toLowerCase() === "admin";
        } catch { }

        const CANCEL_CLASS_URL = isAdmin
            ? `${process.env.NEXT_PUBLIC_BASE_API}/academic/admin/routine/${routineId}/cancel/`
            : `${process.env.NEXT_PUBLIC_BASE_API}/academic/cancel-class/${routineId}/`;

        const body = {
            action: "cancel",
            cancel_message: cancelMessage
        };
        console.log("[CancelClass] POST", CANCEL_CLASS_URL, "body:", JSON.stringify(body));

        const res = await fetch(CANCEL_CLASS_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        console.log("[CancelClass] Response status:", res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("[CancelClass] Error body:", errorText);
            let errorMessage = `Cancellation failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorJson.non_field_errors?.[0] || errorJson.message || errorMessage;
            } catch { }
            return { success: false, message: errorMessage };
        }

        const rawResult = await res.json();
        console.log("[CancelClass] Success:", JSON.stringify(rawResult));
        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to cancel class:", error);
        return { success: false, message: "Failed to cancel class" };
    }
};

const reactivateClass = async (routineId: number) => {
    try {
        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
        }

        let isAdmin = false;
        try {
            const decoded = jwtDecode<{ role?: string }>(token);
            isAdmin = decoded.role?.toLowerCase() === "admin";
        } catch { }

        const CANCEL_CLASS_URL = isAdmin
            ? `${process.env.NEXT_PUBLIC_BASE_API}/academic/admin/routine/${routineId}/cancel/`
            : `${process.env.NEXT_PUBLIC_BASE_API}/academic/cancel-class/${routineId}/`;

        const body = {
            action: "reactivate"
        };
        console.log("[ReactivateClass] POST", CANCEL_CLASS_URL, JSON.stringify(body));

        const res = await fetch(CANCEL_CLASS_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        console.log("[ReactivateClass] Response status:", res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("[ReactivateClass] Error body:", errorText);
            let errorMessage = `Reactivation failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorJson.non_field_errors?.[0] || errorJson.message || errorMessage;
            } catch { }
            return { success: false, message: errorMessage };
        }

        const rawResult = await res.json();
        console.log("[ReactivateClass] Success:", JSON.stringify(rawResult));
        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to activate class:", error);
        return { success: false, message: "Failed to activate class" };
    }
};

const updateCancelMessage = async (routineId: number, cancelMessage: string) => {
    try {
        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
        }

        let isAdmin = false;
        try {
            const decoded = jwtDecode<{ role?: string }>(token);
            isAdmin = decoded.role?.toLowerCase() === "admin";
        } catch { }

        const CANCEL_CLASS_URL = isAdmin
            ? `${process.env.NEXT_PUBLIC_BASE_API}/academic/admin/routine/${routineId}/cancel/`
            : `${process.env.NEXT_PUBLIC_BASE_API}/academic/cancel-class/${routineId}/`;

        const body = {
            action: "update",
            cancel_message: cancelMessage
        };
        console.log("[UpdateCancelMsg] POST", CANCEL_CLASS_URL, JSON.stringify(body));

        const res = await fetch(CANCEL_CLASS_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
            cache: "no-store",
        });

        console.log("[UpdateCancelMsg] Response status:", res.status);

        if (!res.ok) {
            const errorText = await res.text();
            console.error("[UpdateCancelMsg] Error body:", errorText);
            let errorMessage = `Updating cancellation message failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorJson.non_field_errors?.[0] || errorJson.message || errorMessage;
            } catch { }
            return { success: false, message: errorMessage };
        }

        const rawResult = await res.json();
        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to update cancellation message:", error);
        return { success: false, message: "Failed to update cancellation message" };
    }
};

const swapRoutineEntries = async (entry1Id: number, entry2Id: number) => {
    try {
        const SWAP_ROUTINE_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/routine/swap/`;
        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
        }

        const res = await fetch(SWAP_ROUTINE_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ entry1_id: entry1Id, entry2_id: entry2Id }),
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Swap failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorJson.non_field_errors?.[0] || errorJson.message || errorMessage;
            } catch { }
            return { success: false, message: errorMessage };
        }

        const rawResult = await res.json();
        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to swap routine entries:", error);
        return { success: false, message: "Failed to swap routine entries" };
    }
};

const updateRoutineEntry = async (
    entryId: string | number,
    dayId: number,
    timeSlotId: number,
    roomId?: number
) => {
    try {
        const UPDATE_ROUTINE_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/routine/update/${entryId}/`;
        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
        }

        const bodyData: Record<string, any> = {
            day_id: dayId,
            time_slot_id: timeSlotId,
        };
        if (roomId !== undefined && roomId !== null) {
            bodyData.room_id = roomId;
        }

        const res = await fetch(UPDATE_ROUTINE_URL, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(bodyData),
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Update routine entry failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorJson.non_field_errors?.[0] || errorJson.message || errorMessage;
            } catch { }
            return { success: false, message: errorMessage };
        }

        const rawResult = await res.json();
        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to update routine entry:", error);
        return { success: false, message: "Failed to update routine entry" };
    }
};

export interface RequestSwapParams {
    swap_type: "PROXY" | "MUTUAL";
    target_teacher_id: number | string;
    requester_routine_id: number;
    target_routine_id?: number | null;
    swap_date: string;
    reason?: string;
}

const requestSwap = async (params: RequestSwapParams) => {
    try {
        const SWAP_REQUEST_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/swap-request/`;
        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
        }

        const res = await fetch(SWAP_REQUEST_URL, {
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
            let errorMessage = `Swap request failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.non_field_errors?.[0]) {
                    errorMessage = errorJson.non_field_errors[0];
                } else {
                    errorMessage = errorJson.detail || errorJson.message || errorMessage;
                }
            } catch { }
            return { success: false, message: errorMessage };
        }

        const rawResult = await res.json();
        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to request swap:", error);
        return { success: false, message: "Failed to request class swap" };
    }
};

export interface RespondSwapParams {
    request_id: number;
    action: "ACCEPT" | "REJECT";
}

const respondSwap = async (params: RespondSwapParams) => {
    try {
        const SWAP_REQUEST_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/swap-request/`;
        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
        }

        const res = await fetch(SWAP_REQUEST_URL, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(params),
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Swap update failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorJson.non_field_errors?.[0] || errorJson.message || errorMessage;
            } catch { }
            return { success: false, message: errorMessage };
        }

        const rawResult = await res.json();
        return { success: true, data: rawResult };
    } catch (error) {
        console.error("[Routine] Failed to update swap request:", error);
        return { success: false, message: "Failed to respond to swap request" };
    }
};

const getSwapRequests = async () => {
    try {
        const SWAP_REQUEST_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/swap-request/`;
        const token = await getValidToken();

        if (!token) {
            return { success: false, message: "No access token found. Please log in." };
        }

        const res = await fetch(SWAP_REQUEST_URL, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            cache: "no-store",
        });

        if (!res.ok) {
            if (res.status === 405) {
                return { success: true, data: [], isNotSupported: true };
            }
            return { success: false, message: `Failed to fetch swap requests: ${res.status}` };
        }

        const data = await res.json();
        return { success: true, data };
    } catch (error) {
        console.error("[Routine] Failed to fetch swap requests:", error);
        return { success: false, message: "Failed to fetch swap requests" };
    }
};

export {
    getRoutine,
    getDepartmentRoutine,
    generateRoutine,
    rollbackRoutine,
    cancelClass,
    reactivateClass,
    updateCancelMessage,
    swapRoutineEntries,
    updateRoutineEntry,
    requestSwap,
    respondSwap,
    getSwapRequests,
};

// ── Excel Export ─────────────────────────────────────────────────────────────
export const exportExcel = async (modelName: string): Promise<{ success: boolean; blob?: Blob; message?: string }> => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found." };

        const url = `${process.env.NEXT_PUBLIC_BASE_API}/academic/export-excel/?model_name=${encodeURIComponent(modelName)}`;
        const res = await fetch(url, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text();
            let msg = `Export failed (${res.status})`;
            try { msg = JSON.parse(text)?.detail || msg; } catch { /* ignore */ }
            return { success: false, message: msg };
        }

        const blob = await res.blob();
        return { success: true, blob };
    } catch (error) {
        console.error("[Excel] Export error:", error);
        return { success: false, message: "Export failed" };
    }
};

// ── Excel Import ─────────────────────────────────────────────────────────────
export const importExcel = async (modelName: string, file: File): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found." };

        const formData = new FormData();
        formData.append("model_name", modelName);
        formData.append("file", file);

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/import-excel/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
            cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return { success: false, message: data?.detail || data?.message || `Import failed (${res.status})` };
        }
        return { success: true, data };
    } catch (error) {
        console.error("[Excel] Import error:", error);
        return { success: false, message: "Import failed" };
    }
};

// ── Full Sync Download ────────────────────────────────────────────────────────
export const syncDownloadExcel = async (): Promise<{ success: boolean; blob?: Blob; message?: string }> => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found." };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/sync/excel/`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) {
            const text = await res.text();
            let msg = `Sync download failed (${res.status})`;
            try { msg = JSON.parse(text)?.detail || msg; } catch { /* ignore */ }
            return { success: false, message: msg };
        }

        const blob = await res.blob();
        return { success: true, blob };
    } catch (error) {
        console.error("[Sync] Download error:", error);
        return { success: false, message: "Sync download failed" };
    }
};

// ── Full Sync Upload ──────────────────────────────────────────────────────────
export const syncUploadExcel = async (file: File): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found." };

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/sync/excel/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: formData,
            cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return { success: false, message: data?.detail || data?.message || `Sync upload failed (${res.status})` };
        }
        return { success: true, data };
    } catch (error) {
        console.error("[Sync] Upload error:", error);
        return { success: false, message: "Sync upload failed" };
    }
};

// ── Create Snapshot ───────────────────────────────────────────────────────────
export const createSnapshot = async (): Promise<{ success: boolean; data?: any; message?: string }> => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found." };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/sync/snapshot/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            return { success: false, message: data?.detail || data?.message || `Snapshot failed (${res.status})` };
        }
        return { success: true, data };
    } catch (error) {
        console.error("[Snapshot] Error:", error);
        return { success: false, message: "Snapshot failed" };
    }
};

// ── System Settings ───────────────────────────────────────────────────────────
export const getSystemSettings = async (): Promise<{ success: boolean; data?: { is_routine_locked: boolean }; message?: string }> => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found." };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/system-settings/`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { success: false, message: data?.detail || `Failed (${res.status})` };
        return { success: true, data };
    } catch (error) {
        console.error("[Settings] Get error:", error);
        return { success: false, message: "Failed to get system settings" };
    }
};

export const setSystemSettings = async (isLocked: boolean): Promise<{ success: boolean; message?: string }> => {
    try {
        const token = await getValidToken();
        if (!token) return { success: false, message: "No access token found." };

        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/academic/system-settings/`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ is_routine_locked: isLocked }),
            cache: "no-store",
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) return { success: false, message: data?.detail || `Failed (${res.status})` };
        return { success: true };
    } catch (error) {
        console.error("[Settings] Set error:", error);
        return { success: false, message: "Failed to update system settings" };
    }
};