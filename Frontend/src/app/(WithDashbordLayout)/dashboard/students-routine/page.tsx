import DepartmentRoutinePage from "@/components/modules/dashboard/student-routine";
import { getRoutine } from "@/services/routine";

const StudentRoutine = async () => {
  const routineResponse = await getRoutine();
  console.log("Routine Response", routineResponse);

  const routineList =
    routineResponse.success && Array.isArray(routineResponse.data)
      ? routineResponse.data
      : [];

  return (
    <>
      <DepartmentRoutinePage routineList={routineList} />
    </>
  );
};

export default StudentRoutine;
