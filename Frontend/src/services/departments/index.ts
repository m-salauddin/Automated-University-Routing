import { cookies } from 'next/headers';
const getAllDepartments = async () => {
    try {
        const DEPARTMENTS_URL = `${process.env.NEXT_PUBLIC_BASE_API}/academic/departments/`;
        const cookiesStore = await cookies();
        const token = cookiesStore.get('accessToken')?.value;

        if (!token) {
            return { success: false, message: 'No access token found' };
        }
        const res = await fetch(DEPARTMENTS_URL, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
        });

        if (!res.ok) {
            const errorText = await res.text();
            let errorMessage = `Departments failed (${res.status})`;
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
        console.error('[Auth] Error:', error);
        return { success: false, message: 'An error occurred' };
    }
};
export default getAllDepartments;