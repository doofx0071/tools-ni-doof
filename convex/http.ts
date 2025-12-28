import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

const webhookHandler = httpAction(async (ctx, request) => {
    const url = new URL(request.url);
    // Path format: /webhook/:slug
    // But wait, the path prefix is /webhook/ defined below. 
    // request.url will be the full URL.
    // We need to extract the slug.

    // We can't rely on `request.nextUrl` or similar Next.js specific things here.
    // Assume generic Request object.
    const pathParts = url.pathname.split("/");
    // url.pathname might start with /webhook/
    // Example: /webhook/abc-123 using the route below
    const slugIndex = pathParts.indexOf("webhook");
    const slug = (slugIndex !== -1 && pathParts.length > slugIndex + 1) ? pathParts[slugIndex + 1] : null;

    if (!slug) {
        return new Response("Missing slug", { status: 400 });
    }

    // 1. Look up endpoint
    const endpoint = await ctx.runQuery(internal.webhook_tester.queries.getEndpointBySlug, { slug });

    if (!endpoint) {
        return new Response("Endpoint not found", { status: 404 });
    }

    if (endpoint.paused) {
        return new Response(JSON.stringify({ paused: true }), {
            status: 202,
            headers: { "Content-Type": "application/json" }
        });
    }

    // 2. Parse payload
    const method = request.method;
    const receivedAt = Date.now();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        headers[key] = value;
    });
    const query = Object.fromEntries(url.searchParams.entries());

    let rawBody = "";
    let jsonBody = null;
    let truncated = false;
    let sizeBytes = 0;

    try {
        // Read blob/text
        const buffer = await request.arrayBuffer();
        sizeBytes = buffer.byteLength;
        const decoder = new TextDecoder();

        // Simplistic size check logic
        const MAX_SIZE = 256 * 1024; // 256KB
        if (sizeBytes > MAX_SIZE) {
            truncated = true;
            // Decode only the first MAX_SIZE bytes
            rawBody = decoder.decode(buffer.slice(0, MAX_SIZE));
        } else {
            rawBody = decoder.decode(buffer);
        }

        // Try parsing JSON if content-type suggests it or just try
        const contentType = headers["content-type"] || "";
        if (contentType.includes("json") || (rawBody.trim().startsWith("{") || rawBody.trim().startsWith("["))) {
            try {
                jsonBody = JSON.parse(rawBody);
            } catch (e) {
                // ignore
            }
        }
    } catch (e) {
        console.error("Error reading body", e);
        rawBody = "(Error reading body)";
    }

    // 3. Store request
    await ctx.runMutation(internal.webhook_tester.mutations.logRequest, {
        endpointId: endpoint._id,
        receivedAt,
        method,
        headers,
        query,
        rawBody,
        jsonBody: jsonBody || undefined,
        truncated,
        sizeBytes,
    });

    return new Response(JSON.stringify({ ok: true, success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    });
});

http.route({
    pathPrefix: "/webhook/",
    method: "POST",
    handler: webhookHandler,
});

http.route({
    pathPrefix: "/webhook/",
    method: "GET",
    handler: webhookHandler,
});

http.route({
    pathPrefix: "/webhook/",
    method: "PUT",
    handler: webhookHandler,
});

http.route({
    pathPrefix: "/webhook/",
    method: "DELETE",
    handler: webhookHandler,
});

http.route({
    pathPrefix: "/webhook/",
    method: "PATCH",
    handler: webhookHandler,
});

export default http;
