import AutomatedRoutineDashboard from "@/components/modules/dashboard/analytics";
import { getRoutine } from "@/services/routine";

const page = async () => {
  const routineData = await getRoutine();

  return (
    <div>
      <AutomatedRoutineDashboard routineList={routineData} />
    </div>
  );
};

export default page;
