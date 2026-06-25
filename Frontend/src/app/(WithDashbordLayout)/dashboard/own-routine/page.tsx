import OwnRoutinePage from "@/components/modules/dashboard/own-routine";
export const dynamic = "force-dynamic";
import { getRoutine } from "@/services/routine";

const StudentRoutine = async () => {
  const routineResponse = await getRoutine();

  const routineList =
    routineResponse.success && Array.isArray(routineResponse.data)
      ? routineResponse.data
      : [];

  return (
    <>
      <OwnRoutinePage routineList={routineList} />
    </>
  );
};

export default StudentRoutine;
