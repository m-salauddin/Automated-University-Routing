"use client";

import * as React from "react";
import { Compass, ChevronLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 font-lexend relative select-none">
      <div className="w-full max-w-md z-10">
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-5 text-center relative overflow-hidden">
          
          {/* Simple Icon Area */}
          <div className="flex justify-center">
            <div className="p-3 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/20 text-blue-500 rounded-xl">
              <Compass className="w-10 h-10 stroke-[1.5]" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-5xl sm:text-6xl font-black tracking-tighter text-foreground">
              404
            </h1>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Lost in Space?
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
              The page you are looking for does not exist, has been removed, or is temporarily unavailable.
            </p>
          </div>

          {/* Separation Divider */}
          <div className="w-12 h-0.5 bg-border/60 mx-auto rounded-full" />

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5 justify-center max-w-xs mx-auto pt-1">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex-1 gap-2 cursor-pointer border-border/60 hover:bg-muted font-bold text-sm h-10 rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Go Back
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1 gap-2 cursor-pointer shadow-sm bg-blue-600 hover:bg-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold text-sm h-10 rounded-xl transition-all"
            >
              <Home className="w-4 h-4" /> Dashboard
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}
