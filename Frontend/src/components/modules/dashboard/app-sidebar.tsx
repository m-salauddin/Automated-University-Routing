"use client";

import {
  CalendarCheck,
  ChartColumnBig,
  FolderDown,
  User,
  View,
  ChevronRight,
  ListTodo,
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
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TeamSwitcher } from "./team-switcher";
import { NavUser } from "./nav-user";
import { cn } from "@/lib/utils";

const items = [
  { title: "Analytics", url: "/dashboard/analytics", icon: ChartColumnBig },
  { title: "Curriculum", url: "/dashboard/course-curriculum", icon: ListTodo },
];

export function AppSidebar() {
  const pathname = usePathname();

  const { state, isMobile, setOpenMobile } = useSidebar();

  const { role } = { role: "teacher" };

  const studentPanel = [
    {
      title: "Students routine",
      url: "/dashboard/students-routine",
      icon: View,
    },
    { title: "Profile", url: "/dashboard/profile", icon: User },
    {
      title: "Routine Export in pdf",
      url: "/dashboard/export-pdf",
      icon: FolderDown,
    },
  ];

  const teacherPanel = [
    {
      title: "Students routine",
      url: "/dashboard/students-routine",
      icon: View,
    },
    {
      title: "Own routine",
      url: "/dashboard/own-routine",
      icon: CalendarCheck,
    },
  ];

  const panelItems = role === "teacher" ? teacherPanel : studentPanel;
  const panelTitle = role === "teacher" ? "Teacher Panel" : "Student Panel";

  const isCollapsed = state === "collapsed";

  const isActive = (url: string) => pathname === url;

  const renderMenuItem = (
    item: { title: string; url: string; icon: React.ElementType },
    index: number
  ) => {
    const active = isActive(item.url);

    return (
      <SidebarMenuItem
        key={item.title}
        className="animate-in border-b pb-1 slide-in-from-left-2 fade-in duration-500 fill-mode-both"
        style={{ animationDelay: `${index * 100}ms` }}
      >
        <SidebarMenuButton
          asChild
          tooltip={item.title}
          className={cn(
            " transition-all duration-200 group/item",
            "hover:translate-x-1",
            active
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Link
            href={item.url}
            className="flex items-center w-full"
            onClick={() => {
              if (isMobile) {
                setOpenMobile(false);
              }
            }}
          >
            <div
              className={cn(
                "relative flex items-center justify-center size-8 rounded-lg transition-all duration-300",
                active &&
                  "group-data-[state=collapsed]/side:border group-data-[state=collapsed]/side:border-primary group-data-[state=collapsed]/side:shadow-[0_0_10px_-4px_hsl(var(--primary))] group-data-[state=collapsed]/side:bg-primary/5"
              )}
            >
              <item.icon
                className={cn("size-4.5 transition-transform duration-300")}
              />
            </div>

            <div
              className={cn(
                "flex flex-1 items-center overflow-hidden transition-all duration-300 group-data-[state=collapsed]/side:hidden",
                active ? "translate-x-0" : " -translate-x-2"
              )}
            >
              <ChevronRight
                className={cn(
                  "size-4 mr-2 transition-all duration-300 text-primary shrink-0",
                  active ? "opacity-100 w-4" : "opacity-0 w-0"
                )}
              />
              <span className="truncate text-sm">{item.title}</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  const renderGroupContent = (itemsToRender: typeof items) => (
    <SidebarGroupContent>
      <div
        className={cn(
          "mt-2 transition-all duration-300 ease-in-out",
          !isCollapsed ? "ml-3 pl-3 border-l " : "ml-0 pl-0 border-none"
        )}
      >
        <SidebarMenu>
          {itemsToRender.map((item, idx) => renderMenuItem(item, idx))}
        </SidebarMenu>
      </div>
    </SidebarGroupContent>
  );

  return (
    <Sidebar
      collapsible="icon"
      className="transition-all duration-300 ease-in-out font-lexend group/side"
    >
      <SidebarHeader className="py-4">
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent className="transition-opacity overflow-hidden duration-200">
        <SidebarGroup>
          <SidebarGroupLabel className="pl-2">Application</SidebarGroupLabel>
          {renderGroupContent(items)}

          <div className="mt-6" />

          <SidebarGroupLabel className="pl-2">{panelTitle}</SidebarGroupLabel>
          {renderGroupContent(panelItems)}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
