"use client";

import { useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const previewRows = [
  { day: "Sunday", time: "09:00 - 10:30", course: "Math 101", room: "R-201" },
  { day: "Sunday", time: "10:45 - 12:15", course: "Physics 1 (Lab)", room: "Lab-3" },
  { day: "Monday", time: "11:00 - 12:30", course: "Programming", room: "R-105" },
];

export default function ExportPdfPage() {
  const ref = useRef<HTMLDivElement | null>(null);

  const onPrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 lg:p-6">
      <Card>
        <CardHeader className="print:hidden">
          <div className="flex items-center justify-between gap-2">
            <div>
              <CardTitle className="font-lexend">Routine Export</CardTitle>
              <CardDescription>Preview your routine and export as PDF (uses browser print)</CardDescription>
            </div>
            <Button className="cursor-pointer" onClick={onPrint}>Export PDF</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div ref={ref} className="print:bg-white print:text-black">
            <div className="mb-4 text-center print:mb-2">
              <h2 className="text-lg font-semibold">University Routine</h2>
              <p className="text-muted-foreground text-sm">Generated preview</p>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Room</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>{r.day}</TableCell>
                      <TableCell>{r.time}</TableCell>
                      <TableCell className="font-medium">{r.course}</TableCell>
                      <TableCell>{r.room}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="mt-6 text-xs text-muted-foreground print:hidden">
              Tip: Use the browser print dialog to choose "Save as PDF" and set margins to "Default".
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
