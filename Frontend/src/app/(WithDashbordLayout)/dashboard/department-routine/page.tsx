import DepartmentRoutinePage from "@/components/modules/dashboard/department-routine";
export const dynamic = "force-dynamic";
import { getRoutine, getDepartmentRoutine } from "@/services/routine";
import { getUserProfile } from "@/services/users";
import { getAllTimeSlots } from "@/services/time-slots";
import { getCurrentUser } from "@/services/auth";

const DepartmentRoutine = async () => {
  const [profileResponse, timeSlotsResponse, user] = await Promise.all([
    getUserProfile(),
    getAllTimeSlots(),
    getCurrentUser(),
  ]);

  const rawRole = user ? (user as any).role : null;
  const role = rawRole ? rawRole.toLowerCase() : null;

  let routineList = [];
  if (role === "teacher") {
    const routineResponse = await getDepartmentRoutine();
    console.log("department-routine debug [TEACHER]:", { role, routineResponse });
    if (routineResponse.success && Array.isArray(routineResponse.data)) {
      routineList = routineResponse.data;
    }
  } else if (profileResponse.success && profileResponse.data) {
    const { department } = profileResponse.data;
    const routineResponse = await getRoutine({
      department_id: department,
    });
    console.log("department-routine debug [OTHER]:", { role, routineResponse });
    if (routineResponse.success && Array.isArray(routineResponse.data)) {
      routineList = routineResponse.data;
    }
  }

  let timeSlots = [];
  if (timeSlotsResponse.success && Array.isArray(timeSlotsResponse.data)) {
    timeSlots = timeSlotsResponse.data;
  } else {
    // Fallback: extract unique slots from routineList
    const uniqueSlotsMap = new Map();
    routineList.forEach((item: any) => {
      if (item.start_time && item.end_time) {
        const key = `${item.start_time}-${item.end_time}`;
        if (!uniqueSlotsMap.has(key)) {
          uniqueSlotsMap.set(key, {
            id: uniqueSlotsMap.size + 1,
            start_time: item.start_time,
            end_time: item.end_time,
          });
        }
      }
    });

    // Ensure lunch break slot is present in the grid
    const lunchBreakStart = "13:15:00";
    const lunchBreakEnd = "14:00:00";
    const lunchBreakKey = `${lunchBreakStart}-${lunchBreakEnd}`;
    if (!uniqueSlotsMap.has(lunchBreakKey)) {
      uniqueSlotsMap.set(lunchBreakKey, {
        id: 999,
        start_time: lunchBreakStart,
        end_time: lunchBreakEnd,
        is_lunch_break: true,
      });
    }

    timeSlots = Array.from(uniqueSlotsMap.values());
  }

  return (
    <>
      <DepartmentRoutinePage routineList={routineList} timeSlots={timeSlots} />
    </>
  );
};

export default DepartmentRoutine;
