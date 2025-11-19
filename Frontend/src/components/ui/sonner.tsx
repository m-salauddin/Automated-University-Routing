"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {

  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      icons={{
        success: <CircleCheckIcon className="size-4 dark:text-emerald-500" />,
        info: <InfoIcon className="size-4 dark:text-blue-500" />,
        warning: <TriangleAlertIcon className="size-4 dark:text-amber-500" />,
        error: <OctagonXIcon className="size-4 dark:text-red-500" />,
        loading: <Loader2Icon className="size-4 animate-spin dark:text-white" />,
      }}

      toastOptions={{
          classNames: {
              toast:
                  "group toast dark:bg-black! dark:text-white! dark:border-muted! w-fit! font-lexend shadow-xl shadow-primary/10 backdrop-blur-sm ",
              title: "text-white font-barlow font-semibold text-sm",
              description: "text-white/70 font-barlow text-xs",
              actionButton:
                  "bg-primary hover:bg-primary/90 text-white font-barlow font-medium",
              cancelButton: "bg-white/10 hover:bg-white/20 text-white font-barlow",
          }
      }}
      {...props}
    />
  );
}

export { Toaster }
