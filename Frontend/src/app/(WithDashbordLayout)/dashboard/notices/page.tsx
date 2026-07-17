import NoticesPageClient from "@/components/modules/dashboard/notices";
import { getAllDepartments, getAllDepartmentsView } from "@/services/departments";
import { getAllSemesters } from "@/services/semesters";
import { getAllNotices } from "@/services/notices";
import { getRoutine } from "@/services/routine";
import { getValidToken } from "@/services/auth";
import { jwtDecode } from "jwt-decode";

export const dynamic = "force-dynamic";

const NoticesPage = async () => {
  let deptsRes = await getAllDepartmentsView();
  if (!deptsRes.success) {
    deptsRes = await getAllDepartments();
  }

  const [noticesRes, semsRes] = await Promise.all([
    getAllNotices(),
    getAllSemesters(),  
  ]);

  const noticesData = noticesRes.success && noticesRes.data ? noticesRes.data : [];
  let deptData = deptsRes.success && deptsRes.data ? deptsRes.data : [];
  const semData = semsRes.success && semsRes.data ? semsRes.data : [];

  const token = await getValidToken();
  let isTeacher = false;
  if (token) {
    try {
      const decoded = jwtDecode<{ role?: string }>(token);
      isTeacher = decoded.role?.toUpperCase() === "TEACHER";
    } catch (e) {
      console.error(e);
    }
  }

  if (isTeacher) {
    const routineRes = await getRoutine();
    if (routineRes.success && Array.isArray(routineRes.data)) {
      const teacherDepts = new Set<string>();
      const teacherDeptIds = new Set<number>();
      routineRes.data.forEach((item: any) => {
        if (item.department_name) {
          teacherDepts.add(item.department_name.toLowerCase().trim());
        }
        if (item.department) {
          teacherDeptIds.add(Number(item.department));
        }
      });

      const filteredDepts = deptData.filter((dept: any) => {
        const matchesId = teacherDeptIds.has(dept.id);
        const matchesName = dept.name && teacherDepts.has(dept.name.toLowerCase().trim());
        const matchesCode = dept.code && teacherDepts.has(dept.code.toLowerCase().trim());
        return matchesId || matchesName || matchesCode;
      });

      if (filteredDepts.length > 0) {
        deptData = filteredDepts;
      }
    }
  }

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
