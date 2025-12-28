"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner"; // Using Sonner as installed via shadcn

interface RequestDetailProps {
    requestId: Id<"webhookRequests"> | null;
}

export default function RequestDetail({ requestId }: RequestDetailProps) {
    const request = useQuery(api.webhook_tester.queries.getRequest, requestId ? { requestId } : "skip");

    if (!requestId) {
        return (
            <div className="h-full flex items-center justify-center p-8 text-muted-foreground/40 select-none flex-col gap-2">
                <div className="w-16 h-16 rounded-full bg-muted/10 flex items-center justify-center mb-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
                </div>
                <p>Select a request to inspect</p>
            </div>
        );
    }

    if (request === undefined) {
        return <div className="p-8 text-sm text-muted-foreground">Loading details...</div>;
    }

    if (request === null) {
        return <div className="p-8 text-sm text-red-400">Request not found</div>;
    }

    const headers = request.headers as Record<string, string>;
    const query = request.query as Record<string, string>;

    let bodyContent = request.rawBody;
    let isJson = !!request.jsonBody;

    if (isJson && request.jsonBody) {
        try {
            bodyContent = JSON.stringify(request.jsonBody, null, 2);
        } catch (e) {
            // fallback
        }
    }

    const handleCopyBody = () => {
        navigator.clipboard.writeText(bodyContent);
        toast.success("Body copied to clipboard");
    };

    return (
        <div className="flex flex-col h-full bg-card/10">
            {/* Header */}
            <div className="p-4 border-b border-border/30 flex items-center justify-between bg-background/50 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-base px-2">
                        {request.method}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                        {new Date(request.receivedAt).toISOString()}
                    </span>
                </div>
                <div className="text-xs text-muted-foreground font-mono flex items-center gap-2">
                    <span>{request.sizeBytes} bytes</span>
                    {request.truncated && <Badge variant="destructive" className="text-[10px] h-4">TRUNCATED</Badge>}
                </div>
            </div>

            <Tabs defaultValue="body" className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 border-b border-border/30 bg-muted/5">
                    <TabsList className="bg-transparent h-10 w-full justify-start rounded-none p-0">
                        <TabsTrigger value="body" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">Body</TabsTrigger>
                        <TabsTrigger value="headers" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">Headers <span className="ml-2 text-[10px] opacity-60 bg-muted px-1 rounded-full">{Object.keys(headers || {}).length}</span></TabsTrigger>
                        <TabsTrigger value="query" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4">Query <span className="ml-2 text-[10px] opacity-60 bg-muted px-1 rounded-full">{Object.keys(query || {}).length}</span></TabsTrigger>
                    </TabsList>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <TabsContent value="body" className="h-full m-0 p-0 relative group">
                        <ScrollArea className="h-full w-full">
                            <pre className={`font-mono text-xs sm:text-sm leading-relaxed p-4 ${isJson ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                                {bodyContent || <span className="text-muted-foreground italic">(Empty body)</span>}
                            </pre>
                        </ScrollArea>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                            onClick={handleCopyBody}
                        >
                            <CopyIcon className="w-3 h-3 mr-2" /> Copy
                        </Button>
                    </TabsContent>

                    <TabsContent value="headers" className="h-full m-0">
                        <ScrollArea className="h-full w-full p-4">
                            <div className="space-y-1">
                                {Object.entries(headers || {}).map(([k, v]) => (
                                    <div key={k} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-2 border-b border-border/20 last:border-0 hover:bg-muted/10 px-2 rounded -mx-2 transition-colors">
                                        <span className="font-mono text-xs font-semibold text-accent-foreground/80 min-w-[140px] select-all shrink-0">{k}</span>
                                        <span className="font-mono text-xs text-muted-foreground select-all break-all">{String(v)}</span>
                                    </div>
                                ))}
                                {Object.keys(headers || {}).length === 0 && (
                                    <div className="text-sm text-muted-foreground italic text-center py-8">No headers</div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>

                    <TabsContent value="query" className="h-full m-0">
                        <ScrollArea className="h-full w-full p-4">
                            <div className="space-y-1">
                                {Object.entries(query || {}).map(([k, v]) => (
                                    <div key={k} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 py-2 border-b border-border/20 last:border-0 hover:bg-muted/10 px-2 rounded -mx-2 transition-colors">
                                        <span className="font-mono text-xs font-semibold text-blue-500/80 min-w-[140px] select-all shrink-0">{k}</span>
                                        <span className="font-mono text-xs text-muted-foreground select-all break-all">{String(v)}</span>
                                    </div>
                                ))}
                                {Object.keys(query || {}).length === 0 && (
                                    <div className="text-sm text-muted-foreground italic text-center py-8">No query parameters</div>
                                )}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </div>
            </Tabs>
        </div>
    );
}
