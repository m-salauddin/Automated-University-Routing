import {
  BadgePlus,
  BookText,
  CalendarCheck,
  ChevronDown,
  Database,
  FolderDown,
  Home,
  SquarePen,
  SwatchBook,
  Users,
  View,
  Warehouse,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TeamSwitcher } from "./team-switcher";
import { NavUser } from "./nav-user";

const items = [
  {
    title: "Home",
    url: "",
    icon: Home,
  },
];

const dataManagement = [
  {
    title: "Teachers",
    url: "/teachers",
    icon: Users,
  },
  {
    title: "Courses",
    url: "/courses",
    icon: BookText,
  },
  {
    title: "Batches",
    url: "/batches",
    icon: SwatchBook,
  },
  {
    title: "Rooms",
    url: "/rooms",
    icon: Warehouse,
  },
];

const routineMangement = [
  {
    title: "Generate",
    url: "/generate",
    icon: BadgePlus,
  },
  {
    title: "Update",
    url: "/update",
    icon: SquarePen,
  },
  {
    title: "View",
    url: "/view",
    icon: View,
  },
  {
    title: "Export",
    url: "/export",
    icon: FolderDown,
  },
];


export function AppSidebar() {
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

            <SidebarMenu>
              <Collapsible className="group/collapsible" defaultOpen>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Database />
                      <span className="text-nowrap">Data Management</span>
                      <ChevronDown className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="transition-all duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                    <SidebarMenuSub>
                      {dataManagement.map((data) => (
                        <SidebarMenuSubItem
                          className="border-b"
                          key={data.title}
                        >
                          <SidebarMenuSubButton
                            asChild
                            className="transition-all mb-1 duration-200 hover:translate-x-1"
                          >
                            <Link className="pb-1" href={data.url}>
                              <data.icon className="transition-transform duration-300 group-data-[state=collapsed]:-translate-x-6 group-data-[state=collapsed]:opacity-0 group-data-[state=expanded]:translate-x-0 group-data-[state=expanded]:opacity-100" />
                              <span className="transition-opacity duration-200">
                                {data.title}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>

            <SidebarMenu>
              <Collapsible className="group/collapsible" defaultOpen>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <CalendarCheck />
                      <span className="text-nowrap">Routine Management</span>
                      <ChevronDown className="ml-auto transition-transform duration-300 group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="transition-all duration-300 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:slide-out-to-top-1 data-[state=open]:slide-in-from-top-1">
                    <SidebarMenuSub>
                      {routineMangement.map((routine) => (
                        <SidebarMenuSubItem
                          className="border-b"
                          key={routine.title}
                        >
                          <SidebarMenuSubButton
                            asChild
                            className="transition-all mb-1 duration-200 hover:translate-x-1"
                          >
                            <Link className="pb-1" href={routine.url}>
                              <routine.icon className="transition-transform duration-300 group-data-[state=collapsed]:-translate-x-6 group-data-[state=collapsed]:opacity-0 group-data-[state=expanded]:translate-x-0 group-data-[state=expanded]:opacity-100" />
                              <span className="transition-opacity duration-200">
                                {routine.title}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
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
