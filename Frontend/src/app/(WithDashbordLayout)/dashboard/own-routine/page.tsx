import OwnRoutinePage from "@/components/modules/dashboard/own-routine";
export const dynamic = "force-dynamic";
import { getRoutine } from "@/services/routine";
import { getAllTimeSlots } from "@/services/time-slots";

const StudentRoutine = async () => {
  const [routineResponse, timeSlotsResponse] = await Promise.all([
    getRoutine(),
    getAllTimeSlots(),
  ]);

  const routineList =
    routineResponse.success && Array.isArray(routineResponse.data)
      ? routineResponse.data
      : [];

  let timeSlots = [];
  if (timeSlotsResponse.success && Array.isArray(timeSlotsResponse.data) && timeSlotsResponse.data.length > 0) {
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
      <OwnRoutinePage routineList={routineList} timeSlots={timeSlots} />
    </>
  );
};

export default StudentRoutine;

