import DepartmentRoutinePage from "@/components/modules/dashboard/department-routine";
export const dynamic = "force-dynamic";
import { getRoutine } from "@/services/routine";
import { getUserProfile } from "@/services/users";
import { getAllTimeSlots } from "@/services/time-slots";

const DepartmentRoutine = async () => {
  const [profileResponse, timeSlotsResponse] = await Promise.all([
    getUserProfile(),
    getAllTimeSlots(),
  ]);

  let routineList = [];
  if (profileResponse.success && profileResponse.data) {
    const { department } = profileResponse.data;
    const routineResponse = await getRoutine({
      department_id: department,
    });
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
    if (!uniqueSlotsMap.has(lunchBreakStart)) {
      uniqueSlotsMap.set(lunchBreakStart, {
        id: 999,
        start_time: lunchBreakStart,
        end_time: "14:00:00",
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
