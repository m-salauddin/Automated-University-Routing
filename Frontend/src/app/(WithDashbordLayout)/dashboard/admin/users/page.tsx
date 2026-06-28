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

  const getSemIdByName = (name: string) => {
    const sem = semData.find((s: any) => s.name === name);
    return sem ? sem.id : null;
  };

  // Build the map of batches. The key is a composite of `department_id` and `batch_id`
  // so that different departments can have their own independent batches.
  const batchesMap = new Map<string, { id: number; name: string; department_id: number; semester_id: number | null }>();
  
  // Seed default batches (IDs 1 to 7) for all departments that support batches (3: CSE, 4: Applied Physics, 5: Applied Math, 6: EEE)
  const defaultBatches: any[] = [];
  const deptIdsWithBatches = [3, 4, 5, 6];
  const batchDefinitions = [
    { id: 10, name: "35th Batch", semName: "8th" },
    { id: 9, name: "36th Batch", semName: "7th" },
    { id: 8, name: "37th Batch", semName: "6th" },
    { id: 7, name: "38th Batch", semName: "5th" },
    { id: 6, name: "39th Batch", semName: "4th" },
    { id: 5, name: "40th Batch", semName: "3rd" },
    { id: 4, name: "41th Batch", semName: "2nd" },
    { id: 3, name: "42th Batch", semName: "1st" },
  ];

  deptIdsWithBatches.forEach(deptId => {
    batchDefinitions.forEach(b => {
      defaultBatches.push({
        id: b.id,
        name: b.name,
        department_id: deptId,
        semester_id: getSemIdByName(b.semName),
      });
    });
  });
  
  defaultBatches.forEach(b => {
    batchesMap.set(`${b.department_id}-${b.id}`, b);
  });

  // Dynamically add any other batch details retrieved from existing users in the database
  userData.forEach((u: any) => {
    if (u.batch && u.batch_name) {
      const deptId = Number(u.department_id || u.department);
      const semId = Number(u.semester_id || u.semester);
      if (deptId) {
        batchesMap.set(`${deptId}-${u.batch}`, {
          id: Number(u.batch),
          name: u.batch_name,
          department_id: deptId,
          semester_id: semId || null,
        });
      }
    }
  });

  const batches = Array.from(batchesMap.values())
    .sort((a, b) => b.id - a.id);

  return (
    <UsersPageClient 
      initialUsers={userData} 
      departments={deptData} 
      semesters={semData} 
      batches={batches}
    />
  );
};

export default UsersPage;