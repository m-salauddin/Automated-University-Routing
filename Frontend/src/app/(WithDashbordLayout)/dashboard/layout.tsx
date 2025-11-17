import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/modules/dashboard/app-sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="pt-5 pl-5">
        <SidebarTrigger className="cursor-pointer" />
        {children}
      </main>
    </SidebarProvider>
  );
}
