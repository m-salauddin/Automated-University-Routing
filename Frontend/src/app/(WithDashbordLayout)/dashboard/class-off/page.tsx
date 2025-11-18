"use client";

import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const slots = [
  "08:30 - 10:00",
  "10:00 - 11:30",
  "11:30 - 01:00",
  "02:00 - 03:30",
  "03:30 - 05:00",
];

export default function ClassOffPage() {
  const { role, username } = { role: "teacher", username: "John Doe" };
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState<string>("");
  const [course, setCourse] = useState("");
  const [section, setSection] = useState("");
  const [reason, setReason] = useState("");

  if (role !== "teacher") {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 lg:p-6">
        <Alert>
          <AlertTitle>Access restricted</AlertTitle>
          <AlertDescription>
            Only teachers can request a class off.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const submit = () => {
    if (!date || !slot || !course || !section || !reason) {
      toast.error("Please fill in all fields");
      return;
    }
    // Replace with POST to your API
    toast.success("Class off request submitted", {
      description: `${date} • ${slot} • ${course} (${section}) by ${username}`,
    });

    setDate("");
    setSlot("");
    setCourse("");
    setSection("");
    setReason("");
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-lexend">Request Class Off</CardTitle>
          <CardDescription>
            Submit a class-off request with details for admin approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Time slot</Label>
              <Select value={slot} onValueChange={setSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a slot" />
                </SelectTrigger>
                <SelectContent>
                  {slots.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Course</Label>
              <Input value={course} onChange={(e) => setCourse(e.target.value)} placeholder="e.g., Programming" />
            </div>
            <div className="space-y-1.5">
              <Label>Section / Batch</Label>
              <Input value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g., CSE-24" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Reason</Label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Provide a brief reason..."
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={submit} className="cursor-pointer">Submit request</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
