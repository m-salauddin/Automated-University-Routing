import AcademicSettingsPage from "@/components/modules/dashboard/academic-config";
import { getAllDepartments } from "@/services/departments";
import { getAllSemesters } from "@/services/semesters";
import { getAllTimeSlots } from "@/services/time-slots";
import { getAllRooms } from "@/services/rooms";

const page = async () => {
  const [departmentsData, semestersData, timeSlotsData, roomsData] = await Promise.all([
    getAllDepartments(),
    getAllSemesters(),
    getAllTimeSlots(),
    getAllRooms(),
  ]);

  const departments = departmentsData?.success ? departmentsData.data : [];
  const semesters = semestersData?.success ? semestersData.data : [];
  const timeSlots = timeSlotsData?.success ? timeSlotsData.data : [];
  const rooms = roomsData?.success ? roomsData.data : [];

  return (
    <AcademicSettingsPage
      departments={departments}
      semesters={semesters}
      timeSlots={timeSlots}
      rooms={rooms}
    />
  );
};

export default page;
