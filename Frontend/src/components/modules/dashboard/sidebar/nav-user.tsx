"use client";

import { ChevronsUpDown, LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import { resetAuth } from "@/store/authSlice";
import { logout } from "@/services/auth";

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "U";
}

export function NavUser() {
  const { isMobile, state } = useSidebar();
  const router = useRouter();
  const dispatch = useDispatch();

  const username = useSelector((s: RootState) => s.auth.username);
  const role = useSelector((s: RootState) => s.auth.role);

  const displayName = username || "Guest User";
  const secondary = role ? String(role) : "";
  const initials = getInitials(displayName);

  const handleLogout = async () => {
    try {
      if (typeof window !== "undefined") {
        sessionStorage.setItem("isLoggingOut", "true");
      }

      await logout();
      dispatch(resetAuth());

      toast.success("Logged out successfully", {
        description: "See you next time!",
        duration: 2500,
      });

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed", {
        description: "Please try again.",
      });
    }
  };

  return (
    <SidebarMenu className="border-t pt-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className={cn(
                "group relative overflow-hidden hover:bg-transparent data-[state=open]:bg-sidebar-accent cursor-pointer data-[state=open]:text-sidebar-accent-foreground",
                "h-12 w-full p-2"
              )}
            >
              <div className="relative z-20 flex items-center gap-2 w-full overflow-hidden">
                <Avatar className="h-8 w-8 rounded-lg shrink-0">
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>

                {state === "expanded" && (
                  <div className="grid flex-1 text-left text-sm leading-tight min-w-0 animate-in fade-in duration-300">
                    <span className="truncate font-medium text-sm">{displayName}</span>
                    {secondary ? (
                      <span className="truncate capitalize text-[8px]">
                        {secondary}
                      </span>
                    ) : null}
                  </div>
                )}

                {state === "expanded" && (
                  <ChevronsUpDown className="ml-auto size-4 shrink-0 animate-in fade-in duration-300" />
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
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium text-sm">{displayName}</span>
                  {secondary ? (
                    <span className="truncate capitalize text-[8px]">
                      {secondary}
                    </span>
                  ) : null}
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
              onClick={handleLogout}
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