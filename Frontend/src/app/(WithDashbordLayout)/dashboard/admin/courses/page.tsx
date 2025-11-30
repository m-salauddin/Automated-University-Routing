/* eslint-disable @typescript-eslint/no-explicit-any */
import AutomatedRoutineCourses from "@/components/modules/dashboard/courses";
import { getAllCourses } from "@/services/courses";
import { getAllDepartments } from "@/services/departments";
import { getAllSemesters } from "@/services/semesters";
import { getAllUsers } from "@/services/users";

const CoursesPage = async () => {
  const [coursesRes, departmentsRes, semestersRes, usersRes] = await Promise.all([
    getAllCourses(),
    getAllDepartments(),
    getAllSemesters(),
    getAllUsers(),
  ]);

  const courses = 
    coursesRes?.success && Array.isArray(coursesRes.data) ? coursesRes.data : [];
  
  const departments = 
    departmentsRes?.success && Array.isArray(departmentsRes.data) ? departmentsRes.data : [];
  
  const semesters = 
    semestersRes?.success && Array.isArray(semestersRes.data) ? semestersRes.data : [];
  
  const allUsers = 
    usersRes?.success && Array.isArray(usersRes.data) ? usersRes.data : [];

  const teachers = allUsers.filter((user: any) => user.role === "TEACHER");

  return (
    <div>
      <AutomatedRoutineCourses 
        courses={courses} 
        departments={departments} 
        semesters={semesters} 
        teachers={teachers} 
      />
    </div>
  );
};

export default CoursesPage;