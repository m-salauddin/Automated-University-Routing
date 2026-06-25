import AdminRoutinePage from "@/components/modules/dashboard/routine-entries";
import { getRoutine } from "@/services/routine";
import { getAllTimeSlots } from "@/services/time-slots";
import { getAllDepartments } from "@/services/departments";
import { getAllSemesters } from "@/services/semesters";
import { getAllCourses } from "@/services/courses";
import { getAllUsers } from "@/services/users";

const page = async () => {
  const [
    routineResponse,
    timeSlotsResponse,
    departmentsResponse,
    semestersResponse,
    coursesResponse,
    usersResponse,
  ] = await Promise.all([
    getRoutine(),
    getAllTimeSlots(),
    getAllDepartments(),
    getAllSemesters(),
    getAllCourses(),
    getAllUsers(),
  ]);

  const routineList =
    routineResponse.success && Array.isArray(routineResponse.data)
      ? routineResponse.data
      : [];

  const timeSlots =
    timeSlotsResponse.success && Array.isArray(timeSlotsResponse.data)
      ? timeSlotsResponse.data
      : [];

  const departments =
    departmentsResponse.success && Array.isArray(departmentsResponse.data)
      ? departmentsResponse.data
      : [];

  const dbSemesters =
    semestersResponse.success && Array.isArray(semestersResponse.data)
      ? semestersResponse.data
      : [];

  const courses =
    coursesResponse.success && Array.isArray(coursesResponse.data)
      ? coursesResponse.data
      : [];

  const users =
    usersResponse.success && Array.isArray(usersResponse.data)
      ? usersResponse.data
      : [];

  // Filter departments to only show those that have at least one course or student user
  const dbDepartments = departments.filter((dept) => {
    const hasCourses = courses.some(
      (c: any) =>
        String(c.department) === String(dept.id) ||
        (c.department_name &&
          c.department_name.toLowerCase().trim() === dept.name.toLowerCase().trim())
    );
    const hasStudents = users.some(
      (u: any) =>
        u.role?.toUpperCase() === "STUDENT" &&
        ((u.department !== undefined && u.department !== null && String(u.department) === String(dept.id)) ||
          (u.department_name &&
            u.department_name.toLowerCase().trim() === dept.name.toLowerCase().trim()))
    );
    return hasCourses || hasStudents;
  });

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
