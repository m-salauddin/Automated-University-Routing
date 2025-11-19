"use client";

import {  useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";

export default function ProfilePage() {
  const { username, role } = useAuth();

  const [fullName, setFullName] = useState(username || "");
  const [email, setEmail] = useState(username ? `${username.toLowerCase()}@university.edu` : "");
  const [department, setDepartment] = useState("CSE");

  const onSave = () => {
    toast.success("Profile saved", {
      description: `Role: ${role?.toUpperCase()} | Dept: ${department}`,
    });
  };


  return (
    <div className="w-full p-4 lg:p-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-lexend">Profile</CardTitle>
          <CardDescription>Manage your account information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username || ""} disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="role">Role</Label>
              <Input id="role" value={role || "student"} disabled />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSE">CSE</SelectItem>
                  <SelectItem value="EEE">EEE</SelectItem>
                  <SelectItem value="BBA">BBA</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={onSave} className="cursor-pointer">Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
