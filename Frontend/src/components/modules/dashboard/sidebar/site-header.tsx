import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "@/components/mode-toggle"
import { FaGithub } from "react-icons/fa";
import { NotificationBell } from "./notification-bell";

export function SiteHeader() {
    return (
        <header className="flex print:hidden h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1 cursor-pointer" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <h1 className="text-base font-medium font-lexend">Dashboard</h1>
                <div className="ml-auto flex items-center gap-2 sm:gap-3">
                    <NotificationBell />
                    <ModeToggle />
                    <Button variant="ghost" asChild size="icon" className="h-9 w-9 cursor-pointer">
                        <a
                            href="https://github.com/m-salauddin/Automated-University-Routing/tree/main"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="dark:text-foreground"
                        >
                            <FaGithub className="h-[1.1rem] w-[1.1rem]" />
                        </a>
                    </Button>
                </div>
            </div>
        </header>
    )
}
