"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Inbox, Loader2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNotifications, getUnreadCount, markNotificationRead } from "@/services/notifications";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { respondSwap } from "@/services/routine";
import { cn } from "@/lib/utils";

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
    const { role } = useSelector((state: RootState) => state.auth);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [submittingAction, setSubmittingAction] = useState<Record<string, boolean>>({});

    /** True only for PROXY / substitution notifications (Teacher A asks Teacher B to cover). */
    const isProxyRequest = (notification: Notification): boolean => {
        const text = `${notification.title || ""} ${notification.verb || ""} ${notification.message || ""} ${notification.description || ""}`.toLowerCase();
        return (text.includes("proxy") || text.includes("substitut")) && !text.includes("mutual");
    };

    /** True only for genuine MUTUAL class-swap notifications. */
    const isMutualSwapRequest = (notification: Notification): boolean => {
        const text = `${notification.title || ""} ${notification.verb || ""} ${notification.message || ""} ${notification.description || ""}`.toLowerCase();
        return text.includes("mutual") || (text.includes("swap") && !text.includes("proxy") && !text.includes("substitut"));
    };

    const getSwapRequestId = (notification: Notification): number | null => {
        const n = notification as any;
        if (n.action_object_id) return Number(n.action_object_id);
        if (n.target_id) return Number(n.target_id);
        if (n.data && typeof n.data === "object") {
            if (n.data.request_id) return Number(n.data.request_id);
            if (n.data.id) return Number(n.data.id);
        }
        const text = `${notification.title || ""} ${notification.verb || ""} ${notification.message || ""} ${notification.description || ""}`;
        const match = text.match(/(?:request|swap|id)[:#\s]+(\d+)/i) || text.match(/id\s+(\d+)/i) || text.match(/#(\d+)/);
        if (match && match[1]) return Number(match[1]);
        return null;
    };

    const handleRespondToSwap = async (
        requestId: number,
        action: "ACCEPT" | "REJECT",
        notificationId: number | string
    ) => {
        const actionKey = `${notificationId}-${action}`;
        setSubmittingAction(prev => ({ ...prev, [actionKey]: true }));
        const toastId = toast.loading(`${action === "ACCEPT" ? "Accepting" : "Rejecting"} request...`);
        try {
            const res = await respondSwap({ request_id: requestId, action });
            if (res.success) {
                toast.success(
                    `Request ${action === "ACCEPT" ? "accepted" : "rejected"} successfully!`,
                    { id: toastId }
                );
                await markNotificationRead(notificationId);
                fetchNotificationData();
            } else {
                toast.error(res.message || `Failed to respond to swap request`, { id: toastId });
            }
        } catch (err: any) {
            toast.error(err.message || "An unexpected error occurred", { id: toastId });
        } finally {
            setSubmittingAction(prev => ({ ...prev, [actionKey]: false }));
        }
    };

    const fetchNotificationData = async () => {
        try {
            const countRes = await getUnreadCount();
            if (countRes.success) {
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
        const interval = setInterval(fetchNotificationData, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id: number | string, isAlreadyRead: boolean) => {
        if (isAlreadyRead) return;
        try {
            const res = await markNotificationRead(id);
            if (res.success) {
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
                if (res.success) successCount++;
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
        <>
            {/* Bell trigger button */}
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative cursor-pointer"
                aria-label="Notifications"
                onClick={() => setIsOpen(true)}
            >
                <Bell className="h-[1.1rem] w-[1.1rem]" />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 flex h-2 w-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-black" />
                )}
            </Button>

            {/* Notification Drawer — slides in from the right */}
            <Drawer
                direction="right"
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <DrawerContent className="font-lexend flex flex-col h-full w-full sm:max-w-sm border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl">
                    {/* Header */}
                    <DrawerHeader className="flex-shrink-0 border-b border-zinc-100 dark:border-zinc-800 px-4 py-3 bg-zinc-50/60 dark:bg-zinc-900/40">
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2.5">
                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
                                    <Bell className="w-4 h-4 text-amber-500" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <DrawerTitle className="text-sm font-bold tracking-wide">
                                        Notifications
                                    </DrawerTitle>
                                    {unreadCount > 0 && (
                                        <Badge
                                            variant="secondary"
                                            className="rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                        >
                                            {unreadCount} unread
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
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
                                <DrawerClose asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                                    >
                                        <X className="size-4" />
                                    </Button>
                                </DrawerClose>
                            </div>
                        </div>
                    </DrawerHeader>

                    {/* Notification list */}
                    <div className="flex-1 overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full py-16 text-zinc-400">
                                <span className="animate-spin size-6 border-2 border-amber-500 border-t-transparent rounded-full mb-3" />
                                <span className="text-xs font-medium">Loading notifications...</span>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full py-16 text-zinc-400 gap-2">
                                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 mb-1">
                                    <Inbox className="size-7 stroke-1 text-zinc-400 dark:text-zinc-600" />
                                </div>
                                <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">All caught up!</span>
                                <span className="text-xs text-zinc-400 dark:text-zinc-600">No new notifications.</span>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const isUnread = notification.unread !== false && notification.is_read !== true;
                                const title = notification.title || notification.verb || "Notification";
                                const message = notification.message || notification.description || "";
                                const dateStr = notification.created_at || notification.timestamp;
                                const swapId = getSwapRequestId(notification);
                                const isProxy = isProxyRequest(notification);
                                const isMutual = isMutualSwapRequest(notification);
                                // Show Accept/Reject for BOTH proxy and mutual — the target teacher must respond to either
                                const showActions = isUnread && role === "teacher" && (isProxy || isMutual) && swapId !== null;
                                const requestTypeLabel = isProxy ? "Proxy" : isMutual ? "Mutual Swap" : null;

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleMarkAsRead(notification.id, !isUnread)}
                                        className={cn(
                                            "flex flex-col gap-2 px-4 py-4 cursor-pointer transition-colors",
                                            "hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
                                            isUnread
                                                ? "bg-amber-500/[0.03] dark:bg-amber-500/[0.02] border-l-2 border-l-amber-500"
                                                : "border-l-2 border-l-transparent"
                                        )}
                                    >
                                        {/* Title row */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2 min-w-0">
                                                {isUnread ? (
                                                    <span className="size-2 rounded-full bg-amber-500 shrink-0 mt-0.5" />
                                                ) : (
                                                    <span className="size-2 rounded-full bg-transparent shrink-0 mt-0.5" />
                                                )}
                                                <span className={cn(
                                                    "text-xs font-bold leading-snug truncate",
                                                    isUnread ? "text-foreground" : "text-muted-foreground"
                                                )}>
                                                    {title}
                                                </span>
                                            </div>
                                            {dateStr && (
                                                <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5 whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(dateStr), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>

                                        {/* Message */}
                                        {message && (
                                            <p className="text-xs text-muted-foreground leading-relaxed pl-4 line-clamp-3">
                                                {message}
                                            </p>
                                        )}

                                        {/* Mark as read hint — only when no action buttons are shown */}
                                        {isUnread && !showActions && (
                                            <div className="flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 pl-4">
                                                <Check className="size-3 mr-1" />
                                                Click to mark as read
                                            </div>
                                        )}

                                        {/* Accept / Reject — shown for both Proxy AND Mutual Swap requests */}
                                        {showActions && (
                                            <div
                                                className="flex flex-col gap-2 mt-1 pl-4"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Request type badge */}
                                                {requestTypeLabel && (
                                                    <span className={cn(
                                                        "inline-flex self-start items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ring-1",
                                                        isProxy
                                                            ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-500/20"
                                                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20"
                                                    )}>
                                                        {requestTypeLabel}
                                                    </span>
                                                )}
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (swapId !== null) handleRespondToSwap(swapId, "ACCEPT", notification.id);
                                                        }}
                                                        disabled={submittingAction[`${notification.id}-ACCEPT`] || submittingAction[`${notification.id}-REJECT`]}
                                                        className="h-7 px-3 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-md gap-1"
                                                    >
                                                        {submittingAction[`${notification.id}-ACCEPT`]
                                                            ? <Loader2 className="size-3 animate-spin" />
                                                            : <Check className="size-3" />}
                                                        Accept
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (swapId !== null) handleRespondToSwap(swapId, "REJECT", notification.id);
                                                        }}
                                                        disabled={submittingAction[`${notification.id}-ACCEPT`] || submittingAction[`${notification.id}-REJECT`]}
                                                        className="h-7 px-3 text-xs font-semibold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-950/20 dark:text-red-400 rounded-md gap-1"
                                                    >
                                                        {submittingAction[`${notification.id}-REJECT`]
                                                            ? <Loader2 className="size-3 animate-spin" />
                                                            : <X className="size-3" />}
                                                        Reject
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}
