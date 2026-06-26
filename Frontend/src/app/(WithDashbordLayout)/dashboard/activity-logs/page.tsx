"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
    History, 
    Search, 
    Trash2, 
    EyeOff, 
    RefreshCw, 
    AlertCircle, 
    FileText,
    Calendar,
    User,
    CheckCircle2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllLogs, getRecentLogs, hideLog } from "@/services/logs";

interface LogItem {
    id: number | string;
    action?: string;
    message?: string;
    details?: string;
    timestamp?: string;
    created_at?: string;
    user?: string | { username: string; role?: string };
    ip_address?: string;
}

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState<LogItem[]>([]);
    const [viewMode, setViewMode] = useState<"recent" | "all">("recent");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchLogs = async (mode = viewMode) => {
        setLoading(true);
        try {
            const res = mode === "recent" ? await getRecentLogs() : await getAllLogs();
            if (res.success) {
                const list = Array.isArray(res.data) 
                    ? res.data 
                    : (res.data?.results ?? []);
                setLogs(list);
            } else {
                toast.error(res.message || "Failed to load activity logs");
            }
        } catch (error) {
            console.error("Error fetching logs:", error);
            toast.error("Failed to load activity logs");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLogs(viewMode);
    }, [viewMode]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchLogs(viewMode);
    };

    const handleHideLog = async (id: number | string) => {
        try {
            const res = await hideLog(id);
            if (res.success) {
                // Smoothly remove log from list
                setLogs(prev => prev.filter(log => log.id !== id));
                toast.success("Log hidden successfully");
            } else {
                toast.error(res.message || "Failed to hide log");
            }
        } catch (error) {
            console.error("Error hiding log:", error);
            toast.error("Failed to hide log");
        }
    };

    // Helper to get action badge color
    const getActionBadge = (action = "") => {
        const act = action.toLowerCase();
        if (act.includes("create") || act.includes("add")) {
            return <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 hover:bg-emerald-500/20 border-none capitalize">Create</Badge>;
        }
        if (act.includes("update") || act.includes("edit") || act.includes("modify")) {
            return <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 border-none capitalize">Update</Badge>;
        }
        if (act.includes("delete") || act.includes("remove")) {
            return <Badge className="bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 border-none capitalize">Delete</Badge>;
        }
        if (act.includes("cancel")) {
            return <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border-none capitalize">Cancel</Badge>;
        }
        if (act.includes("reactivate") || act.includes("activate")) {
            return <Badge className="bg-teal-500/10 text-teal-600 dark:text-teal-405 hover:bg-teal-500/20 border-none capitalize">Reactivate</Badge>;
        }
        if (act.includes("swap") || act.includes("mutual") || act.includes("proxy")) {
            return <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 border-none capitalize">Swap</Badge>;
        }
        return <Badge className="bg-zinc-500/10 text-zinc-650 dark:text-zinc-400 hover:bg-zinc-500/20 border-none capitalize">{action || "activity"}</Badge>;
    };

    const filteredLogs = logs.filter(log => {
        const msg = (log.message || log.details || "").toLowerCase();
        const action = (log.action || "").toLowerCase();
        const user = typeof log.user === "object" 
            ? log.user.username.toLowerCase() 
            : (log.user || "").toLowerCase();
        const query = searchQuery.toLowerCase();

        return msg.includes(query) || action.includes(query) || user.includes(query);
    });

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 font-lexend max-w-7xl mx-auto w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                        <History className="size-8 text-primary" />
                        Activity Logs
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Track academic adjustments, routing updates, and operations history.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={handleRefresh}
                        disabled={loading || refreshing}
                        className="cursor-pointer size-10"
                    >
                        <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
                    </Button>
                </div>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <Tabs 
                            value={viewMode} 
                            onValueChange={(val) => setViewMode(val as "recent" | "all")}
                            className="w-full md:w-auto"
                        >
                            <TabsList className="grid w-full grid-cols-2 max-w-[300px]">
                                <TabsTrigger value="recent" className="cursor-pointer text-xs font-semibold">10 Recent</TabsTrigger>
                                <TabsTrigger value="all" className="cursor-pointer text-xs font-semibold">All Logs</TabsTrigger>
                            </TabsList>
                        </Tabs>

                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search action, details, user..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 h-10 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                            <span className="animate-spin size-8 border-3 border-primary border-t-transparent rounded-full mb-3" />
                            <span className="text-sm font-medium">Fetching history logs...</span>
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <AlertCircle className="size-12 stroke-[1.5] text-zinc-300 dark:text-zinc-700 mb-3" />
                            <h3 className="text-md font-bold text-zinc-700 dark:text-zinc-300">No logs found</h3>
                            <p className="text-xs text-muted-foreground max-w-sm mt-1">
                                {searchQuery ? "Try refining your search query." : "No logs have been registered or they have all been hidden."}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <AnimatePresence initial={false}>
                                {filteredLogs.map((log, index) => {
                                    const actionText = log.action || "Activity";
                                    const messageText = log.message || log.details || "No details provided";
                                    const dateStr = log.timestamp || log.created_at;
                                    const username = typeof log.user === "object" 
                                        ? log.user.username 
                                        : (log.user || "System");

                                    return (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                                            transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
                                            className="group flex flex-col md:flex-row md:items-center justify-between p-4 border border-zinc-100 dark:border-zinc-900 bg-white/70 dark:bg-zinc-900/40 rounded-xl hover:border-zinc-200 dark:hover:border-zinc-800 transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)] gap-4"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="hidden sm:flex size-10 rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 items-center justify-center text-primary shrink-0">
                                                    <FileText className="size-4.5" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        {getActionBadge(actionText)}
                                                        <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                                                            <User className="size-3" />
                                                            {username}
                                                        </span>
                                                        {dateStr && (
                                                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                                <Calendar className="size-3" />
                                                                {formatDistanceToNow(new Date(dateStr), { addSuffix: true })}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground leading-relaxed mt-0.5 pr-2">
                                                        {messageText}
                                                    </p>
                                                    {log.ip_address && (
                                                        <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                                                            IP: {log.ip_address}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center shrink-0 self-end md:self-center">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleHideLog(log.id)}
                                                    className="text-zinc-400 hover:text-red-500 dark:text-zinc-500 hover:bg-red-500/5 hover:dark:bg-red-500/10 cursor-pointer h-9 px-3 rounded-lg md:opacity-0 md:group-hover:opacity-100 transition-all duration-200"
                                                    title="Hide this log"
                                                >
                                                    <EyeOff className="size-4 mr-1.5" />
                                                    <span className="text-xs font-semibold">Hide</span>
                                                </Button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
