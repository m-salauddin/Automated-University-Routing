import getAllDepartments from "@/services/departments";

const page = async () => {
  const departments = await getAllDepartments();
  console.log(departments);
  return <div>This is page component</div>;
};

export default page;
