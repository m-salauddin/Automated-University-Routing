import AdminRoutinePage from "@/components/modules/dashboard/routine-entries";
import { getRoutine } from "@/services/routine";
import { getAllTimeSlots } from "@/services/time-slots";

const page = async () => {
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
    <div>
      <AdminRoutinePage routineList={routineList} timeSlots={timeSlots} />
    </div>
  );
};

export default page;
