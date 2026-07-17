import NoticesPageClient from "@/components/modules/dashboard/notices";
import { getAllDepartments } from "@/services/departments";
import { getAllSemesters } from "@/services/semesters";
import { getAllNotices } from "@/services/notices";

export const dynamic = "force-dynamic";

const NoticesPage = async () => {
  const [noticesRes, deptsRes, semsRes] = await Promise.all([
    getAllNotices(),
    getAllDepartments(), 
    getAllSemesters(),  
  ]);

  const noticesData = noticesRes.success && noticesRes.data ? noticesRes.data : [];
  const deptData = deptsRes.success && deptsRes.data ? deptsRes.data : [];
  const semData = semsRes.success && semsRes.data ? semsRes.data : [];

  const getSemIdByName = (name: string) => {
    const sem = semData.find((s: any) => s.name === name);
    return sem ? sem.id : null;
  };

  const batchesMap = new Map<string, { id: number; name: string; department_id: number; semester_id: number | null }>();
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

  const batches = Array.from(batchesMap.values()).sort((a, b) => b.id - a.id);

  return (
    <NoticesPageClient 
      initialNotices={noticesData} 
      departments={deptData} 
      batches={batches}
      deptsRes={deptsRes}
    />
  );
};

export default NoticesPage;
