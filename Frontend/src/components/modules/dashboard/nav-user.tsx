"use client";

import { ChevronsUpDown, LogOut, User } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import Link from "next/link";

export function NavUser() {
  const { isMobile, state } = useSidebar();

  const user = {
    name: "Shuvo Chandra Debnath",
    userId: "23151010",
    avatar:
      "https://scontent.fdac2-2.fna.fbcdn.net/v/t39.30808-6/580061444_1866883770570104_8552741300415222318_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeGDfFgkpK3LthYFeiW-94a3eMdw_XoMQOt4x3D9egxA69DgV5NsqvuiF6yecM5ivGlna5XFMG1wzx1PZs-nkDED&_nc_ohc=749PNjyuJysQ7kNvwGLWaGX&_nc_oc=AdlGjyhCKMn2KBPHQsyCgd4qpKVd4jx5s6nCikR_eUtrm2mg9eKO6jZinRLfuJm8fOsLBowDaaLom7q4vqxjtN9Q&_nc_zt=23&_nc_ht=scontent.fdac2-2.fna&_nc_gid=SGD2WIYLob6T1PFalNxhGw&oh=00_AfhydhtBGgxjLAYzlBraiKTx6lIbMpXkTQPwS8c_fO2O4g&oe=691C2B0B",
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "group relative dark:bg-[#1e1e1e] overflow-hidden data-[state=open]:bg-sidebar-accent cursor-pointer data-[state=open]:text-sidebar-accent-foreground",
                "h-12 w-full p-2"
              )}
            >
              {state === "expanded" && (
                <div
                  className="absolute inset-0 -translate-x-[150%] bg-linear-to-r from-transparent via-white/40 to-transparent 
                  transition-transform duration-1000 ease-in-out group-hover:translate-x-[150%] 
                  skew-x-[-20deg] pointer-events-none z-10 dark:via-white/10"
                />
              )}

              <div className="relative z-20 flex items-center gap-2 w-full">
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                {state === "expanded" && (
                  <div className="grid flex-1 text-left text-sm leading-tight animate-in fade-in slide-in-from-left-2 duration-200 overflow-hidden">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.userId}</span>
                  </div>
                )}
                {state === "expanded" && (
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 animate-in fade-in duration-200" />
                )}
              </div>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.userId}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <Link href="/dashboard/profile">
              <DropdownMenuItem
                className="cursor-pointer animate-in fade-in slide-in-from-left-8 duration-500 fill-mode-backwards"
                style={{ animationDelay: "0ms" }}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer animate-in hover:text-red-400! text-red-400 fade-in slide-in-from-left-8 duration-500 fill-mode-backwards"
              style={{ animationDelay: "150ms" }}
            >
              <LogOut className="mr-2 h-4 w-4 text-red-400" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
