"use client";

import * as React from "react";
import {
  AudioWaveform,
  ChevronsUpDown,
  Command,
  GalleryVerticalEnd,
  Users,
} from "lucide-react";
// import logo from "@/assets/logo.svg";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
// import Image from "next/image";
import { cn } from "@/lib/utils";
import Logo from "@/components/ui/logo";

export function TeamSwitcher() {
  const { isMobile, state } = useSidebar();
  const [showContent, setShowContent] = React.useState(state === "expanded");

  React.useEffect(() => {
    if (state === "expanded") {
      const timer = setTimeout(() => setShowContent(true), 200);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [state]);

  const data = [
    {
      name: "Shuvo Chandra Debnath",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Md Salauddin",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Sribash Rajbongshi",
      logo: Command,
      plan: "Free",
    },
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "group relative overflow-hidden transition-all duration-300 ease-in-out cursor-pointer flex font-pacifico bg-muted/60 rounded-md items-center gap-2 w-full",
                showContent ? "p-2" : "justify-center size-8 p-0"
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
                <div className="shrink-0">
                  <Logo className="w-8 h-8" />
                </div>

                {showContent && (
                  <>
                    <div className="flex-1 animate-in fade-in slide-in-from-left-2 duration-200 overflow-hidden">
                      <span className="text-lg font-lexend text-nowrap font-bold tracking-tight block">
                        Automated Routine
                      </span>
                    </div>

                    <ChevronsUpDown className="ml-auto size-4 shrink-0 animate-in fade-in duration-200" />
                  </>
                )}
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) overflow-hidden bg-sidebar min-w-56 rounded-lg p-0"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="mx-1 my-1 rounded-md bg-sidebar-accent/50 px-2 py-1.5">
              <div className="flex items-center gap-2">
                <div className="flex size-5 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-border/50">
                  <Users className="size-3 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">
                    Team Members
                  </span>
                  <span className="text-[10px] font-normal text-muted-foreground leading-none">
                    Visit account
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            {data.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                className="gap-2 p-2 border-t cursor-pointer rounded-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground animate-in fade-in slide-in-from-left-8 duration-500 fill-mode-backwards"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex size-6 items-center p-2 justify-center rounded-md border">
                  <team.logo className="size-3.5 shrink-0" />
                </div>
                {team.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
