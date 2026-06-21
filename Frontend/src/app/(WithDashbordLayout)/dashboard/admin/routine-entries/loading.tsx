import DataLoader from "@/components/ui/data-loader";

export default function Loading() {
  return (
    <div className="w-full h-[70vh] flex items-center justify-center bg-background">
      <DataLoader />
    </div>
  );
}
