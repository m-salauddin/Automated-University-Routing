import AutomatedRoutineDashboard from "@/components/modules/dashboard/analytics";
export const dynamic = "force-dynamic";
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
