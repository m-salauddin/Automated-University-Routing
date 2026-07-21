import AdminRoutinePage from "@/components/modules/dashboard/routine-entries";
export const dynamic = "force-dynamic";
import { getRoutine } from "@/services/routine";
import { getAllTimeSlots } from "@/services/time-slots";
import { getAllDepartments } from "@/services/departments";
import { getAllSemesters } from "@/services/semesters";
import { getAllCourses } from "@/services/courses";
import { getAllUsers } from "@/services/users";

const page = async () => {
  const [
    departmentsResponse,
    coursesResponse,
    usersResponse,
  ] = await Promise.all([
    getAllDepartments(),
    getAllCourses(),
    getAllUsers(),
  ]);

  const departments =
    departmentsResponse.success && Array.isArray(departmentsResponse.data)
      ? departmentsResponse.data
      : [];

  const courses =
    coursesResponse.success && Array.isArray(coursesResponse.data)
      ? coursesResponse.data
      : [];

  const users =
    usersResponse.success && Array.isArray(usersResponse.data)
      ? usersResponse.data
      : [];

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

  const defaultDeptId = dbDepartments.length > 0 ? dbDepartments[0].id : undefined;

  const safeGetRoutine = async () => {
    try {
      if (defaultDeptId === undefined) return { success: true as const, data: [] };
      return await getRoutine({ department_id: defaultDeptId });
    } catch {
      return { success: true as const, data: [] };
    }
  };

  const [
    routineResponse,
    timeSlotsResponse,
    semestersResponse,
  ] = await Promise.all([
    safeGetRoutine(),
    getAllTimeSlots(),
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
