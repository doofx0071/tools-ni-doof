export const getWebhookBaseUrl = () => {
    // In a real app, this should be an env var or derived from the deployment.
    // For MVP with Convex, we can guess.
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
    if (convexUrl.includes("convex.cloud")) {
        return convexUrl.replace(".cloud", ".site");
    }
    // Local development fallback
    if (convexUrl.includes("127.0.0.1") || convexUrl.includes("localhost")) {
        // Typically local convex runs http on a different port or same? 
        // Actually `convex dev` usually prints the site URL.
        // We will assume the user has set NEXT_PUBLIC_WEBHOOK_URL if this fails, 
        // or just return a placeholder that the user must replace.
        return convexUrl.replace(/:\d+$/, ":8001"); // basic guess for local backend http?
    }
    return "https://<your-convex-deployment>.convex.site";
};

export const getEndpointUrl = (slug: string) => {
    const base = getWebhookBaseUrl();
    // Remove trailing slash if present
    const cleanBase = base.endsWith("/") ? base.slice(0, -1) : base;
    return `${cleanBase}/webhook/${slug}`;
};
