"use client";

import { useEffect, useState } from "react";
import { ChevronsUpDown, LogOut, User, Sparkles } from "lucide-react"; 
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

  const [isMounted, setIsMounted] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  
  const displayName = username || "Guest User";
  const secondary = role ? String(role) : "";
  const initials = getInitials(displayName);

  
  const isAdmin = String(role).toLowerCase() === "admin";

  const handleLogout = async () => {
    try {
      await logout();
      dispatch(resetAuth());

      toast.success("Logged out successfully", {
        description: "See you next time!",
        duration: 2500,
      });

      router.push("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed", {
        description: "Please try again.",
      });
    }
  };

  if (!isMounted) {
    return (
      <SidebarMenu className="border-t pt-2">
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="flex items-center gap-2 w-full">
              <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse shrink-0" />
              {state === "expanded" && (
                <div className="grid flex-1 gap-1 text-left">
                  <div className="h-3.5 w-24 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
                  <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
                </div>
              )}
              {state === "expanded" && (
                <div className="ml-auto size-4 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
              )}
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

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
                    <span className="truncate font-medium text-sm">
                      {displayName}
                    </span>
                    <span className="truncate capitalize text-[8px]">
                      {secondary}
                    </span>
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
                  <span className="truncate font-medium text-sm">
                    {displayName}
                  </span>
                  <span className="truncate capitalize text-[8px]">
                    {secondary}
                  </span>
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

            {isAdmin && (
              <>
                <a target="1" href="https://routineproject-s6dh.onrender.com/admin/">
                  <DropdownMenuItem
                    className="cursor-pointer animate-in fade-in slide-in-from-left-8 duration-500 fill-mode-backwards"
                    style={{ animationDelay: "100ms" }}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Advanced
                  </DropdownMenuItem>
                </a>
              </>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => setIsLogoutDialogOpen(true)}
              className="cursor-pointer animate-in hover:text-red-400! text-red-400 fade-in slide-in-from-left-8 duration-500 fill-mode-backwards"
              style={{ animationDelay: "200ms" }}
            >
              <LogOut className="mr-2 h-4 w-4 text-red-400" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>

      {/* Logout Confirmation Dialog */}
      <Dialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <DialogContent className="sm:max-w-md w-full border border-[#ca2a30]/20 bg-background/95 backdrop-blur-md shadow-2xl shadow-[#ca2a30]/5 rounded-2xl p-6 font-lexend overflow-hidden">
          <div className="flex flex-col items-center text-center space-y-4 pt-2">
            {/* Premium warning icon circle */}
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#ca2a30]/10 border border-[#ca2a30]/20 shadow-[0_0_15px_rgba(202,42,48,0.15)] animate-in fade-in zoom-in-75 duration-300">
              <LogOut className="w-6 h-6 text-[#ca2a30]" />
              <div className="absolute inset-0 rounded-full bg-[#ca2a30]/5 animate-ping opacity-75" />
            </div>
            
            <div className="space-y-2">
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground text-center">
                Secure Logout
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground max-w-[300px] leading-relaxed text-center">
                Are you sure you want to end your session? Unsaved changes in your scheduler might be lost.
              </DialogDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsLogoutDialogOpen(false)}
              className="flex-1 h-10 font-semibold border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200 cursor-pointer"
            >
              Stay Logged In
            </Button>
            <Button
              onClick={async () => {
                setIsLogoutDialogOpen(false);
                await handleLogout();
              }}
              className="flex-1 h-10 font-semibold bg-[#ca2a30] hover:bg-[#b4252a] text-white rounded-xl shadow-lg shadow-[#ca2a30]/15 hover:shadow-[#ca2a30]/25 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              Log Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </SidebarMenu>
  );
}