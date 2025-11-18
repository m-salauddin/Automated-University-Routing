"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const myRoutine = [
  { day: "Sunday",    time: "09:00 - 10:30", course: "Math 101", type: "Lecture", room: "R-201", section: "CSE-23" },
  { day: "Tuesday",   time: "11:00 - 12:30", course: "Programming", type: "Lecture", room: "R-105", section: "CSE-24" },
  { day: "Wednesday", time: "01:30 - 03:00", course: "DSA", type: "Lab", room: "Lab-2", section: "CSE-24" },
];

const days = ["All", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

export default function OwnRoutinePage() {
  const { role, username } = { role: "teacher", username: "John Doe" };
  const [day, setDay] = useState<string>("All");

  if (role !== "teacher") {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 lg:p-6">
        <Alert>
          <AlertTitle>Access restricted</AlertTitle>
          <AlertDescription>
            This section is only available for teachers. Please switch to a teacher account to view your routine.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const filtered = useMemo(() => {
    return myRoutine.filter((r) => day === "All" || r.day === day);
  }, [day]);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 lg:p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="font-lexend">My Routine</CardTitle>
              <CardDescription>Teacher: {username || "Unknown"}</CardDescription>
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
              <Button onClick={() => window.print()} className="print:hidden">Print</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Day</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Section</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                      No classes scheduled.
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
                      <TableCell>{r.section}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
