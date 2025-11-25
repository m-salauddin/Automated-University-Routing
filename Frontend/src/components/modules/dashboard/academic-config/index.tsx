/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import { useState, useEffect, startTransition, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Building2,
  GraduationCap,
  Clock,
  Plus,
  Trash2,
  Edit2,
  MoreVertical,
  CalendarClock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  addNewDepartment,
  deleteDepartment,
  updateDepartment,
} from "@/services/departments";

// --- TYPES ---
type Department = { id: number; name: string };
type Semester = { id: number; name: string; order: number };
type TimeSlot = { id: number; start_time: string; end_time: string };

interface AcademicSettingsPageProps {
  departments: Department[];
  semesters: Semester[];
  timeSlots: TimeSlot[];
}

// --- PAGE ANIMATIONS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

// --- MODAL & INPUT ANIMATIONS (Simultaneous Fade Up) ---

// 1. Modal Container: Subtle Pop + Fade Up
const modalContentVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.96,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const, // Fixed: Added 'as const'
      stiffness: 400,
      damping: 25,
      mass: 1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.2 },
  },
};

// 2. Form Container: No Stagger (All children fire at once)
const formContainerVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0,
      delayChildren: 0.1,
    },
  },
};

// 3. Inputs: Simple Fade Up (No Blur)
const formItemVariants: Variants = {
  hidden: {
    y: 15,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const, // Fixed: Added 'as const'
      stiffness: 300,
      damping: 24,
    },
  },
};

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const TimePicker = ({ label, value, onChange }: TimePickerProps) => {
  const [hStr, mStr] = (value || "09:00").split(":");
  let h = parseInt(hStr);
  const m = mStr || "00";
  const initialPeriod = h >= 12 ? "PM" : "AM";
  if (h > 12) h -= 12;
  if (h === 0) h = 12;

  const [hour, setHour] = useState(h.toString());
  const [minute, setMinute] = useState(m);
  const [period, setPeriod] = useState<"AM" | "PM">(initialPeriod);

  const updateTime = (newH: string, newM: string, newP: string) => {
    let hourInt = parseInt(newH);
    if (newP === "PM" && hourInt !== 12) hourInt += 12;
    if (newP === "AM" && hourInt === 12) hourInt = 0;
    const formattedH = hourInt.toString().padStart(2, "0");
    onChange(`${formattedH}:${newM}:00`);
  };

  const handleHourChange = (val: string) => {
    setHour(val);
    updateTime(val, minute, period);
  };
  const handleMinuteChange = (val: string) => {
    setMinute(val);
    updateTime(hour, val, period);
  };
  const handlePeriodChange = (val: "AM" | "PM") => {
    setPeriod(val);
    updateTime(hour, minute, val);
  };

  return (
    <motion.div variants={formItemVariants} className="space-y-2">
      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        {label}
      </Label>
      <div className="flex flex-wrap items-center gap-2">
        <Select value={hour} onValueChange={handleHourChange}>
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
              <SelectItem key={h} value={h.toString()}>
                {h.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground font-bold hidden sm:inline">
          :
        </span>
        <Select value={minute} onValueChange={handleMinuteChange}>
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
              <SelectItem key={m} value={m.toString().padStart(2, "0")}>
                {m.toString().padStart(2, "0")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={period} onValueChange={handlePeriodChange}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </motion.div>
  );
};

// --- MAIN COMPONENT ---
export default function AcademicSettingsPage({
  departments: initialDepartments,
  semesters,
  timeSlots,
}: AcademicSettingsPageProps) {
  const router = useRouter();

  const [departmentsList, setDepartmentsList] =
    useState<Department[]>(initialDepartments);

  const departmentsDependency = useMemo(
    () => JSON.stringify(initialDepartments),
    [initialDepartments]
  );

  useEffect(() => {
    setDepartmentsList(initialDepartments);
  }, [departmentsDependency, initialDepartments]);

  // Modal States
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const [isSemModalOpen, setIsSemModalOpen] = useState(false);
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Loading States
  const [isLoading, setIsLoading] = useState(false);

  // Editing States
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [editingSem, setEditingSem] = useState<Semester | null>(null);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [deletingDeptId, setDeletingDeptId] = useState<number | null>(null);

  // Form States
  const [newDeptName, setNewDeptName] = useState("");
  const [newSemName, setNewSemName] = useState("");
  const [newSemOrder, setNewSemOrder] = useState("");
  const [newSlotStart, setNewSlotStart] = useState("09:00:00");
  const [newSlotEnd, setNewSlotEnd] = useState("10:00:00");

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const hour = parseInt(h);
    const suffix = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${suffix}`;
  };

  // --- HANDLERS ---
  const openAddDept = () => {
    setEditingDept(null);
    setNewDeptName("");
    setIsDeptModalOpen(true);
  };

  const openEditDept = (dept: Department) => {
    setEditingDept(dept);
    setNewDeptName(dept.name);
    setIsDeptModalOpen(true);
  };

  const openDeleteDept = (id: number) => {
    setDeletingDeptId(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveDepartment = async () => {
    if (!newDeptName.trim()) {
      toast.error("Department name cannot be empty");
      return;
    }

    setIsLoading(true);

    try {
      let res;
      if (editingDept) {
        setDepartmentsList((prev) =>
          prev.map((d) =>
            d.id === editingDept.id ? { ...d, name: newDeptName } : d
          )
        );
        res = await updateDepartment(editingDept.id, { name: newDeptName });
      } else {
        res = await addNewDepartment({ name: newDeptName });
      }

      if (res.success) {
        toast.success(
          editingDept
            ? `Department updated to "${newDeptName}"`
            : `Department "${newDeptName}" added successfully`
        );
        setIsDeptModalOpen(false);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setDepartmentsList(initialDepartments);
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async () => {
    if (!deletingDeptId) return;

    setIsLoading(true);
    const previousList = [...departmentsList];
    setDepartmentsList((prev) => prev.filter((d) => d.id !== deletingDeptId));

    try {
      const res = await deleteDepartment(deletingDeptId);

      if (res.success) {
        toast.success("Department deleted successfully");
        setIsDeleteModalOpen(false);
        setDeletingDeptId(null);
        startTransition(() => {
          router.refresh();
        });
      } else {
        setDepartmentsList(previousList);
        toast.error(res.message || "Failed to delete department");
      }
    } catch (err) {
      setDepartmentsList(previousList);
      toast.error("An unexpected error occurred during deletion");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddSem = () => {
    setEditingSem(null);
    setNewSemName("");
    setNewSemOrder("");
    setIsSemModalOpen(true);
  };
  const openEditSem = (sem: Semester) => {
    setEditingSem(sem);
    setNewSemName(sem.name);
    setNewSemOrder(sem.order.toString());
    setIsSemModalOpen(true);
  };
  const handleSaveSemester = () => {
    toast.success(editingSem ? "Semester Updated" : "Semester Added");
    setIsSemModalOpen(false);
  };

  const openAddSlot = () => {
    setEditingSlot(null);
    setNewSlotStart("09:00:00");
    setNewSlotEnd("10:00:00");
    setIsSlotModalOpen(true);
  };
  const openEditSlot = (slot: TimeSlot) => {
    setEditingSlot(slot);
    setNewSlotStart(slot.start_time);
    setNewSlotEnd(slot.end_time);
    setIsSlotModalOpen(true);
  };
  const handleSaveTimeSlot = () => {
    toast.success(editingSlot ? "Slot Updated" : "Slot Added");
    setIsSlotModalOpen(false);
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl mx-auto p-4 sm:p-6 space-y-8 font-lexend text-foreground pb-20"
      >
        {/* Header */}
        <div className="flex flex-col gap-2">
          <motion.div variants={itemVariants}>
            <Badge
              variant="outline"
              className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
            >
              Admin Panel
            </Badge>
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-3xl font-bold tracking-tight"
          >
            Academic Settings
          </motion.h1>
          <motion.p variants={itemVariants} className="text-muted-foreground">
            Manage departments, semesters, and class time slots for the routine
            system.
          </motion.p>
        </div>

        {/* --- SECTION 1: DEPARTMENTS --- */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">Departments</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={openAddDept}
            >
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {departmentsList.map((dept) => (
                <motion.div
                  key={dept.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="group hover:shadow-md transition-all h-full">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-muted-foreground">
                        ID: {dept.id}
                      </CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0 hover:bg-muted"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDept(dept)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50"
                            onClick={() => openDeleteDept(dept.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold leading-snug">
                        {dept.name}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>

        <div className="w-full h-px bg-border/50" />

        {/* --- SECTION 2: SEMESTERS --- */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">Semesters</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-primary/20"
              onClick={openAddSem}
            >
              <Plus className="w-4 h-4" /> Add Semester
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {semesters.map((sem) => (
              <Card
                key={sem.id}
                className="flex flex-col items-center justify-center p-4 hover:bg-muted/50 transition-colors relative group"
              >
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditSem(sem)}>
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mb-2 text-xs font-bold text-primary">
                  {sem.order}
                </div>
                <span className="font-bold text-lg text-center">
                  {sem.name}
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  Semester
                </span>
              </Card>
            ))}
          </div>
        </motion.div>

        <div className="w-full h-px bg-border/50" />

        {/* --- SECTION 3: TIME SLOTS --- */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                <CalendarClock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-semibold">Time Slots</h2>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2 border-primary/20"
              onClick={openAddSlot}
            >
              <Plus className="w-4 h-4" /> Add Time Slot
            </Button>
          </div>

          <div className="space-y-2">
            {timeSlots.map((slot) => (
              <div
                key={slot.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <Badge variant="outline" className="font-mono w-fit">
                      Slot {slot.id}
                    </Badge>
                    <span className="font-medium text-sm sm:text-base whitespace-nowrap">
                      {formatDisplayTime(slot.start_time)}{" "}
                      <span className="text-muted-foreground mx-1">-</span>{" "}
                      {formatDisplayTime(slot.end_time)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditSlot(slot)}>
                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* MODALS */}

      {/* DEPARTMENT MODAL */}
      <Dialog open={isDeptModalOpen} onOpenChange={setIsDeptModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw] max-h-[85vh] overflow-y-auto">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <DialogHeader>
              <DialogTitle>
                {editingDept ? "Edit Department" : "Add Department"}
              </DialogTitle>
              <DialogDescription>
                {editingDept
                  ? "Update existing department details."
                  : "Create a new academic department."}
              </DialogDescription>
            </DialogHeader>

            <motion.div
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4 py-4"
            >
              <motion.div variants={formItemVariants} className="space-y-2">
                <Label htmlFor="dept-name">Department Name</Label>
                <Input
                  id="dept-name"
                  placeholder="e.g. Computer Science & Engineering"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                />
              </motion.div>
            </motion.div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                onClick={handleSaveDepartment}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingDept ? "Update Changes" : "Save Changes"}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[425px]">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
          >
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this department? This action
                cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteDepartment}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* SEMESTER MODAL */}
      <Dialog open={isSemModalOpen} onOpenChange={setIsSemModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw]">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
          >
            <DialogHeader>
              <DialogTitle>
                {editingSem ? "Edit Semester" : "Add Semester"}
              </DialogTitle>
              <DialogDescription>
                Define a new semester level.
              </DialogDescription>
            </DialogHeader>
            <motion.div
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid gap-4 py-4"
            >
              <motion.div variants={formItemVariants} className="space-y-2">
                <Label htmlFor="sem-name">Semester Name</Label>
                <Input
                  id="sem-name"
                  placeholder="e.g. 1st"
                  value={newSemName}
                  onChange={(e) => setNewSemName(e.target.value)}
                />
              </motion.div>
              <motion.div variants={formItemVariants} className="space-y-2">
                <Label htmlFor="sem-order">Order Sequence</Label>
                <Input
                  id="sem-order"
                  type="number"
                  placeholder="e.g. 1"
                  value={newSemOrder}
                  onChange={(e) => setNewSemOrder(e.target.value)}
                />
              </motion.div>
            </motion.div>
            <DialogFooter>
              <Button onClick={handleSaveSemester}>
                {editingSem ? "Update Changes" : "Save Changes"}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* SLOT MODAL */}
      <Dialog open={isSlotModalOpen} onOpenChange={setIsSlotModalOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw]">
          <motion.div
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
          >
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? "Edit Time Slot" : "Add Time Slot"}
              </DialogTitle>
              <DialogDescription>
                Configure the start and end time for a class period.
              </DialogDescription>
            </DialogHeader>
            <motion.div
              variants={formContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 gap-6 py-4"
            >
              <TimePicker
                label="Start Time"
                value={newSlotStart}
                onChange={setNewSlotStart}
              />
              <TimePicker
                label="End Time"
                value={newSlotEnd}
                onChange={setNewSlotEnd}
              />
            </motion.div>
            <div className="bg-muted/50 p-3 rounded-md text-center text-sm mb-4">
              <span className="text-muted-foreground">Preview: </span>
              <span className="font-bold text-foreground">
                {formatDisplayTime(newSlotStart)} -{" "}
                {formatDisplayTime(newSlotEnd)}
              </span>
            </div>
            <DialogFooter>
              <Button onClick={handleSaveTimeSlot}>
                {editingSlot ? "Update Changes" : "Save Changes"}
              </Button>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  );
}
