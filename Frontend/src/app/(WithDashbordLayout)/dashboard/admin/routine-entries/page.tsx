import AdminRoutinePage from "@/components/modules/dashboard/routine-entries";
import { getRoutine } from "@/services/routine";

const page = async () => {
  const routineResponse = await getRoutine();
  const routineList =
    routineResponse.success && Array.isArray(routineResponse.data)
      ? routineResponse.data
      : [];
  console.log(routineList);
  return (
    <div>
      <AdminRoutinePage routineList={routineList} />
    </div>
  );
};

export default page;