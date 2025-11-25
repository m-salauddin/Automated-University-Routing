import AcademicSettingsPage from "@/components/modules/dashboard/academic-config";
import { getAllDepartments } from "@/services/departments";
import getAllSemesters from "@/services/semesters";
import getAllTimeSlots from "@/services/time-slots";

const page = async () => {
  const [departmentsData, semestersData, timeSlotsData] = await Promise.all([
    getAllDepartments(),
    getAllSemesters(),
    getAllTimeSlots(),
  ]);

  const departments = departmentsData?.success ? departmentsData.data : [];
  const semesters = semestersData?.success ? semestersData.data : [];
  const timeSlots = timeSlotsData?.success ? timeSlotsData.data : [];

  return (
    <AcademicSettingsPage
      departments={departments}
      semesters={semesters}
      timeSlots={timeSlots}
    />
  );
};

export default page;
