"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";
import Link from "next/link";
import RequestList from "./RequestList";
import RequestDetail from "./RequestDetail";
import { getEndpointUrl } from "../utils/url";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SettingsIcon, CopyIcon, ArrowLeftIcon, PlayIcon, PauseIcon, CheckIcon } from "lucide-react";


interface EndpointViewProps {
    endpointId: Id<"webhookEndpoints">;
}

export default function EndpointView({ endpointId }: EndpointViewProps) {
    const endpoint = useQuery(api.webhook_tester.queries.getEndpoint, { endpointId });
    const [selectedRequestId, setSelectedRequestId] = useState<Id<"webhookRequests"> | null>(null);
    const [copied, setCopied] = useState(false);

    if (endpoint === undefined) {
        return <div className="p-8 flex items-center justify-center h-screen">Loading endpoint...</div>;
    }

    if (endpoint === null) {
        return <div className="p-8 flex items-center justify-center h-screen">Endpoint not found.</div>;
    }

    const webhookUrl = getEndpointUrl(endpoint.slug);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(webhookUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-screen max-h-screen tool-webhook-tester overflow-hidden bg-background">
            {/* Top Bar */}
            <div className="h-16 border-b border-border/30 bg-background/80 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
                <div className="flex items-center gap-4">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href="/webhook-tester">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <ArrowLeftIcon className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Back to Dashboard</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Separator orientation="vertical" className="h-6" />

                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/webhook-tester">Webhook Tester</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold">{endpoint.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {endpoint.paused && (
                        <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                            <PauseIcon className="w-3 h-3 mr-1" /> PAUSED
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-muted/50 rounded-md p-1 pl-3 border border-border/50">
                        <code className="text-xs text-muted-foreground mr-2 font-mono select-all">{webhookUrl}</code>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyToClipboard}>
                                        {copied ? <CheckIcon className="h-3 w-3 text-green-500" /> : <CopyIcon className="h-3 w-3" />}
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy URL</TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>

                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link href={`/webhook-tester/${endpoint._id}/settings`}>
                                    <Button variant="outline" size="icon">
                                        <SettingsIcon className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>Endpoint Settings</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
            </div>

            {/* Main Layout */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-[320px] border-r border-border/30 bg-muted/5 flex flex-col">
                    <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-2">Requests</h3>
                        {/* Could add a refresh or clear button here if needed */}
                    </div>
                    <ScrollArea className="flex-1">
                        <RequestList
                            endpointId={endpointId}
                            selectedRequestId={selectedRequestId}
                            onSelect={setSelectedRequestId}
                        />
                    </ScrollArea>
                </div>

                {/* Details Panel */}
                <div className="flex-1 bg-background relative">
                    <RequestDetail requestId={selectedRequestId} />
                </div>
            </div>
        </div>
    );
}
