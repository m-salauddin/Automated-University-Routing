"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Printer,
  User,
  MapPin,
  GraduationCap,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ClassSession, routineData } from "./students-routine-data";

const timeSlots = [
  "8.45-9.35",
  "9.40-10.30",
  "10.35-11.25",
  "11.30-12.20",
  "12.25-1.15",
  "Break",
  "2.00-2.45",
  "2.45-3.30",
  "3.30-4.15",
];

const LUNCH_SLOT_INDEX = 5;

// --- Animation Variants ---

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 120, damping: 20 },
  },
};


export default function DepartmentRoutinePage() {
  const [selectedSemester, setSelectedSemester] = useState<string>("6th");
  const [inputValue, setInputValue] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const currentRoutine = useMemo(
    () => routineData[selectedSemester],
    [selectedSemester]
  );
  const semesterOptions = useMemo(() => Object.values(routineData), []);

  const isMatch = useMemo(() => {
    return (session: ClassSession | null) => {
      if (!session || !debouncedSearch) return false;
      const query = debouncedSearch.toLowerCase();
      return (
        session.course.toLowerCase().includes(query) ||
        session.teacher.toLowerCase().includes(query) ||
        session.room.toLowerCase().includes(query)
      );
    };
  }, [debouncedSearch]);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen font-lexend w-full max-w-[1600px] mx-auto bg-background text-foreground p-5 overflow-x-hidden print:p-0 print:bg-white print:overflow-visible"
    >
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 0.5cm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            background-color: white !important;
          }
          * {
            box-shadow: none !important;
            transition: none !important;
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      <div className="space-y-8 print:space-y-0 print:w-full print:max-w-none">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 print:hidden">
          <div className="space-y-2">
            <motion.div variants={itemVariants}>
              <Badge
                variant="outline"
                className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
              >
                Session {currentRoutine.session}
              </Badge>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
            >
              Department of CSE
            </motion.h1>
            <motion.div variants={itemVariants} className="flex items-center gap-3">
              <p className="text-muted-foreground font-medium text-lg">
                Class Routine
              </p>
            </motion.div>
          </div>
          <motion.div variants={itemVariants}>
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary hidden md:flex"
            >
              <Printer className="h-4 w-4" />
              Print View
            </Button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 mb-5 lg:grid-cols-12 gap-4 print:hidden">
          {/* -- Filter Group -- */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-8 flex justify-between flex-col sm:flex-row gap-3 bg-card border rounded-xl p-1.5 shadow-sm"
          >
            <div className=" flex items-center gap-3 px-3 bg-muted/30 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all">
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedSemester}
                onValueChange={setSelectedSemester}
              >
                <SelectTrigger className="h-10 border-none shadow-none bg-transparent! focus-visible:ring-0 focus:ring-0 px-0 font-medium">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {semesterOptions.map((sem) => (
                    <SelectItem key={sem.id} value={sem.id}>
                      {sem.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex font-lexend items-center justify-between px-4 py-2 bg-muted/30 rounded-lg min-w-[140px]">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Credits
              </span>
              <span className="ml-2 text-primary">
                {currentRoutine.credits}
              </span>
            </div>
          </motion.div>

          {/* -- Search -- */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-4 bg-card border rounded-xl p-1.5 shadow-sm"
          >
            <div className="flex items-center gap-3 px-3 h-full bg-muted/30 rounded-lg border border-transparent focus-within:border-primary/20 focus-within:bg-background transition-all">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Find course, teacher, room..."
                className="border-none font-lexend shadow-none bg-transparent! focus-visible:ring-0 h-10 px-0 text-sm"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
          </motion.div>
        </div>

        {/* --- Header (Print Only) --- */}
        <div className="hidden print:flex flex-col items-center justify-center mb-6 pt-2 text-center w-full font-serif text-black">
          <h1 className="text-3xl font-bold text-black mb-3 tracking-tight">
            Department of Computer Science & Engineering
          </h1>
          <div className="border-[3px] border-double border-black px-8 py-1 mb-5">
            <h2 className="text-lg font-bold uppercase text-black tracking-wide">
              Class Routine – {currentRoutine.session}
            </h2>
          </div>
          <div className="w-full flex border border-black font-bold text-sm">
            <div className="bg-gray-300 border-r border-black px-6 py-1.5">
              Semester
            </div>
            <div className="flex-1 text-center py-1.5 border-r border-black">
              {currentRoutine.label}
            </div>
            <div className="bg-gray-300 border-r border-black px-6 py-1.5">
              Total Credit
            </div>
            <div className="px-10 py-1.5 text-center">
              {currentRoutine.credits}
            </div>
          </div>
        </div>

        {/* --- Main Table Container --- */}
        <motion.div
          variants={itemVariants}
          className="rounded-xl font-lexend border bg-card/50 shadow-sm overflow-hidden w-full grid grid-cols-1 print:rounded-none print:border-none print:shadow-none print:bg-transparent print:overflow-visible"
        >
          <div className="overflow-x-auto w-full print:overflow-visible">
            <Table className="w-full overflow-hidden min-w-[1000px] print:min-w-0 print:w-full border-collapse text-sm print:border-collapse print:border border-black">
              <TableHeader>
                <TableRow className="border-b border-border/60 hover:bg-transparent print:border-black print:border-b">
                  <TableCell className="p-0 w-[90px] min-w-[90px] h-[60px] border-r border-border/60 relative bg-muted/40 print:bg-white print:border-r print:border-black print:w-[100px] print:min-w-0">
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      preserveAspectRatio="none"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="100%"
                        y2="100%"
                        className="stroke-border/60 print:stroke-black"
                        strokeWidth="1"
                      />
                    </svg>
                    <span className="absolute top-2 right-2 text-[10px] font-bold print:text-black">
                      Time
                    </span>
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold print:text-black">
                      Day
                    </span>
                  </TableCell>
                  {timeSlots.map((slot, i) => (
                    <TableCell
                      key={i}
                      className={cn(
                        "text-center align-middle h-[60px] border-r border-border/60 last:border-r-0 p-0 print:border-r print:border-black print:last:border-r-0",
                        i === LUNCH_SLOT_INDEX
                          ? "w-10 min-w-10 bg-foreground text-background print:bg-white print:text-black"
                          : "min-w-[100px] bg-muted/10 print:bg-white print:min-w-0"
                      )}
                    >
                      <div className="flex flex-col items-center justify-center h-full w-full px-1">
                        {i === LUNCH_SLOT_INDEX ? (
                          <div className="h-full flex items-center justify-center print:hidden">
                            <span className="text-[10px] font-black uppercase tracking-widest -rotate-90 whitespace-nowrap text-background">
                              Break
                            </span>
                          </div>
                        ) : (
                          <span className="font-bold text-xs whitespace-nowrap print:text-[11px] print:font-bold print:text-black">
                            {slot}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHeader>

              <motion.tbody
                key={selectedSemester}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <AnimatePresence mode="popLayout">
                  {currentRoutine.schedule.map((dayRow) => (
                    <motion.tr
                      key={dayRow.day}
                      variants={itemVariants}
                      className="border-b border-border/60 hover:bg-muted/5 print:border-black print:border-b print:h-20"
                    >
                      <TableCell className="font-bold text-xs uppercase tracking-wider p-0 align-middle text-center bg-muted/20 border-r border-border/60 print:border-r print:border-black print:bg-white print:text-black print:font-bold">
                        <div className="flex items-center justify-center h-full w-full py-4">
                          <span className="writing-mode-vertical lg:writing-mode-horizontal lg:rotate-0 print:rotate-0">
                            {dayRow.day}
                          </span>
                        </div>
                      </TableCell>

                      {dayRow.slots.map((session, index) => {
                        const highlighted = isMatch(session);
                        const isLunch = index === LUNCH_SLOT_INDEX;

                        if (isLunch) {
                          return (
                            <TableCell
                              key={index}
                              className="p-0 align-middle border-r-0 relative overflow-hidden bg-muted/20 print:bg-gray-200 print:border-r print:border-black"
                            >
                              <div
                                className="absolute inset-0 opacity-10 print:hidden"
                                style={{
                                  backgroundImage:
                                    "linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)",
                                  backgroundSize: "4px 4px",
                                }}
                              />
                              <div className="h-full w-full flex items-center justify-center relative z-10 print:hidden">
                                <Utensils className="w-3 h-3 text-foreground/40" />
                              </div>
                            </TableCell>
                          );
                        }

                        return (
                          <TableCell
                            key={index}
                            className={cn(
                              "p-1.5 align-middle border-r border-border/60 transition-colors duration-200 print:border-r print:border-black print:p-1",
                              highlighted
                                ? "bg-foreground/5 print:bg-transparent"
                                : "bg-transparent print:bg-white"
                            )}
                          >
                            {session ? (
                              <>
                                <div
                                  className={cn(
                                    "h-full w-full rounded-md border flex flex-col justify-between p-2 shadow-sm cursor-default group print:hidden",
                                    "transition-colors duration-200",
                                    highlighted
                                      ? "bg-background border-foreground shadow-md ring-1 ring-foreground/10"
                                      : "bg-card border-border/50 hover:border-foreground/20 hover:shadow-md"
                                  )}
                                >
                                  <div className="flex justify-between items-start">
                                    <span className="text-xs font-extrabold tracking-tight leading-tight text-foreground">
                                      {session.course}
                                    </span>
                                  </div>
                                  <div className="flex flex-col gap-0.5 mt-1">
                                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                      <User className="w-3 h-3 opacity-70" />
                                      <span>{session.teacher}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground/80">
                                      <MapPin className="w-3 h-3 opacity-70" />
                                      <span>{session.room}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="hidden print:flex flex-col items-center justify-center text-center text-black h-full w-full leading-snug">
                                  <span className="font-bold text-[11px]">
                                    {session.course}, T-
                                    {session.teacher},
                                  </span>
                                  <span className="font-bold text-[11px]">
                                    R-{session.room}
                                  </span>
                                </div>
                              </>
                            ) : (
                              <div className="h-full w-full flex items-center justify-center">
                                <div className="w-1 h-1 rounded-full bg-border print:hidden" />
                              </div>
                            )}
                          </TableCell>
                        );
                      })}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </motion.tbody>
            </Table>
          </div>
        </motion.div>

        {/* -- Mobile Print Hint -- */}
        <div className="text-center mt-6 print:hidden sm:hidden">
          <Button
            onClick={() => window.print()}
            variant="outline"
            className="w-full gap-2"
          >
            <Printer className="h-4 w-4" /> Print Schedule
          </Button>
        </div>
      </div>
    </motion.div>
  );
}