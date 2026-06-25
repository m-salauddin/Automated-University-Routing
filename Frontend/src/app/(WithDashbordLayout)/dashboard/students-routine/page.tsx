import DepartmentRoutinePage from "@/components/modules/dashboard/student-routine";
export const dynamic = "force-dynamic";
import { getRoutine } from "@/services/routine";
import { getUserProfile } from "@/services/users";
import { getAllTimeSlots } from "@/services/time-slots";

const StudentRoutine = async () => {
  const [profileResponse, timeSlotsResponse] = await Promise.all([
    getUserProfile(),
    getAllTimeSlots(),
  ]);

  let routineList = [];
  if (profileResponse.success && profileResponse.data) {
    const { department, semester } = profileResponse.data;
    const routineResponse = await getRoutine({
      department_id: department,
      semester_id: semester,
    });
    if (routineResponse.success && Array.isArray(routineResponse.data)) {
      routineList = routineResponse.data;
    }
  }

  const timeSlots =
    timeSlotsResponse.success && Array.isArray(timeSlotsResponse.data)
      ? timeSlotsResponse.data
      : [];

  return (
    <>
      <DepartmentRoutinePage routineList={routineList} timeSlots={timeSlots} />
    </>
  );
};

export default StudentRoutine;
