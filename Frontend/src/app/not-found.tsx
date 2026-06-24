"use client";

import * as React from "react";
import { motion } from "framer-motion";
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
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 font-lexend relative overflow-hidden select-none">
      {/* Animated Glowing Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:30px_30px]" />
      
      {/* Decorative Blur Background Blobs */}
      <div className="absolute top-1/3 right-1/4 translate-x-1/2 -translate-y-1/2 w-80 sm:w-[600px] h-80 sm:h-[600px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[7000ms]" />
      <div className="absolute bottom-1/3 left-1/4 -translate-x-1/2 translate-y-1/2 w-80 sm:w-[600px] h-80 sm:h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[9000ms]" />

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 text-center relative overflow-hidden">
          
          {/* Glowing Illustration / Icon Area */}
          <div className="flex justify-center">
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut",
              }}
              className="p-5 bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/30 text-blue-500 rounded-3xl shadow-[0_0_25px_rgba(59,130,246,0.15)]"
            >
              <Compass className="w-12 h-12 sm:w-14 sm:h-14 stroke-[1.5]" />
            </motion.div>
          </div>

          {/* Heading with Elegant Gradient Text */}
          <div className="space-y-3">
            <motion.h1 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
              className="text-7xl sm:text-8xl font-black tracking-tighter bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent"
            >
              404
            </motion.h1>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Lost in Space?
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              The page you are looking for does not exist, has been removed, or is temporarily unavailable.
            </p>
          </div>

          {/* Separation Divider */}
          <div className="w-16 h-1 bg-border/40 mx-auto rounded-full" />

          {/* Navigation Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-sm mx-auto">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="flex-1 gap-2 cursor-pointer border-border/60 hover:bg-muted font-bold text-sm h-12 rounded-xl transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Go Back
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1 gap-2 cursor-pointer shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm h-12 rounded-xl transition-all"
            >
              <Home className="w-4 h-4" /> Dashboard
            </Button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
