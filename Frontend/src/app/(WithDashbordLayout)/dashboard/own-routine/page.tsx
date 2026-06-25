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

  const timeSlots =
    timeSlotsResponse.success && Array.isArray(timeSlotsResponse.data)
      ? timeSlotsResponse.data
      : [];

  return (
    <>
      <OwnRoutinePage routineList={routineList} timeSlots={timeSlots} />
    </>
  );
};

export default StudentRoutine;

