"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeft, Trash2, StopCircle, PlayCircle, Eraser, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SettingsViewProps {
    endpointId: Id<"webhookEndpoints">;
}

export default function SettingsView({ endpointId }: SettingsViewProps) {
    const router = useRouter();
    const endpoint = useQuery(api.webhook_tester.queries.getEndpoint, { endpointId });

    const updateEndpoint = useMutation(api.webhook_tester.mutations.updateEndpoint);
    const deleteEndpoint = useMutation(api.webhook_tester.mutations.deleteEndpoint);
    const clearRequests = useMutation(api.webhook_tester.mutations.clearRequests);

    const [name, setName] = useState("");
    const [dirty, setDirty] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Initialize name
    useEffect(() => {
        if (endpoint && !dirty && name === "") {
            setName(endpoint.name);
        }
    }, [endpoint, dirty, name]);

    if (!endpoint) {
        return <div className="p-8 text-muted-foreground text-center">Loading settings...</div>;
    }

    const handleSaveName = async () => {
        await updateEndpoint({ endpointId, name });
        setDirty(false);
    };

    const handleTogglePause = async (checked: boolean) => {
        await updateEndpoint({ endpointId, paused: checked });
    };

    const handleClear = async () => {
        if (confirm("Are you sure you want to delete all requests?")) {
            await clearRequests({ endpointId });
        }
    };

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this endpoint completely? This cannot be undone.")) {
            setIsDeleting(true);
            await deleteEndpoint({ endpointId });
            router.push("/webhook-tester");
        }
    };

    return (
        <div className="min-h-screen bg-background p-6 md:p-12 tool-webhook-tester">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4">
                    {/* We can use router.back() or link */}
                    <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Endpoint Settings</h1>
                        <p className="text-muted-foreground">Manage your webhook endpoint configuration.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* General Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>General</CardTitle>
                            <CardDescription>Basic information about this endpoint.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col space-y-2">
                                <Label htmlFor="name">Endpoint Name</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => { setName(e.target.value); setDirty(true); }}
                                        placeholder="My Endpoint"
                                    />
                                    <Button
                                        onClick={handleSaveName}
                                        disabled={!dirty || !name.trim()}
                                        variant="secondary"
                                    >
                                        Save
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="border-destructive/20 bg-destructive/5">
                        <CardHeader>
                            <CardTitle className="text-destructive">Danger Zone</CardTitle>
                            <CardDescription>Destructive actions that affect data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Pause Endpoint</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Stop receiving new webhooks temporarily.
                                    </p>
                                </div>
                                <Switch
                                    checked={endpoint.paused}
                                    onCheckedChange={handleTogglePause}
                                />
                            </div>

                            <Separator className="bg-destructive/10" />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Clear Inbox</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently remove all captured requests.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-destructive/30 text-destructive hover:bg-destructive/10"
                                    onClick={handleClear}
                                >
                                    <Eraser className="w-4 h-4 mr-2" />
                                    Clear Requests
                                </Button>
                            </div>

                            <Separator className="bg-destructive/10" />

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-destructive">Delete Endpoint</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Permanently delete this endpoint and all its data.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : (
                                        <><Trash2 className="w-4 h-4 mr-2" /> Delete Endpoint</>
                                    )}
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
