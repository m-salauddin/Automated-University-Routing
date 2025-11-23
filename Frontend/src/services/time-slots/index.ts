import { cookies } from "next/headers";

const getAllTimeSlots = async () => {
    try {
        const TIME_SLOTS_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/timeslots/`;
        const cookiesStore = await cookies();
        const token = cookiesStore.get('accessToken')?.value;
        if (!token) {
            return { success: false, message: 'No access token found' };
        }
        const res = await fetch(TIME_SLOTS_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });
        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Time slots failed (${res.status})`;
            try {
                const errorJson = JSON.parse(errorText);
                errorMessage = errorJson.detail || errorJson.non_field_errors?.[0] || errorJson.message || errorMessage;
            } catch {
                console.error(`[Auth] Non-JSON Error Body: ${errorText.slice(0, 200)}`);
            }
            return { success: false, message: errorMessage };
        }
        const rawResult = await res.json();
        return { success: true, data: rawResult };
    } catch (error) {
        console.error(`[Auth] Error fetching time slots: ${error}`);
        return { success: false, message: 'Error fetching time slots' };
    }
};
export default getAllTimeSlots;