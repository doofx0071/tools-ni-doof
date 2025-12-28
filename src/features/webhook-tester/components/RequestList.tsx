"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RequestListProps {
    endpointId: Id<"webhookEndpoints">;
    selectedRequestId: Id<"webhookRequests"> | null;
    onSelect: (id: Id<"webhookRequests">) => void;
}

export default function RequestList({ endpointId, selectedRequestId, onSelect }: RequestListProps) {
    const requests = useQuery(api.webhook_tester.queries.listRequests, { endpointId, limit: 50 });

    if (!requests) {
        return <div className="p-4 text-center text-sm text-muted-foreground">Loading requests...</div>;
    }

    // listRequests returns a paginated result object { page: [], isDone, continueCursor }
    // or just array depending on how I wrote it.
    // I wrote it as `paginate({ ... })` so it returns `{ page, isDone, continueCursor }`.
    const items = requests.page;

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 px-6 text-center text-muted-foreground/60 italic space-y-2">
                <p>No requests yet.</p>
                <p className="text-xs">Send a request to the webhook URL to see it appear here.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col pb-4">
            <AnimatePresence initial={false}>
                {items.map((req) => (
                    <motion.div
                        key={req._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-b border-border/30 last:border-0"
                    >
                        <button
                            onClick={() => onSelect(req._id)}
                            className={cn(
                                "w-full text-left p-3 transition-colors hover:bg-muted/30 focus:outline-none focus:bg-muted/30 relative",
                                selectedRequestId === req._id && "bg-muted/50 dark:bg-muted/20"
                            )}
                        >
                            {selectedRequestId === req._id && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                                />
                            )}

                            <div className="flex items-center justify-between mb-1.5 px-1">
                                <Badge
                                    variant="secondary"
                                    className={cn("text-[10px] px-1.5 py-0 uppercase pointer-events-none", getMethodColor(req.method))}
                                >
                                    {req.method}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {new Date(req.receivedAt).toLocaleTimeString()}
                                </span>
                            </div>
                            <div className="text-xs truncate font-mono opacity-80 px-1 text-foreground/80">
                                <span className="text-muted-foreground">{req.sizeBytes}b</span>
                                {req.truncated && <span className="text-yellow-500 ml-1">(trunc)</span>}
                            </div>
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}

function getMethodColor(method: string) {
    switch (method?.toUpperCase()) {
        case "POST": return "bg-green-500/20 text-green-500 dark:bg-green-900/30 dark:text-green-400";
        case "GET": return "bg-blue-500/20 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400";
        case "PUT": return "bg-orange-500/20 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400";
        case "DELETE": return "bg-red-500/20 text-red-500 dark:bg-red-900/30 dark:text-red-400";
        default: return "bg-gray-500/20 text-gray-500";
    }
}
