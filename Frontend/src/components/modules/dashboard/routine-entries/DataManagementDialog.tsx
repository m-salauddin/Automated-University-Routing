"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  FileSpreadsheet,
  FileDown,
  FileUp,
  AlertTriangle,
  CheckCircle2,
  Upload,
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
import { exportExcel, importExcel } from "@/services/routine";
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
  onSuccess,
}: DataManagementDialogProps) {
  const [dmTab, setDmTab] = useState<"export" | "import">("export");
  const [exportModel, setExportModel] = useState<ModelName>("routine");
  const [importModel, setImportModel] = useState<ModelName>("routine");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

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

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a file to import");
      return;
    }
    setIsImporting(true);
    const toastId = toast.loading(`Importing file into ${importModel}...`);
    try {
      const res = await importExcel(importModel, importFile);
      if (res.success) {
        toast.success(`Successfully imported data into ${importModel}!`, {
          id: toastId,
        });
        setImportFile(null);
        if (importFileRef.current) importFileRef.current.value = "";
        onSuccess?.();
        onOpenChange(false);
      } else {
        toast.error(res.message || "Import failed", { id: toastId });
      }
    } catch {
      toast.error("Import failed", { id: toastId });
    } finally {
      setIsImporting(false);
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
                    Export or import model data as Excel files.
                  </DialogDescription>
                </div>
              </motion.div>

              {/* Tab bar */}
              <div className="flex border-b border-border/65 bg-muted/10">
                {(["export", "import"] as const).map((tab) => {
                  const Icon = tab === "export" ? FileDown : FileUp;
                  return (
                    <button
                      key={tab}
                      onClick={() => setDmTab(tab)}
                      className={cn(
                        "flex items-center gap-1.5 px-6 py-3 text-sm font-semibold capitalize border-b-2 -mb-px transition-colors",
                        dmTab === tab
                          ? "border-emerald-500 text-emerald-500"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab}
                    </button>
                  );
                })}
              </div>

              {/* Body */}
              <div className="p-6 bg-card">
                {/* ── EXPORT TAB ── */}
                {dmTab === "export" && (
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
                )}

                {/* ── IMPORT TAB ── */}
                {dmTab === "import" && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="space-y-4"
                  >
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Importing will <strong>overwrite</strong> existing
                        records. Make sure the file matches the model&apos;s
                        schema.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">
                        Select Model
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {EXPORT_MODELS.map((m) => (
                          <button
                            key={m}
                            onClick={() => setImportModel(m)}
                            className={cn(
                              "px-3 py-2 rounded-lg text-sm font-medium border capitalize transition-colors",
                              importModel === m
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {m.replace("_", " ")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">
                        Excel File
                      </label>
                      <div
                        onClick={() => importFileRef.current?.click()}
                        className={cn(
                          "flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed cursor-pointer transition-colors",
                          importFile
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "border-border hover:border-emerald-500/40 hover:bg-muted/40"
                        )}
                      >
                        {importFile ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            <span className="text-sm font-medium text-foreground">
                              {importFile.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {(importFile.size / 1024).toFixed(1)} KB
                            </span>
                          </>
                        ) : (
                          <>
                            <Upload className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Click to choose an <strong>.xlsx</strong> file
                            </span>
                          </>
                        )}
                        <input
                          ref={importFileRef}
                          type="file"
                          accept=".xlsx,.xls"
                          className="hidden"
                          onChange={(e) =>
                            setImportFile(e.target.files?.[0] ?? null)
                          }
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <motion.div
                variants={modalItemVariants}
                className="p-6 pt-2 bg-card flex justify-end gap-3 border-t border-border/50 rounded-b-lg"
              >
                <Button variant="ghost" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>

                {dmTab === "export" ? (
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
                    {isExporting ? "Exporting…" : `Export "${exportModel}"`}
                  </Button>
                ) : (
                  <Button
                    onClick={handleImport}
                    disabled={isImporting || !importFile}
                    className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm min-w-[120px]"
                  >
                    {isImporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {isImporting ? "Importing…" : "Import"}
                  </Button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
