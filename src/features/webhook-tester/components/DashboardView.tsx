"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { getEndpointUrl } from "../utils/url";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, ExternalLinkIcon, ClockIcon, PlayIcon, PauseIcon } from "lucide-react";

export default function DashboardView() {
    const endpoints = useQuery(api.webhook_tester.queries.listEndpoints);
    const createEndpoint = useMutation(api.webhook_tester.mutations.createEndpoint);
    const [isCreating, setIsCreating] = useState(false);

    // Wrapper for mutation to return compatible type or handle navigation?
    // Actually we probably want to navigate to the new endpoint.
    // The mutation returns { endpointId, slug }.
    const createMutation = async (args: { name?: string }) => {
        const result = await createEndpoint(args);
        // We could router.push here, but for now let's just refresh the list (auto via reactive query).
    };

    const handleCreate = async () => {
        setIsCreating(true);
        try {
            await createMutation({ name: "Untitled Endpoint" });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-8 tool-webhook-tester">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                        Webhook Tester
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Inspect incoming HTTP requests in real-time.
                    </p>
                </div>
                <Button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="shadow-lg shadow-primary/20"
                >
                    {isCreating ? (
                        <>Creating...</>
                    ) : (
                        <>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            New Endpoint
                        </>
                    )}
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {endpoints === undefined ? (
                    // Loading State
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="bg-card/30 border-white/5">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-6 w-32 mt-2" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full" />
                            </CardContent>
                        </Card>
                    ))
                ) : endpoints.length === 0 ? (
                    // Empty State
                    <div className="col-span-full py-12 text-center border-2 border-dashed border-border/30 rounded-xl bg-card/10">
                        <p className="text-muted-foreground">No endpoints yet. Create one to get started.</p>
                    </div>
                ) : (
                    // List
                    endpoints.map((ep) => (
                        <Link key={ep._id} href={`/webhook-tester/${ep._id}`} className="block group">
                            <Card className="h-full bg-card/30 backdrop-blur-sm border-white/10 hover:border-primary/30 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start mb-1">
                                        <Badge variant={ep.paused ? "secondary" : "default"} className={ep.paused ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20" : "bg-green-500/10 text-green-500 hover:bg-green-500/20"}>
                                            {ep.paused ? (
                                                <><PauseIcon className="w-3 h-3 mr-1" /> PAUSED</>
                                            ) : (
                                                <><PlayIcon className="w-3 h-3 mr-1" /> ACTIVE</>
                                            )}
                                        </Badge>
                                        <div className="flex items-center text-xs text-muted-foreground/60 font-mono">
                                            <ClockIcon className="w-3 h-3 mr-1" />
                                            {ep.lastReceivedAt ? new Date(ep.lastReceivedAt).toLocaleTimeString() : "Never"}
                                        </div>
                                    </div>
                                    <CardTitle className="text-lg truncate pr-2 group-hover:text-primary transition-colors">
                                        {ep.name || "Untitled Endpoint"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="px-3 py-2 bg-black/20 rounded border border-white/5 flex items-center justify-between group-hover:border-white/10 transition-colors">
                                        <code className="text-[10px] text-muted-foreground font-mono truncate flex-1">
                                            {getEndpointUrl(ep.slug)}
                                        </code>
                                        <ExternalLinkIcon className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
