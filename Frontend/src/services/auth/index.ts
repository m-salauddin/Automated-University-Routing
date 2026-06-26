/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";
import { jwtDecode } from "jwt-decode";

export const loginUser = async (userData: FieldValues) => {
    try {
        const LOGIN_URL = `${process.env.NEXT_PUBLIC_BASE_API}/login/`;

        const res = await fetch(LOGIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(userData),
            cache: "no-store",
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Login failed (${res.status})`;
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

        const rawResult = await res.json();

        let standardizedResult;

        if (rawResult.success && rawResult.data) {
            standardizedResult = rawResult;
        } else if (
            rawResult.access ||
            rawResult.accessToken ||
            rawResult.token
        ) {
            const {
                access,
                refresh,
                accessToken,
                refreshToken,
                token,
                ...restOfUser
            } = rawResult;

            standardizedResult = {
                success: true,
                data: {
                    accessToken: access || accessToken || token,
                    refreshToken: refresh || refreshToken || "",
                    user: restOfUser,
                },
                message: "Login successful",
            };
        } else {
            console.warn("[Auth] Unrecognized response format");
            return {
                success: false,
                message: "Server response format not recognized.",
            };
        }

        if (standardizedResult.success) {
            const cookieStore = await cookies();
            cookieStore.set(
                "accessToken",
                standardizedResult.data.accessToken,
                { httpOnly: false, secure: process.env.NODE_ENV === "production", path: "/" }
            );
            if (standardizedResult.data.refreshToken) {
                cookieStore.set(
                    "refreshToken",
                    standardizedResult.data.refreshToken,
                    { httpOnly: false, secure: process.env.NODE_ENV === "production", path: "/" }
                );
            }
        }

        return standardizedResult;
    } catch (error) {
        console.error("Login Action Critical Error:", error);
        return { success: false, message: "Network error. Please try again." };
    }
};

export const logout = async () => {
    const cookieStore = await cookies();
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
};

export const getValidToken = async (): Promise<string | null> => {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return null;

    try {
        const decoded = jwtDecode<{ exp?: number; token_type?: string }>(token);
        const isExpired = decoded.exp ? decoded.exp * 1000 < Date.now() : false;
        if (!isExpired) return token; // Token is valid — use it directly
    } catch {
        console.warn("[Auth] Could not decode token — will try refresh");
    }

    const refreshToken = cookieStore.get("refreshToken")?.value;
    if (refreshToken) {
        try {
            const refreshRes = await fetch(
                `${process.env.NEXT_PUBLIC_BASE_API}/token/refresh/`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ refresh: refreshToken }),
                    cache: "no-store",
                }
            );
            if (refreshRes.ok) {
                const data = await refreshRes.json();
                const newToken = data.access;
                if (newToken) {
                    cookieStore.set("accessToken", newToken, { httpOnly: false, secure: process.env.NODE_ENV === "production", path: "/" });
                    return newToken;
                }
            } else {
                console.warn("[Auth] Token refresh failed:", refreshRes.status);
            }
        } catch (e) {
            console.warn("[Auth] Token refresh error:", e);
        }
    }

    console.warn("[Auth] Falling back to original token");
    return token;
};

export const getCurrentUser = async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (accessToken) {
        try {
            const decoded = jwtDecode(accessToken);

            
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                
                await logout();
                return null;
            }

            return decoded;
        } catch (e) {
            
            await logout();
            return null;
        }
    }
    return null;
};