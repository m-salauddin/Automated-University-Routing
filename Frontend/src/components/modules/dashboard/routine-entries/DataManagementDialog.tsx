"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FileSpreadsheet,
  Download,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { exportExcel } from "@/services/routine";
import { toast } from "sonner";

interface DataManagementDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const EXPORT_MODELS = [
  "routine",
  "user",
  "course",
  "department",
  "semester",
  "time_slot",
] as const;

type ModelName = (typeof EXPORT_MODELS)[number];

const modalContentVariants: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.15, ease: "easeOut", staggerChildren: 0.05 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

const modalItemVariants: Variants = {
  hidden: { y: 8, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.12, ease: "easeOut" },
  },
};

export function DataManagementDialog({
  isOpen,
  onOpenChange,
}: DataManagementDialogProps) {
  const [exportModel, setExportModel] = useState<ModelName>("routine");
  const [isExporting, setIsExporting] = useState(false);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    setIsExporting(true);
    const toastId = toast.loading(`Preparing Excel export for ${exportModel}...`);
    try {
      const res = await exportExcel(exportModel);
      if (res.success && res.blob) {
        triggerDownload(
          res.blob,
          `${exportModel}_export_${new Date().toISOString().slice(0, 10)}.xlsx`
        );
        toast.success(`Exported ${exportModel} successfully!`, { id: toastId });
      } else {
        toast.error(res.message || "Export failed", { id: toastId });
      }
    } catch {
      toast.error("Export failed", { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-visible border-0 bg-transparent shadow-none">
        <AnimatePresence mode="wait">
          {isOpen && (
            <motion.div
              key="data-management-modal"
              variants={modalContentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-background border border-emerald-500/20 rounded-lg shadow-xl w-full flex flex-col overflow-hidden"
            >
              {/* Header */}
              <motion.div
                variants={modalItemVariants}
                className="p-6 pb-4 flex items-start gap-4 border-b bg-muted/20 border-border/65 rounded-t-lg"
              >
                <div className="p-3 rounded-full shrink-0 bg-emerald-500/10 text-emerald-500">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-xl">Data Management</DialogTitle>
                  <DialogDescription className="text-sm leading-snug text-muted-foreground/90">
                    Export model data as Excel files.
                  </DialogDescription>
                </div>
              </motion.div>

              {/* Body */}
              <div className="p-6 bg-card">
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  className="space-y-4"
                >
                  <p className="text-sm text-muted-foreground/90">
                    Download a specific model&apos;s data as an{" "}
                    <strong className="text-foreground">.xlsx</strong> file.
                  </p>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">
                      Select Model
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {EXPORT_MODELS.map((m) => (
                        <button
                          key={m}
                          onClick={() => setExportModel(m)}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium border capitalize transition-colors",
                            exportModel === m
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                              : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {m.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div
                variants={modalItemVariants}
                className="p-6 pt-2 bg-card flex justify-end gap-3 border-t border-border/50 rounded-b-lg"
              >
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>

                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm min-w-[140px]"
                >
                  {isExporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {isExporting ? "Exporting…" : `Export "${exportModel.replace("_", " ")}"`}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
