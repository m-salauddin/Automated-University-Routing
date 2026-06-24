import AcademicSettingsPage from "@/components/modules/dashboard/academic-config";
import { getAllDepartments } from "@/services/departments";
import { getAllSemesters } from "@/services/semesters";
import { getAllTimeSlots } from "@/services/time-slots";
import { getAllRooms } from "@/services/rooms";
import { getAllCourses } from "@/services/courses";
import { getAllUsers } from "@/services/users";

const page = async () => {
  const [departmentsData, semestersData, timeSlotsData, roomsData, coursesData, usersData] = await Promise.all([
    getAllDepartments(),
    getAllSemesters(),
    getAllTimeSlots(),
    getAllRooms(),
    getAllCourses(),
    getAllUsers(),
  ]);

  const departments = departmentsData?.success ? departmentsData.data : [];
  const semesters = semestersData?.success ? semestersData.data : [];
  const timeSlots = timeSlotsData?.success ? timeSlotsData.data : [];
  const rooms = roomsData?.success ? roomsData.data : [];
  const courses = coursesData?.success ? coursesData.data : [];
  const users = usersData?.success ? usersData.data : [];

  return (
    <AcademicSettingsPage
      departments={departments}
      semesters={semesters}
      timeSlots={timeSlots}
      rooms={rooms}
      courses={courses}
      users={users}
    />
  );
};

export default page;
