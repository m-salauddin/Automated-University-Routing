"use server";

import { getValidToken } from "../auth";

export interface CreateNoticePayload {
  notice_type: string;
  title: string;
  message: string;
  target_departments?: number[];
  target_batches?: number[];
}

export const getAllNotices = async () => {
  try {
    const NOTICES_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/notices/`;
    const token = await getValidToken();

    if (!token) {
      return { success: false, message: "No access token found. Please log in." };
    }

    const res = await fetch(NOTICES_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `Failed to get notices (${res.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.non_field_errors?.[0] || errorJson.message || errorMessage;
      } catch {
        console.error(`[Notices] Non-JSON Error Body: ${errorText.slice(0, 200)}`);
      }
      return { success: false, message: errorMessage };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("[Notices] Error fetching notices:", error);
    return { success: false, message: "An error occurred while fetching notices" };
  }
};

export const createNotice = async (payload: CreateNoticePayload) => {
  try {
    const NOTICES_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/notices/`;
    const token = await getValidToken();

    if (!token) {
      return { success: false, message: "No access token found. Please log in." };
    }

    const res = await fetch(NOTICES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `Failed to create notice (${res.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (typeof errorJson === "object" && errorJson !== null) {
          const errorMessages: string[] = [];
          for (const key in errorJson) {
            if (Object.prototype.hasOwnProperty.call(errorJson, key)) {
              const val = errorJson[key];
              if (Array.isArray(val)) {
                errorMessages.push(`${key}: ${val.join(", ")}`);
              } else if (typeof val === "string") {
                errorMessages.push(`${key}: ${val}`);
              } else if (typeof val === "object" && val !== null) {
                errorMessages.push(`${key}: ${JSON.stringify(val)}`);
              }
            }
          }
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(" | ");
          } else {
            errorMessage = errorJson.detail || errorJson.message || errorMessage;
          }
        }
      } catch {
        console.error(`[Notices] Non-JSON Error: ${errorText.slice(0, 200)}`);
      }
      return { success: false, message: errorMessage };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("[Notices] Error creating notice:", error);
    return { success: false, message: "An error occurred while creating notice" };
  }
};

export const getNoticeDetails = async (id: number | string) => {
  try {
    const NOTICES_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/notices/${id}/`;
    const token = await getValidToken();

    if (!token) {
      return { success: false, message: "No access token found. Please log in." };
    }

    const res = await fetch(NOTICES_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `Failed to get notice details (${res.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.non_field_errors?.[0] || errorJson.message || errorMessage;
      } catch {}
      return { success: false, message: errorMessage };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("[Notices] Error fetching notice details:", error);
    return { success: false, message: "An error occurred while fetching notice details" };
  }
};

export const updateNotice = async (id: number | string, payload: CreateNoticePayload) => {
  try {
    const NOTICES_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/notices/${id}/`;
    const token = await getValidToken();

    if (!token) {
      return { success: false, message: "No access token found. Please log in." };
    }

    const res = await fetch(NOTICES_URL, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `Failed to update notice (${res.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (typeof errorJson === "object" && errorJson !== null) {
          const errorMessages: string[] = [];
          for (const key in errorJson) {
            if (Object.prototype.hasOwnProperty.call(errorJson, key)) {
              const val = errorJson[key];
              if (Array.isArray(val)) {
                errorMessages.push(`${key}: ${val.join(", ")}`);
              } else if (typeof val === "string") {
                errorMessages.push(`${key}: ${val}`);
              }
            }
          }
          if (errorMessages.length > 0) {
            errorMessage = errorMessages.join(" | ");
          } else {
            errorMessage = errorJson.detail || errorJson.message || errorMessage;
          }
        }
      } catch {}
      return { success: false, message: errorMessage };
    }

    const data = await res.json();
    return { success: true, data };
  } catch (error) {
    console.error("[Notices] Error updating notice:", error);
    return { success: false, message: "An error occurred while updating notice" };
  }
};

export const deleteNotice = async (id: number | string) => {
  try {
    const NOTICES_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/notices/${id}/`;
    const token = await getValidToken();

    if (!token) {
      return { success: false, message: "No access token found. Please log in." };
    }

    const res = await fetch(NOTICES_URL, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      let errorMessage = `Failed to delete notice (${res.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.message || errorMessage;
      } catch {}
      return { success: false, message: errorMessage };
    }

    return { success: true };
  } catch (error) {
    console.error("[Notices] Error deleting notice:", error);
    return { success: false, message: "An error occurred while deleting notice" };
  }
};
