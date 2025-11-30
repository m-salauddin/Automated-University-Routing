import Logo from "./logo";

export default function DataLoader() {
  return (
    <div className="flex items-center justify-center w-full h-[50vh]">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <Logo />
      </div>
    </div>
  );
}
