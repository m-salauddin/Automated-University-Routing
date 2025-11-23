import getAllTimeSlots from "@/services/time-slots";

const page = async() => {
  const timeSlots = await getAllTimeSlots();
  console.log(timeSlots);
  return (
    <div>
      This is page component
    </div>
  )
};

export default page;