"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
     
      toastOptions={{
        classNames: {
          toast:
            "bg-light-primary dark:bg-dark border border-teal-200 dark:border-slate-800 shadow-2xl backdrop-blur-sm",
          title: "text-zinc-800 dark:text-gray-100 font-sans font-semibold",
          description: "text-gray-600 dark:text-gray-400 font-mono text-sm",
          success:
            "bg-white/90 dark:bg-slate-900 border-teal-400 dark:border-teal-600 shadow-2xl",
          error:
            "bg-white/90 dark:bg-slate-900 border-rose-400 dark:border-rose-600 shadow-2xl",
          warning:
            "bg-white/90 dark:bg-slate-900 border-amber-400 dark:border-amber-600 shadow-2xl",
          info: "bg-white/90 dark:bg-slate-900 border-sky-400 dark:border-sky-600 shadow-2xl",
          actionButton:
            "bg-teal-400 dark:bg-teal-600 text-teal-900 dark:text-white hover:bg-teal-500 dark:hover:bg-teal-700",
          cancelButton:
            "bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300",
        },
      }}
      {...props}
    />
  );
}

export { Toaster }
