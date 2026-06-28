import DepartmentDetailPage from "@/components/modules/dashboard/academic-config/detail";
export const dynamic = "force-dynamic";
import { getDepartment } from "@/services/departments";
import { getAllSemesters } from "@/services/semesters";
import { getAllCourses } from "@/services/courses";
import { getAllUsers } from "@/services/users";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

const DepartmentPage = async ({ params }: PageProps) => {
  const { id } = await params;

  const [deptRes, semestersRes, coursesRes, usersRes] = await Promise.all([
    getDepartment(id),
    getAllSemesters(),
    getAllCourses(),
    getAllUsers(),
  ]);

  if (!deptRes?.success || !deptRes.data) {
    notFound();
  }

  const department = deptRes.data;
  const semesters = semestersRes?.success ? semestersRes.data : [];
  const courses = coursesRes?.success ? coursesRes.data : [];
  const users = usersRes?.success ? usersRes.data : [];

  return (
    <DepartmentDetailPage
      department={department}
      semesters={semesters}
      courses={courses}
      users={users}
    />
  );
};

export default DepartmentPage;
