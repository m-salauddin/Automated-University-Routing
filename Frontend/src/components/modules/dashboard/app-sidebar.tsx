"use client";

import {
  CalendarCheck, ChartColumnBig,
  CalendarX,
  FolderDown,
  Home,
  User,
  View,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { TeamSwitcher } from "./team-switcher";
import { NavUser } from "./nav-user";
import { useAuth } from "@/context/auth-context";

const items = [
  {
    title: "Home",
    url: "/login",
    icon: Home,
  },
  {
    title: "Analytics",
    url: "/dashboard/analytics",
    icon: ChartColumnBig,
  }
];


export function AppSidebar() {
  const { role } = { role: "teacher" };

  const studentPanel = [
    { title: "Students routine table", url: "/dashboard/students-routine", icon: View },
    { title: "Profile", url: "/dashboard/profile", icon: User },
    { title: "Routine Export in pdf", url: "/dashboard/export-pdf", icon: FolderDown },
  ];

  const teacherPanel = [
    { title: "Students routine table", url: "/dashboard/students-routine", icon: View },
    { title: "Own routine table", url: "/dashboard/own-routine", icon: CalendarCheck },
    { title: "Profile", url: "/dashboard/profile", icon: User },
    { title: "Routine Export in pdf", url: "/dashboard/export-pdf", icon: FolderDown },
    { title: "Class off", url: "/dashboard/class-off", icon: CalendarX },
  ];

  const panelItems = role === "teacher" ? teacherPanel : studentPanel;
  const panelTitle = role === "teacher" ? "Teacher Panel" : "Student Panel";

  return (
    <Sidebar
      collapsible="icon"
      className="transition-all duration-300 ease-in-out font-lexend"
    >
      <SidebarHeader className="py-4">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="transition-opacity duration-200">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>

            {/* Role-based panel */}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="cursor-default">
                  <span className="text-nowrap font-semibold">{panelTitle}</span>
                </SidebarMenuButton>
                <SidebarMenuSub>
                  {panelItems.map((it) => (
                    <SidebarMenuSubItem className="border-b" key={it.title}>
                      <SidebarMenuSubButton asChild className="transition-all mb-1 duration-200 hover:translate-x-1">
                        <Link className="pb-1" href={it.url}>
                          <it.icon className="transition-transform duration-300 group-data-[state=collapsed]:-translate-x-6 group-data-[state=collapsed]:opacity-0 group-data-[state=expanded]:translate-x-0 group-data-[state=expanded]:opacity-100" />
                          <span className="transition-opacity duration-200">{it.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </SidebarMenuItem>
            </SidebarMenu>

          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
