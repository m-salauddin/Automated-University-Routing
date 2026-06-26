"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, Check, CheckCheck, Inbox } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNotifications, getUnreadCount, markNotificationRead } from "@/services/notifications";

interface Notification {
    id: number | string;
    title?: string;
    message?: string;
    verb?: string;
    description?: string;
    unread?: boolean;
    is_read?: boolean;
    created_at?: string;
    timestamp?: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    const fetchNotificationData = async () => {
        try {
            const countRes = await getUnreadCount();
            if (countRes.success) {
                // Handle different count structures
                const count = typeof countRes.data === "object"
                    ? (countRes.data.unread_count ?? countRes.data.count ?? 0)
                    : (countRes.data ?? 0);
                setUnreadCount(count);
            }

            const listRes = await getNotifications();
            if (listRes.success) {
                const list = Array.isArray(listRes.data)
                    ? listRes.data
                    : (listRes.data?.results ?? []);
                setNotifications(list);
            }
        } catch (error) {
            console.error("Failed to load notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotificationData();
        // Poll every 30 seconds to keep updated
        const interval = setInterval(fetchNotificationData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: number | string, isAlreadyRead: boolean) => {
        if (isAlreadyRead) return;

        try {
            const res = await markNotificationRead(id);
            if (res.success) {
                // Update local states
                setNotifications(prev =>
                    prev.map(n => (n.id === id ? { ...n, unread: false, is_read: true } : n))
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
                toast.success("Notification marked as read");
            } else {
                toast.error(res.message || "Failed to mark notification as read");
            }
        } catch (error) {
            console.error("Error marking notification read:", error);
            toast.error("Failed to mark notification as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        const unreadList = notifications.filter(n => n.unread !== false && n.is_read !== true);
        if (unreadList.length === 0) return;

        let successCount = 0;
        for (const notif of unreadList) {
            try {
                const res = await markNotificationRead(notif.id);
                if (res.success) {
                    successCount++;
                }
            } catch (err) {
                console.error("Error marking all read:", err);
            }
        }

        if (successCount > 0) {
            toast.success(`Marked ${successCount} notifications as read`);
            fetchNotificationData();
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 relative cursor-pointer"
                    aria-label="Notifications"
                >
                    <Bell className="h-[1.1rem] w-[1.1rem]" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-black" />
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 sm:w-96 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-2xl p-0 font-lexend overflow-hidden z-50"
            >
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-850 px-4 py-3 bg-zinc-50/50 dark:bg-zinc-900/30">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-sm tracking-wide">Notifications</span>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                {unreadCount} unread
                            </Badge>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            className="h-7 text-xs font-semibold text-primary hover:text-primary/80 px-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-900"
                        >
                            <CheckCheck className="size-3.5 mr-1" />
                            Mark all read
                        </Button>
                    )}
                </div>

                <div className="max-h-[350px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                            <span className="animate-spin size-5 border-2 border-primary border-t-transparent rounded-full mb-2" />
                            <span className="text-xs">Loading notifications...</span>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-zinc-400">
                            <Inbox className="size-8 stroke-1 mb-2 text-zinc-300 dark:text-zinc-700" />
                            <span className="text-xs font-medium">All caught up!</span>
                            <span className="text-[10px] text-zinc-500 mt-0.5">No new notifications.</span>
                        </div>
                    ) : (
                        notifications.map((notification) => {
                            const isUnread = notification.unread !== false && notification.is_read !== true;
                            const title = notification.title || notification.verb || "Notification";
                            const message = notification.message || notification.description || "";
                            const dateStr = notification.created_at || notification.timestamp;

                            return (
                                <DropdownMenuItem
                                    key={notification.id}
                                    onClick={() => handleMarkAsRead(notification.id, !isUnread)}
                                    className={`flex flex-col items-start p-4 cursor-pointer gap-1.5 focus:bg-zinc-50 dark:focus:bg-zinc-900/50 transition-colors ${
                                        isUnread ? "bg-amber-500/[0.02] dark:bg-amber-500/[0.01]" : ""
                                    }`}
                                >
                                    <div className="flex w-full items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            {isUnread && (
                                                <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                                            )}
                                            <span className={`text-xs font-bold ${isUnread ? "text-foreground" : "text-muted-foreground"}`}>
                                                {title}
                                            </span>
                                        </div>
                                        {dateStr && (
                                            <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                                                {formatDistanceToNow(new Date(dateStr), { addSuffix: true })}
                                            </span>
                                        )}
                                    </div>
                                    {message && (
                                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                            {message}
                                        </p>
                                    )}
                                    {isUnread && (
                                        <div className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 mt-1">
                                            <Check className="size-3 mr-1" />
                                            Click to mark as read
                                        </div>
                                    )}
                                </DropdownMenuItem>
                            );
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
