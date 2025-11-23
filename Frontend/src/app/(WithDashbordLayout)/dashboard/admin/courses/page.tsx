import AutomatedRoutineCourses from "@/components/modules/dashboard/courses";
import getAllCourses from "@/services/courses";

const page = async () => {
  const response = await getAllCourses();

  const courses =
    response?.success && Array.isArray(response.data) ? response.data : [];

  return (
    <div>
      <AutomatedRoutineCourses courses={courses} />
    </div>
  );
};

export default page;
