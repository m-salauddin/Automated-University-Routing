import UsersPageClient from "@/components/modules/dashboard/users";
import { getAllDepartments } from "@/services/departments";
import { getAllSemesters } from "@/services/semesters";
import { getAllUsers } from "@/services/users";


export const dynamic = "force-dynamic";

const UsersPage = async () => {
  const [usersRes, deptsRes, semsRes] = await Promise.all([
    getAllUsers(),
    getAllDepartments(), 
    getAllSemesters(),  
  ]);

  const userData = usersRes.success && usersRes.data ? usersRes.data : [];
  const deptData = deptsRes.success && deptsRes.data ? deptsRes.data : [];
  const semData = semsRes.success && semsRes.data ? semsRes.data : [];

  return (
    <UsersPageClient 
      initialUsers={userData} 
      departments={deptData} 
      semesters={semData} 
    />
  );
};

export default UsersPage;