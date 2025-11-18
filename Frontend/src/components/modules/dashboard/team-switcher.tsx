"use client";

import * as React from "react";
import { AudioWaveform, ChevronsUpDown, Command, GalleryVerticalEnd } from "lucide-react";
import logo from "@/assets/logo.svg";

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
import Image from "next/image";

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
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ];

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={` ${showContent && "p-2"} cursor-pointer flex font-pacifico hover:bg-sidebar-accent rounded-md items-center gap-2`}>
              <div>
                <Image src={logo} width={35} height={35} alt="logo" />
              </div>
              {showContent && (
                <>
                  <div className="animate-in fade-in slide-in-from-left-2 duration-200">
                    <span className="text-lg font-script">
                      Automated Routine
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 animate-in fade-in duration-200" />
                </>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) overflow-hidden bg-sidebar min-w-56 rounded-lg p-0"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground font-lexend py-1 pt-0 text-center text-xs">
              <span className="relative bottom-0.5 text-dark-primary animate-pulse font-extrabold text-2xl mr-1">
                .
              </span>
              Our Team Members
            </DropdownMenuLabel>
            {data.map((team, index) => (
              <DropdownMenuItem
                key={team.name}
                className="gap-2 p-2 border-t cursor-pointer rounded-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
