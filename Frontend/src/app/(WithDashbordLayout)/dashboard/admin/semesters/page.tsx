import getAllSemesters from "@/services/semesters";

const page = async () => {
  const semesters = await getAllSemesters();
  console.log(semesters);
  return (
    <div>
      This is page component
    </div>
  )
};

export default page;