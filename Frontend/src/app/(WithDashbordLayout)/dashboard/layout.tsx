import type { ReactNode, CSSProperties } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/modules/dashboard/app-sidebar";
import {SiteHeader} from "@/components/modules/dashboard/site-header";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={{
        "--sidebar-width": "calc(var(--spacing) * 72)",
        "--header-height": "calc(var(--spacing) * 12)",
      } as CSSProperties}
    >
      <AppSidebar />
          <SidebarInset>
              <SiteHeader />
              {children}
          </SidebarInset>
    </SidebarProvider>
  );
}
