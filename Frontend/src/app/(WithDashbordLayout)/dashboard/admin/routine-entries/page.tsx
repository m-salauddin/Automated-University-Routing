import AdminRoutinePage from "@/components/modules/dashboard/routine-entries";
import { getRoutine } from "@/services/routine";
import { getAllTimeSlots } from "@/services/time-slots";
import { getAllDepartments } from "@/services/departments";
import { getAllSemesters } from "@/services/semesters";

const page = async () => {
  const [
    routineResponse,
    timeSlotsResponse,
    departmentsResponse,
    semestersResponse,
  ] = await Promise.all([
    getRoutine(),
    getAllTimeSlots(),
    getAllDepartments(),
    getAllSemesters(),
  ]);

  const routineList =
    routineResponse.success && Array.isArray(routineResponse.data)
      ? routineResponse.data
      : [];

  const timeSlots =
    timeSlotsResponse.success && Array.isArray(timeSlotsResponse.data)
      ? timeSlotsResponse.data
      : [];

  const dbDepartments =
    departmentsResponse.success && Array.isArray(departmentsResponse.data)
      ? departmentsResponse.data
      : [];

  const dbSemesters =
    semestersResponse.success && Array.isArray(semestersResponse.data)
      ? semestersResponse.data
      : [];

  return (
    <div>
      <AdminRoutinePage
        routineList={routineList}
        timeSlots={timeSlots}
        dbDepartments={dbDepartments}
        dbSemesters={dbSemesters}
      />
    </div>
  );
};

export default page;
