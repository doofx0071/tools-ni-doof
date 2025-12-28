import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import prompts from "prompts";

const themes = [
    "Amber Minimal", "Amethyst Haze", "Bold Tech", "Bubblegum", "Caffeine", "Candyland",
    "Catppuccin", "Claude", "Claymorphism", "Clean Slate", "Cosmic Night", "Cyberpunk",
    "Darkmatter", "Doom 64", "Elegant Luxury", "Graphite", "Kodama Grove", "Midnight Bloom",
    "Mocha Mousse", "Modern Minimal", "Mono", "Nature", "Neo Brutalism", "Northern Lights",
    "Notebook", "Ocean Breeze", "Pastel Dreams", "Perpetuity", "Quantum Rose", "Retro Arcade",
    "Sage Garden", "Soft Pop", "Solar Dusk", "Starry Night", "Sunset Horizon", "Supabase",
    "T3 Chat", "Tangerine", "Twitter", "Vercel", "Vintage Paper", "Violet Bloom"
];

async function main() {
    const args = process.argv.slice(2);
    let toolName = args[0];

    if (!toolName) {
        const response = await prompts({
            type: "text",
            name: "name",
            message: "What is the name of the tool? (e.g., json-formatter)",
            validate: (value) =>
                /^[a-z0-9-]+$/.test(value) ? true : "Only kebab-case allowed (e.g., my-tool-name)",
        });

        if (!response.name) process.exit(1);
        toolName = response.name;
    }

    // Ensure kebab-case
    const kebabName = toolName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const className = kebabName.split("-").map(s => s.charAt(0).toUpperCase() + s.slice(1)).join("");

    // Select Theme
    let selectedTheme = args[1];

    if (!selectedTheme) {
        const themeResponse = await prompts({
            type: "autocomplete",
            name: "theme",
            message: "Select a Theme from TweakCN",
            choices: themes.map(t => ({ title: t, value: t })),
        });
        selectedTheme = themeResponse.theme;
    }

    if (!selectedTheme) {
        console.log("❌ No theme selected. Exiting.");
        process.exit(1);
    }
    const themeSlug = selectedTheme.toLowerCase().replace(/\s+/g, "-");
    const themeUrl = `https://tweakcn.com/r/themes/${themeSlug}.json`;

    console.log(`\n🎨 Fetching theme: ${selectedTheme} (${themeUrl})...`);

    let cssVariables = "";
    try {
        const res = await fetch(themeUrl);
        if (!res.ok) throw new Error(`Failed to fetch theme: ${res.statusText}`);
        const data = await res.json();

        // Parse CSS Vars
        // We only want to scope the colors to the tool class
        const lightVars = Object.entries(data.cssVars.light)
            .map(([key, value]) => `  --${key}: ${value};`)
            .join("\n");

        const darkVars = Object.entries(data.cssVars.dark)
            .map(([key, value]) => `  --${key}: ${value};`)
            .join("\n");

        cssVariables = `/* Theme: ${selectedTheme} */
.tool-${kebabName} {
${lightVars}
}

.dark .tool-${kebabName} {
${darkVars}
}
`;
    } catch (error) {
        console.error("⚠️ Failed to load theme, falling back to default.", error);
        cssVariables = `.tool-${kebabName} {\n  --primary: oklch(0.6 0.2 250);\n  --accent: oklch(0.8 0.1 250);\n}\n`;
    }

    const convexName = kebabName.replace(/-/g, "_");
    const paths = {
        convex: join(process.cwd(), "convex", convexName),
        feature: join(process.cwd(), "src", "features", kebabName),
        appRoute: join(process.cwd(), "src", "app", "(tools)", kebabName),
    };

    console.log(`🚀 Scaffolding new tool: ${kebabName}...`);

    // 1. Create Directories
    Object.values(paths).forEach((path) => {
        if (!existsSync(path)) mkdirSync(path, { recursive: true });
    });

    // Create subfolders for features
    ["components", "hooks", "styles", "utils", "types"].forEach(sub => {
        const p = join(paths.feature, sub);
        if (!existsSync(p)) mkdirSync(p);
    });

    // 2. Create Convex Boilerplate
    const convexQuery = join(paths.convex, "queries.ts");
    if (!existsSync(convexQuery)) {
        writeFileSync(
            convexQuery,
            `import { query } from "../_generated/server";\n\nexport const get = query({\n  handler: async (ctx) => {\n    // Implementation here\n    return [];\n  },\n});`
        );
    }

    const convexMutation = join(paths.convex, "mutations.ts");
    if (!existsSync(convexMutation)) {
        writeFileSync(
            convexMutation,
            `import { mutation } from "../_generated/server";\n\nexport const create = mutation({\n  handler: async (ctx, args) => {\n    // Implementation here\n  },\n});`
        );
    }

    // 3. Write Scoped CSS
    writeFileSync(join(paths.feature, "styles", "tool.css"), cssVariables);

    // 4. Create Feature Index
    const featureIndex = join(paths.feature, "index.tsx");
    if (!existsSync(featureIndex)) {
        writeFileSync(
            featureIndex,
            `import "./styles/tool.css";\n\nexport default function ${className}() {\n  return (\n    <div className="tool-${kebabName} p-8 min-h-screen animate-in fade-in duration-500">\n      <h1 className="text-4xl font-bold text-primary">${kebabName} Tool</h1>\n      <p className="mt-4 text-muted-foreground">Theme: ${selectedTheme}</p>\n      <div className="mt-8 p-6 glass rounded-2xl border border-white/10">\n        <p>Start building your feature here.</p>\n      </div>\n    </div>\n  );\n}`
        );
    }

    // 5. Create App Route
    const appPage = join(paths.appRoute, "page.tsx");
    if (!existsSync(appPage)) {
        writeFileSync(
            appPage,
            `import ${className} from "@/features/${kebabName}";\n\nexport const metadata = {\n  title: "${className} - Tools-ni-Doof",\n  description: "A professional ${kebabName} tool.",\n};\n\nexport default function Page() {\n  return <${className} />;\n}`
        );
    }

    console.log(`\n✨ Tool "${kebabName}" is ready!`);
    console.log(`🔗 Route: http://localhost:3000/${kebabName}`);
}

main();
