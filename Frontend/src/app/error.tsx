"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ChevronLeft, Home, Terminal, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  const handleGoBack = () => {
    if (typeof window !== "undefined") {
      window.history.back();
    }
  };

  const handleGoHome = () => {
    if (typeof window !== "undefined") {
      window.location.href = "/dashboard";
    }
  };

  const handleCopy = async () => {
    try {
      const textToCopy = `Digest: ${error.digest || "N/A"}\n\n${error.stack || error.toString()}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 sm:p-6 font-lexend relative select-none">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-lg z-10"
      >
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
          {/* Header Section */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-red-500/10 dark:bg-red-500/15 border border-red-500/20 text-red-500 rounded-xl">
              <AlertTriangle className="w-10 h-10 sm:w-12 sm:h-12" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                This Page Couldn't Load
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm max-w-sm leading-relaxed">
                An unexpected execution error occurred while compiling or rendering this segment.
              </p>
            </div>
          </div>

          {/* Quick Error Message Display */}
          <div className="bg-muted/40 dark:bg-muted/15 border border-border/30 rounded-xl p-4 text-center">
            <p className="text-xs sm:text-sm font-semibold text-foreground/80 break-words leading-relaxed">
              {error.message || "An unresolved runtime error has halted operation."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              onClick={() => reset()}
              className="flex-1 gap-2 cursor-pointer shadow-sm bg-red-600 hover:bg-red-500 dark:bg-red-500 dark:hover:bg-red-600 text-white font-bold text-sm h-11 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </Button>
            
            <div className="flex gap-3 flex-1">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="flex-1 gap-2 cursor-pointer border-border/60 hover:bg-muted font-bold text-sm h-11"
              >
                <ChevronLeft className="w-4 h-4" /> Go Back
              </Button>
              <Button
                variant="outline"
                onClick={handleGoHome}
                className="flex-1 gap-2 cursor-pointer border-border/60 hover:bg-muted font-bold text-sm h-11"
              >
                <Home className="w-4 h-4" /> Home
              </Button>
            </div>
          </div>

          {/* Developer Technical Details Accordion */}
          <div className="border-t border-border/40 pt-4">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full text-left text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer py-1"
            >
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Technical Details
              </span>
              <motion.span
                animate={{ rotate: showDetails ? 90 : 0 }}
                transition={{ duration: 0.2 }}
                className="font-bold text-[10px]"
              >
                ▶
              </motion.span>
            </button>

            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 overflow-hidden border border-border/60 rounded-lg bg-zinc-950/20"
              >
                {/* Custom toolbar header */}
                <div className="flex items-center justify-between px-3 py-2 bg-neutral-900 border-b border-border/40 text-[10px] text-neutral-400 font-semibold tracking-wider">
                  <span>LOG DETAILS / STACK TRACE</span>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 px-2 rounded bg-neutral-800 border border-neutral-700/60 hover:bg-neutral-700 text-neutral-300 font-bold"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Details</span>
                      </>
                    )}
                  </button>
                </div>
                {/* Scrollable code block */}
                <div className="p-3 bg-neutral-950 text-neutral-300 font-mono text-[10px] sm:text-xs overflow-x-auto max-h-40 compact-scrollbar selection:bg-neutral-800">
                  {error.digest && (
                    <p className="font-bold text-red-400 mb-1">
                      Digest: {error.digest}
                    </p>
                  )}
                  <p className="whitespace-pre-wrap select-text leading-relaxed">
                    {error.stack || error.toString()}
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
