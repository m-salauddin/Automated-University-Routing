"use client";

import { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { 
  Megaphone, 
  Search, 
  Plus, 
  Users, 
  Building2, 
  Clock, 
  Check, 
  Info, 
  Loader2, 
  X
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CustomSelect } from "@/components/ui/custom-select";
import { createNotice } from "@/services/notices";

interface Notice {
  id: number;
  notice_type: string;
  title: string;
  message: string;
  target_departments?: number[];
  target_batches?: number[];
  created_at?: string;
  created_by_name?: string;
  author_name?: string;
}

interface Department {
  id: number;
  name: string;
  code?: string;
}

interface Batch {
  id: number;
  name: string;
  department_id: number;
}

interface NoticesPageClientProps {
  initialNotices: any;
  departments: Department[];
  batches: Batch[];
  deptsRes?: any;
}

const pageVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const pageItemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 20 },
  },
};

export default function NoticesPageClient({ 
  initialNotices, 
  departments, 
  batches,
  deptsRes
}: NoticesPageClientProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { role } = useSelector((state: RootState) => state.auth);
  const canCreate = role?.toUpperCase() === "ADMIN" || role?.toUpperCase() === "TEACHER";

  // Parse notices list
  const noticesListRaw = Array.isArray(initialNotices) 
    ? initialNotices 
    : (initialNotices?.results || initialNotices?.data || []);
  const [notices, setNotices] = useState<Notice[]>(noticesListRaw);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");

  // Create Notice form state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [noticeType, setNoticeType] = useState<string>("GLOBAL");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedDepts, setSelectedDepts] = useState<number[]>([]);
  const [selectedBatches, setSelectedBatches] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Department mapping for easy name lookups
  const deptMap = useMemo(() => {
    const map = new Map<number, Department>();
    departments.forEach(d => map.set(d.id, d));
    return map;
  }, [departments]);

  // Unique batches list for select form (since page-seeded batches are duplicated per dept)
  const uniqueBatchesList = useMemo(() => {
    const seen = new Set<string>();
    const list: { id: number; name: string }[] = [];
    batches.forEach(b => {
      const key = `${b.id}-${b.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        list.push({ id: b.id, name: b.name });
      }
    });
    return list.sort((a, b) => b.id - a.id);
  }, [batches]);

  // Filtered notices computed state
  const filteredNotices = useMemo(() => {
    return notices.filter((notice) => {
      const typeMatches = selectedType === "ALL" || notice.notice_type?.toUpperCase() === selectedType;
      const textMatches = 
        notice.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.message?.toLowerCase().includes(searchQuery.toLowerCase());
      return typeMatches && textMatches;
    }).sort((a, b) => b.id - a.id);
  }, [notices, searchQuery, selectedType]);

  const handleToggleDept = (id: number) => {
    setSelectedDepts(prev => 
      prev.includes(id) ? prev.filter(dId => dId !== id) : [...prev, id]
    );
  };

  const handleSelectAllDepts = () => {
    if (selectedDepts.length === departments.length) {
      setSelectedDepts([]);
    } else {
      setSelectedDepts(departments.map(d => d.id));
    }
  };

  const handleToggleBatch = (id: number) => {
    setSelectedBatches(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleSelectAllBatches = () => {
    if (selectedBatches.length === uniqueBatchesList.length) {
      setSelectedBatches([]);
    } else {
      setSelectedBatches(uniqueBatchesList.map(b => b.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Creating notice and notifying targets...");

    try {
      const res = await createNotice({
        notice_type: noticeType,
        title: title.trim(),
        message: message.trim(),
        target_departments: noticeType === "TARGETED" ? selectedDepts : [],
        target_batches: noticeType === "TARGETED" ? selectedBatches : []
      });

      if (res.success && res.data) {
        toast.success("Notice created successfully!", { id: toastId });
        setNotices(prev => [res.data, ...prev]);
        
        // Reset form
        setTitle("");
        setMessage("");
        setSelectedDepts([]);
        setSelectedBatches([]);
        setIsCreateOpen(false);
      } else {
        toast.error(res.message || "Failed to create notice.", { id: toastId });
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="visible"
      className="w-full font-lexend min-w-0 max-w-full mx-auto p-4 md:p-6 space-y-6 overflow-x-hidden print:hidden"
    >
      {/* Header section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden mb-6">
        <div className="space-y-2 w-full lg:w-auto">
          <motion.div variants={pageItemVariants}>
            <Badge
              variant="outline"
              className="text-muted-foreground border-muted-foreground/30 uppercase tracking-widest font-medium rounded-sm"
            >
              Academic Panel
            </Badge>
          </motion.div>
          <motion.h1
            variants={pageItemVariants}
            className="text-3xl md:text-4xl font-bold tracking-tight text-foreground"
          >
            Academic Notices
          </motion.h1>
          <motion.p
            variants={pageItemVariants}
            className="text-muted-foreground"
          >
            View important announcements, general alerts, and schedule changes.
          </motion.p>
        </div>

        <motion.div
          variants={pageItemVariants}
          className="flex flex-wrap gap-2 w-full lg:w-auto"
        >
          <Badge
            variant="secondary"
            className="h-10 px-4 flex items-center justify-center gap-2 text-sm font-normal bg-background border whitespace-nowrap"
          >
            <Megaphone className="h-4 w-4 text-muted-foreground" />
            <span>{filteredNotices.length} Notice{filteredNotices.length !== 1 ? "s" : ""}</span>
          </Badge>

          {canCreate && (
            <Button 
              onClick={() => setIsCreateOpen(true)}
              className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10 shadow-sm active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" />
              Post New Notice
            </Button>
          )}
        </motion.div>
      </div>

      {/* Main card including filters and notice items */}
      <motion.div
        variants={pageItemVariants}
        className="w-full min-w-0"
        style={{ willChange: "transform, opacity" }}
      >
        <Card className="w-full overflow-hidden border shadow-sm print:border-none print:shadow-none bg-card text-card-foreground">
          {/* Filters Bar */}
          <CardHeader className="p-4 bg-muted/30 border-b print:hidden">
            <div className="flex flex-wrap items-end gap-4">
              {/* Search */}
              <div className="flex-1 min-w-[200px] space-y-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Search
                </span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notices by title or message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background h-10 border-input"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Notice Type Filter */}
              <div className="flex-1 min-w-[200px] space-y-2">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Notice Type
                </span>
                <CustomSelect
                  value={selectedType}
                  onChange={(val) => setSelectedType(val)}
                  options={[
                    { value: "ALL", label: "All Types" },
                    { value: "GLOBAL", label: "Global Announcements" },
                    { value: "TARGETED", label: "Targeted Notices" },
                  ]}
                  placeholder="Select Notice Type"
                />
              </div>
            </div>
          </CardHeader>

          {/* Notices Grid/List */}
          <CardContent className="p-6">
            {filteredNotices.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 border border-dashed border-border/80 rounded-2xl bg-white/40 dark:bg-zinc-900/10 min-h-[300px]">
                <div className="size-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                  <Megaphone className="size-8 text-zinc-400 dark:text-zinc-650 animate-pulse" />
                </div>
                <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-350">No notices found</h3>
                <p className="text-sm text-muted-foreground text-center mt-1 max-w-sm">
                  {searchQuery || selectedType !== "ALL" 
                    ? "Try adjusting your search criteria or resetting filters to find what you are looking for."
                    : "No notices have been published yet. Check back later for academic updates."}
                </p>
                {(searchQuery || selectedType !== "ALL") && (
                  <Button 
                    variant="outline" 
                    onClick={() => { setSearchQuery(""); setSelectedType("ALL"); }}
                    className="mt-4 border-border/60 hover:bg-zinc-50"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <AnimatePresence mode="popLayout">
                  {filteredNotices.map((notice, idx) => {
                    const formattedDate = notice.created_at 
                      ? formatDistanceToNow(new Date(notice.created_at), { addSuffix: true })
                      : "recently";
                    
                    const isGlobal = notice.notice_type?.toUpperCase() === "GLOBAL";

                    // Map targets
                    const deptCodes = notice.target_departments?.map(id => deptMap.get(id)?.code || deptMap.get(id)?.name || id) || [];
                    const batchNames = notice.target_batches?.map(id => {
                      const b = uniqueBatchesList.find(item => item.id === id);
                      return b ? b.name : `${id}th Batch`;
                    }) || [];

                    return (
                      <motion.div
                        key={notice.id}
                        layout
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.25, delay: Math.min(idx * 0.05, 0.3) }}
                        className="bg-background border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          {/* Header: Type and Time */}
                          <div className="flex items-center justify-between gap-2">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isGlobal 
                                ? "bg-emerald-500/10 text-emerald-655 dark:text-emerald-400"
                                : "bg-sky-500/10 text-sky-655 dark:text-sky-400"
                            }`}>
                              <span className={`size-1.5 rounded-full ${isGlobal ? "bg-emerald-500" : "bg-sky-500"}`} />
                              {notice.notice_type} Notice
                            </span>

                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Clock className="size-3.5" />
                              {formattedDate}
                            </div>
                          </div>

                          {/* Notice Title */}
                          <h3 className="text-lg font-bold text-foreground leading-snug">
                            {notice.title}
                          </h3>

                          {/* Message Body */}
                          <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed pb-2">
                            {notice.message}
                          </p>
                        </div>

                        {/* Targets & Author info at bottom */}
                        <div className="mt-4 pt-3.5 border-t border-border flex flex-col gap-2.5">
                          {/* Targets */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                            {deptCodes.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <Building2 className="size-3.5 text-muted-foreground" />
                                <span>Dept: <strong className="text-foreground">{deptCodes.join(", ")}</strong></span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Building2 className="size-3.5 text-muted-foreground" />
                                <span>All Departments</span>
                              </div>
                            )}

                            {batchNames.length > 0 ? (
                              <div className="flex items-center gap-1">
                                <Users className="size-3.5 text-muted-foreground" />
                                <span>Batches: <strong className="text-foreground">{batchNames.join(", ")}</strong></span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <Users className="size-3.5 text-muted-foreground" />
                                <span>All Batches</span>
                              </div>
                            )}
                          </div>

                          {/* Author */}
                          {notice.author_name || notice.created_by_name ? (
                            <div className="text-[11px] text-muted-foreground self-end italic">
                              Published by: {notice.author_name || notice.created_by_name}
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Notice Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-xl bg-background border border-border p-0 overflow-hidden shadow-2xl rounded-2xl font-lexend">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="p-6 pb-4 bg-muted/20 border-b">
              <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
                <Megaphone className="size-5 text-primary stroke-[2.5px]" />
                Post New Announcement
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Fill in the details to publish a new notice. Target users will automatically receive push notifications.
              </DialogDescription>
            </DialogHeader>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Notice Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Notice Type <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                  {["GLOBAL", "TARGETED"].map((type) => {
                    const active = noticeType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => {
                          setNoticeType(type);
                          if (type === "GLOBAL") {
                            setSelectedDepts([]);
                            setSelectedBatches([]);
                          }
                        }}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          active 
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-transparent border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        }`}
                      >
                        {active && <Check className="size-3.5 stroke-[3px]" />}
                        {type} Notice
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Notice Title <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Enter a descriptive, clear title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={255}
                  required
                  className="bg-background border-input focus-visible:ring-primary h-10"
                />
                <div className="text-[10px] text-right text-muted-foreground">
                  {title.length}/255 characters
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Notice Message <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="Type the notice message detail here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                  className="bg-background border-input focus-visible:ring-primary resize-y min-h-[100px]"
                />
              </div>

              {/* Targets Division */}
              {noticeType === "TARGETED" && (
                <div className="border-t border-border pt-3.5 space-y-3.5">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                    <Info className="size-3.5 text-muted-foreground" />
                    <span>Audience Targeting (Optional)</span>
                  </div>

                  {/* Target Departments */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Target Departments</span>
                      <button
                        type="button"
                        onClick={handleSelectAllDepts}
                        className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider"
                      >
                        {selectedDepts.length === departments.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1.5 bg-muted/20 rounded-lg border border-border">
                      {departments.length === 0 && (
                        <p className="text-xs text-red-500 font-mono p-1">
                          No departments: {JSON.stringify(deptsRes || { message: "No data" })}
                        </p>
                      )}
                      {departments.map((dept) => {
                        const selected = selectedDepts.includes(dept.id);
                        return (
                          <button
                            key={dept.id}
                            type="button"
                            onClick={() => handleToggleDept(dept.id)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                              selected 
                                ? "bg-primary border-primary text-primary-foreground font-semibold"
                                : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            {dept.code || dept.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target Batches */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-foreground">Target Batches</span>
                      <button
                        type="button"
                        onClick={handleSelectAllBatches}
                        className="text-[10px] text-primary hover:underline font-bold uppercase tracking-wider"
                      >
                        {selectedBatches.length === uniqueBatchesList.length ? "Deselect All" : "Select All"}
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto p-1.5 bg-muted/20 rounded-lg border border-border">
                      {uniqueBatchesList.map((batch) => {
                        const selected = selectedBatches.includes(batch.id);
                        return (
                          <button
                            key={batch.id}
                            type="button"
                            onClick={() => handleToggleBatch(batch.id)}
                            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                              selected 
                                ? "bg-primary border-primary text-primary-foreground font-semibold"
                                : "bg-background border-input text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            }`}
                          >
                            {batch.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="p-4 bg-muted/20 border-t flex gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                disabled={isSubmitting}
                className="border border-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Publishing...
                  </>
                ) : (
                  "Publish Notice"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
