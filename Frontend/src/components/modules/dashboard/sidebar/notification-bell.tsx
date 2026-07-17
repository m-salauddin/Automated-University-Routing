"use client";

import { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Inbox, Loader2, X, ArrowLeftRight, ArrowRight, UserCheck, Clock, Megaphone } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { getNotifications, getUnreadCount, markNotificationRead } from "@/services/notifications";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { respondSwap, getSwapRequests } from "@/services/routine";
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
    const router = useRouter();
    const { role, username } = useSelector((state: RootState) => state.auth);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [submittingAction, setSubmittingAction] = useState<Record<string, boolean>>({});
    const [swapRequests, setSwapRequests] = useState<any[]>([]);
    const [respondedStatus, setRespondedStatus] = useState<Record<string, "ACCEPTED" | "APPROVED" | "REJECTED" | "PENDING">>({});
    // per-notification manual request ID overrides (for when auto-detection fails)
    const [swapIdInputs, setSwapIdInputs] = useState<Record<string, string>>({});

    /** True only for PROXY / substitution notifications */
    const isProxyRequest = (notification: Notification): boolean => {
        const text = `${notification.title || ""} ${notification.verb || ""} ${notification.message || ""} ${notification.description || ""}`.toLowerCase();
        return (text.includes("proxy") || text.includes("substitut")) && !text.includes("mutual");
    };

    /** True only for MUTUAL class-swap notifications */
    const isMutualSwapRequest = (notification: Notification): boolean => {
        const text = `${notification.title || ""} ${notification.verb || ""} ${notification.message || ""} ${notification.description || ""}`.toLowerCase();
        return text.includes("mutual") || (text.includes("swap") && !text.includes("proxy") && !text.includes("substitut"));
    };

    const matchSwapRequest = (notification: Notification, requests: any[]): number | null => {
        if (!requests || requests.length === 0) {
            return null;
        }

        const text = `${notification.title || ""} ${notification.verb || ""} ${notification.message || ""} ${notification.description || ""}`.toLowerCase();
        const dateMatch = text.match(/\b\d{4}-\d{2}-\d{2}\b/);
        const date = dateMatch ? dateMatch[0] : null;
        const isProxy = text.includes("proxy") || text.includes("substitut");
        const swapType = isProxy ? "PROXY" : "MUTUAL";

        // Pass 1: exact type + date + username match
        let found = requests.find((r: any) => {
            if (r.swap_type !== swapType) return false;
            if (date && r.swap_date !== date) return false;
            const requesterUsername = (r.requester_name || r.requester_username || r.requester?.username || "").toLowerCase();
            if (requesterUsername && text.includes(requesterUsername)) return true;
            const targetUsername = (r.target_teacher_name || r.target_teacher_username || r.target_teacher?.username || "").toLowerCase();
            if (targetUsername && text.includes(targetUsername)) return true;
            return false;
        });
        if (found) return found.id;

        // Pass 2: type + date match (ignore username)
        found = requests.find((r: any) => {
            if (r.swap_type !== swapType) return false;
            if (date && r.swap_date !== date) return false;
            return true;
        });
        if (found) return found.id;

        // Pass 3: type match only, prefer PENDING status
        found = requests.find((r: any) =>
            r.swap_type === swapType && (r.status === "PENDING" || !r.status)
        );
        if (found) return found.id;

        // Pass 4: just type match — last resort
        found = requests.find((r: any) => r.swap_type === swapType);
        if (found) return found.id;

        // Pass 5: absolutely any pending request
        found = requests.find((r: any) => r.status === "PENDING" || !r.status);
        if (found) return found.id;

        return null;
    };

    const getSwapRequestId = (notification: Notification): number | null => {
        const n = notification as any;

        if (n.action_object_id) return Number(n.action_object_id);
        if (n.action_object_object_id) return Number(n.action_object_object_id);
        if (n.target_id) return Number(n.target_id);
        if (n.target_object_id) return Number(n.target_object_id);
        if (n.action_object && typeof n.action_object === "object" && n.action_object.id) return Number(n.action_object.id);
        if (n.target && typeof n.target === "object" && n.target.id) return Number(n.target.id);
        if (n.data && typeof n.data === "object") {
            if (n.data.request_id) return Number(n.data.request_id);
            if (n.data.id) return Number(n.data.id);
            if (n.data.action_object_id) return Number(n.data.action_object_id);
        }
        if (n.action_url) {
            const urlMatch = n.action_url.match(/\/(\d+)\/?$/) || n.action_url.match(/(\d+)/);
            if (urlMatch && urlMatch[1]) return Number(urlMatch[1]);
        }
        const text = `${notification.title || ""} ${notification.verb || ""} ${notification.message || ""} ${notification.description || ""}`;
        const match = text.match(/(?:request|swap|id)[:#\s]+(\d+)/i) || text.match(/#(\d+)/);
        if (match && match[1]) return Number(match[1]);

        return matchSwapRequest(notification, swapRequests);
    };

    const handleRespondToSwap = async (
        notificationId: number | string,
        action: "ACCEPT" | "REJECT",
        notification: Notification,
        autoSwapId: number | null
    ) => {
        // Priority: manual input > auto-detected > fresh fetch > fail
        const manualInput = swapIdInputs[notificationId]?.trim();
        let resolvedId: number | null = manualInput ? Number(manualInput) : autoSwapId;

        // Step 2: try matching from loaded swap requests
        if (!resolvedId) {
            resolvedId = matchSwapRequest(notification, swapRequests);
        }

        // Step 3: re-fetch fresh and try again
        if (!resolvedId) {
            const freshRes = await getSwapRequests();
            if (freshRes.success) {
                const freshList = Array.isArray(freshRes.data)
                    ? freshRes.data
                    : (freshRes.data?.results ?? []);
                setSwapRequests(freshList);
                resolvedId = matchSwapRequest(notification, freshList);
            }
        }

        if (!resolvedId || isNaN(resolvedId)) {
            toast.error("Please enter the Request ID in the field and try again.");
            return;
        }
        const actionKey = `${notificationId}-${action}`;
        setSubmittingAction(prev => ({ ...prev, [actionKey]: true }));
        const toastId = toast.loading(`${action === "ACCEPT" ? "Accepting" : "Rejecting"} request...`);
        try {
            const res = await respondSwap({ request_id: resolvedId, action });
            if (res.success) {
                toast.success(`Request ${action === "ACCEPT" ? "accepted" : "rejected"} successfully!`, { id: toastId });
                const statusVal: "ACCEPTED" | "APPROVED" | "REJECTED" | "PENDING" = action === "ACCEPT" ? "ACCEPTED" : "REJECTED";
                setRespondedStatus(prev => ({ ...prev, [notificationId]: statusVal }));
                await markNotificationRead(notificationId);
                fetchNotificationData();
            } else {
                toast.error(res.message || "Failed to respond to swap request", { id: toastId });
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
                const list = Array.isArray(listRes.data) ? listRes.data : (listRes.data?.results ?? []);
                setNotifications(list);
            }
            const swapRes = await getSwapRequests();
            if (swapRes.success) {
                const list = Array.isArray(swapRes.data) ? swapRes.data : (swapRes.data?.results ?? []);
                setSwapRequests(list);
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
                setNotifications(prev => prev.map(n => (n.id === id ? { ...n, unread: false, is_read: true } : n)));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } else {
                toast.error(res.message || "Failed to mark notification as read");
            }
        } catch (error) {
            console.error("Error marking notification read:", error);
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
            {/* Bell trigger */}
            <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 relative cursor-pointer"
                aria-label="Notifications"
                onClick={() => setIsOpen(true)}
            >
                <Bell className="h-[1.1rem] w-[1.1rem]" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                    </span>
                )}
            </Button>

            <Drawer direction="right" open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent className="flex flex-col h-full w-full sm:max-w-[360px] border-0 border-l border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-[#0c0c0e] shadow-2xl shadow-black/20 rounded-none">

                    {/* ── Header ── */}
                    <DrawerHeader className="flex-shrink-0 px-5 pt-5 pb-4 border-b border-zinc-100 dark:border-zinc-800/70">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/10 ring-1 ring-amber-400/30">
                                    <Bell className="w-4 h-4 text-amber-500" />
                                    {unreadCount > 0 && (
                                        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-amber-500 text-[9px] font-bold text-white">
                                            {unreadCount > 9 ? "9+" : unreadCount}
                                        </span>
                                    )}
                                </div>
                                <div>
                                    <DrawerTitle className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">
                                        Notifications
                                    </DrawerTitle>
                                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                                        {unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? "s" : ""}` : "You're all caught up"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-all"
                                    >
                                        <CheckCheck className="size-3.5" />
                                        All read
                                    </button>
                                )}
                                <DrawerClose asChild>
                                    <button className="flex items-center justify-center w-7 h-7 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 transition-all">
                                        <X className="size-4" />
                                    </button>
                                </DrawerClose>
                            </div>
                        </div>
                    </DrawerHeader>

                    {/* ── Notification List ── */}
                    <div className="flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 py-20">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full border-2 border-zinc-100 dark:border-zinc-800 animate-spin border-t-amber-500" />
                                </div>
                                <p className="text-xs text-zinc-400 font-medium">Loading notifications…</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3 py-20 px-6">
                                <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800/60">
                                    <Inbox className="size-7 text-zinc-300 dark:text-zinc-600" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">All caught up!</p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1">No new notifications right now.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-zinc-100/80 dark:divide-zinc-800/60">
                                {notifications.map((notification) => {
                                    const isUnread = notification.unread !== false && notification.is_read !== true;
                                    const title = notification.title || notification.verb || "Notification";
                                    const message = notification.message || notification.description || "";
                                    const dateStr = notification.created_at || notification.timestamp;
                                    const isProxy = isProxyRequest(notification);
                                    const isMutual = isMutualSwapRequest(notification);
                                    const swapId = (isProxy || isMutual) ? getSwapRequestId(notification) : null;

                                    const matchedReq = swapRequests.find(r => r.id === swapId);
                                    const backendStatus = matchedReq ? (matchedReq.status || matchedReq.action) : null;
                                    const currentStatus: string | null = respondedStatus[notification.id] || backendStatus;

                                    const textLower = `${title} ${message} ${notification.verb || ""} ${notification.description || ""}`.toLowerCase();
                                    const textImpliesAccepted = textLower.includes("accepted") || textLower.includes("approved");
                                    const textImpliesRejected = textLower.includes("declined") || textLower.includes("rejected");
                                    const textImpliesRequester = textLower.includes("your proxy") || textLower.includes("your swap") || textLower.includes("your mutual") || textLower.includes("you requested");

                                    const isAccepted = currentStatus === "ACCEPTED" || currentStatus === "APPROVED" || textImpliesAccepted;
                                    const isRejected = currentStatus === "REJECTED" || textImpliesRejected;
                                    const isPending = !isAccepted && !isRejected;

                                    const isCurrentUserRequester = matchedReq && (
                                         (matchedReq.requester_username?.toLowerCase() === username?.toLowerCase()) ||
                                         (matchedReq.requester_name?.toLowerCase() === username?.toLowerCase()) ||
                                         (matchedReq.requester?.username?.toLowerCase() === username?.toLowerCase())
                                     );

                                     const showActions = isUnread && 
                                                         role === "teacher" && 
                                                         (isProxy || isMutual) && 
                                                         isPending && 
                                                         !isAccepted && 
                                                         !isRejected && 
                                                         !isCurrentUserRequester && 
                                                         !textImpliesRequester;
                                     const isSwapNotification = isProxy || isMutual;
                                     const isNotice = textLower.includes("notice");

                                    return (
                                        <div
                                            key={notification.id}
                                            onClick={() => {
                                                if (isNotice) {
                                                    router.push("/dashboard/notices");
                                                    setIsOpen(false);
                                                }
                                                if (!showActions) {
                                                    handleMarkAsRead(notification.id, !isUnread);
                                                }
                                            }}
                                            className={cn(
                                                "relative px-5 py-4 transition-all duration-200 group",
                                                !showActions && isUnread && "cursor-pointer",
                                                isUnread
                                                    ? isNotice ? "bg-sky-50/40 dark:bg-sky-500/[0.02]"
                                                      : isAccepted ? "bg-emerald-50/40 dark:bg-emerald-500/[0.02]"
                                                      : isRejected ? "bg-red-50/40 dark:bg-red-500/[0.02]"
                                                      : isProxy ? "bg-violet-50/40 dark:bg-violet-500/[0.02]"
                                                      : isMutual ? "bg-blue-50/40 dark:bg-blue-500/[0.02]"
                                                      : "bg-amber-50/40 dark:bg-amber-500/[0.02]"
                                                    : "bg-transparent hover:bg-zinc-50/80 dark:hover:bg-zinc-800/30"
                                            )}
                                        >
                                            {/* Unread accent line */}
                                            {isUnread && (
                                                <span className={cn(
                                                    "absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full",
                                                    isNotice ? "bg-sky-500" :
                                                    isAccepted ? "bg-emerald-500" :
                                                    isRejected ? "bg-red-500" :
                                                    isProxy ? "bg-violet-500" :
                                                    isMutual ? "bg-blue-500" :
                                                    "bg-amber-500"
                                                )} />
                                            )}

                                            {/* Top row: icon + title + time */}
                                            <div className="flex items-start gap-3">
                                                {/* Icon */}
                                                <div className={cn(
                                                    "shrink-0 flex items-center justify-center w-8 h-8 rounded-lg mt-0.5",
                                                    isNotice
                                                        ? "bg-sky-500/10 text-sky-500"
                                                        : isAccepted
                                                        ? "bg-emerald-500/10 text-emerald-500"
                                                        : isRejected
                                                        ? "bg-red-500/10 text-red-500"
                                                        : isProxy
                                                        ? "bg-violet-500/10 text-violet-500"
                                                        : isMutual
                                                        ? "bg-blue-500/10 text-blue-500"
                                                        : "bg-amber-500/10 text-amber-500"
                                                )}>
                                                    {isNotice ? (
                                                        <Megaphone className="size-4" />
                                                    ) : isAccepted ? (
                                                        <UserCheck className="size-4" />
                                                    ) : isRejected ? (
                                                        <X className="size-4" />
                                                    ) : isProxy ? (
                                                        <ArrowRight className="size-4" />
                                                    ) : isMutual ? (
                                                        <ArrowLeftRight className="size-4" />
                                                    ) : (
                                                        <Bell className="size-4" />
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <p className={cn(
                                                            "text-[13px] leading-snug font-semibold truncate",
                                                            isUnread ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-600 dark:text-zinc-400"
                                                        )}>
                                                            {title}
                                                        </p>
                                                        <div className="flex items-center gap-1.5 shrink-0">
                                                            {isUnread && !isAccepted && !isRejected && (
                                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1" />
                                                            )}
                                                            {dateStr && (
                                                                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 whitespace-nowrap mt-0.5">
                                                                    {formatDistanceToNow(new Date(dateStr), { addSuffix: true })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Message */}
                                                    {message && (
                                                        <p className="text-[12px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-1 line-clamp-2">
                                                            {message}
                                                        </p>
                                                    )}

                                                    {/* Status badge */}
                                                    {isAccepted && (
                                                        <div className="flex items-center gap-1.5 mt-2">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                                                                <Check className="size-3" />
                                                                Approved
                                                            </span>
                                                        </div>
                                                    )}
                                                    {isRejected && (
                                                        <div className="flex items-center gap-1.5 mt-2">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-semibold">
                                                                <X className="size-3" />
                                                                Rejected
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Type badge (only pending swap notifications) */}
                                                    {showActions && (
                                                        <div className="mt-2">
                                                            <span className={cn(
                                                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide",
                                                                isProxy
                                                                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400"
                                                                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                                            )}>
                                                                <Clock className="size-2.5" />
                                                                {isProxy ? "Proxy Request" : "Mutual Swap"} · Pending
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Accept / Reject actions */}
                                            {showActions && (
                                                <div
                                                    className="flex flex-col gap-2 mt-3 ml-11"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {/* Request ID input — only shown as fallback if auto-detection fails */}
                                                    {!swapId && (
                                                        <div className="flex items-center gap-2">
                                                            <label className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 shrink-0">
                                                                Request ID
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min="1"
                                                                placeholder="Enter ID…"
                                                                value={swapIdInputs[notification.id] ?? ""}
                                                                onChange={(e) =>
                                                                    setSwapIdInputs(prev => ({
                                                                        ...prev,
                                                                        [notification.id]: e.target.value
                                                                    }))
                                                                }
                                                                onClick={(e) => e.stopPropagation()}
                                                                className={cn(
                                                                    "w-20 h-6 px-2 rounded-md text-[11px] font-mono border outline-none transition-colors",
                                                                    "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700",
                                                                    "text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400",
                                                                    "focus:border-amber-400 dark:focus:border-amber-500",
                                                                    !swapIdInputs[notification.id]
                                                                        ? "border-amber-300 dark:border-amber-600/50"
                                                                        : ""
                                                                )}
                                                            />
                                                            {!swapIdInputs[notification.id] && (
                                                                <span className="text-[10px] text-amber-500 dark:text-amber-400">
                                                                    required
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    {/* Buttons */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRespondToSwap(notification.id, "ACCEPT", notification, swapId);
                                                            }}
                                                            disabled={submittingAction[`${notification.id}-ACCEPT`] || submittingAction[`${notification.id}-REJECT`]}
                                                            className={cn(
                                                                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150",
                                                                "bg-emerald-500 hover:bg-emerald-600 active:scale-[0.97] text-white shadow-sm shadow-emerald-500/20",
                                                                "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                                            )}
                                                        >
                                                            {submittingAction[`${notification.id}-ACCEPT`]
                                                                ? <Loader2 className="size-3 animate-spin" />
                                                                : <Check className="size-3" />}
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRespondToSwap(notification.id, "REJECT", notification, swapId);
                                                            }}
                                                            disabled={submittingAction[`${notification.id}-ACCEPT`] || submittingAction[`${notification.id}-REJECT`]}
                                                            className={cn(
                                                                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold transition-all duration-150",
                                                                "bg-transparent border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300",
                                                                "hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:border-red-500/30 dark:hover:text-red-400",
                                                                "active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                                                            )}
                                                        >
                                                            {submittingAction[`${notification.id}-REJECT`]
                                                                ? <Loader2 className="size-3 animate-spin" />
                                                                : <X className="size-3" />}
                                                            Decline
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Read hint for unread non-action items */}
                                            {isUnread && !showActions && !isAccepted && !isRejected && !isSwapNotification && (
                                                <p className="mt-2 ml-11 text-[10px] text-zinc-400 dark:text-zinc-600 font-medium group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors">
                                                    Click to mark as read
                                                </p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    {!loading && notifications.length > 0 && (
                        <div className="flex-shrink-0 px-5 py-3 border-t border-zinc-100 dark:border-zinc-800/70 bg-zinc-50/60 dark:bg-zinc-900/20">
                            <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-600">
                                {notifications.length} notification{notifications.length !== 1 ? "s" : ""} · Refreshes every 30s
                            </p>
                        </div>
                    )}
                </DrawerContent>
            </Drawer>
        </>
    );
}
