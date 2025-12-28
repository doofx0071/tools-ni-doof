import EndpointView from "../../../../features/webhook-tester/components/EndpointView";
import "../../../../features/webhook-tester/styles/tool.css";
import { Id } from "../../../../../convex/_generated/dataModel";

export default async function Page({ params }: { params: Promise<{ endpointId: string }> }) {
    const resolvedParams = await params;
    return <EndpointView endpointId={resolvedParams.endpointId as Id<"webhookEndpoints">} />;
}
