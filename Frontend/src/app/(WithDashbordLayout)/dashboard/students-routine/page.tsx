"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

// Mock data for students routine
const routine = [
  { day: "Sunday",    time: "09:00 - 10:30", course: "Math 101", type: "Lecture", room: "R-201", batch: "CSE-23", teacher: "Dr. Khan" },
  { day: "Sunday",    time: "10:45 - 12:15", course: "Physics 1", type: "Lab",     room: "Lab-3", batch: "CSE-23", teacher: "Ms. Noor" },
  { day: "Monday",    time: "11:00 - 12:30", course: "Programming", type: "Lecture", room: "R-105", batch: "CSE-24", teacher: "Mr. Ali" },
  { day: "Tuesday",   time: "09:00 - 10:30", course: "Chemistry", type: "Lecture", room: "R-301", batch: "EEE-23", teacher: "Dr. Zaman" },
  { day: "Wednesday", time: "01:30 - 03:00", course: "DSA", type: "Lab", room: "Lab-2", batch: "CSE-24", teacher: "Ms. Sara" },
  { day: "Thursday",  time: "12:45 - 02:15", course: "Discrete", type: "Lecture", room: "R-202", batch: "CSE-23", teacher: "Dr. Khan" },
];

const batches = ["All", "CSE-23", "CSE-24", "EEE-23"];
const days = ["All", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export default function StudentsRoutinePage() {
  const [batch, setBatch] = useState<string>("All");
  const [day, setDay] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  const filtered = useMemo(() => {
    return routine.filter((r) =>
      (batch === "All" || r.batch === batch) &&
      (day === "All" || r.day === day) &&
      (search.trim() === "" ||
        r.course.toLowerCase().includes(search.toLowerCase()) ||
        r.teacher.toLowerCase().includes(search.toLowerCase()) ||
        r.room.toLowerCase().includes(search.toLowerCase()))
    );
  }, [batch, day, search]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-lexend">Students Routine</CardTitle>
          <CardDescription>Filter and view routine by batch/day</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Batch</span>
              <Select value={batch} onValueChange={setBatch}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Day</span>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {days.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by course/teacher/room"
              className="w-full sm:max-w-sm"
            />
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Batch</TableHead>
                  <TableHead>Teacher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                      No classes found for selected filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r, idx) => (
                    <TableRow key={idx} className={cn(r.type === "Lab" && "bg-primary/5 dark:bg-primary/10")}> 
                      <TableCell>{r.day}</TableCell>
                      <TableCell>{r.time}</TableCell>
                      <TableCell className="font-medium">{r.course}</TableCell>
                      <TableCell>{r.type}</TableCell>
                      <TableCell>{r.room}</TableCell>
                      <TableCell>{r.batch}</TableCell>
                      <TableCell>{r.teacher}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => window.print()} className="print:hidden">Print / Save PDF</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
