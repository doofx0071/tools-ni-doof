import { Options } from "qr-code-styling";

export type Preset = {
    id: string;
    name: string;
    description: string;
    options: Partial<Options>;
};

export const PRESETS: Preset[] = [
    {
        id: "neon-night",
        name: "Neon Night",
        description: "Dark mode with vibrant cyan & magenta gradients.",
        options: {
            dotsOptions: {
                type: "rounded",
                color: "#00ffff",
                gradient: {
                    type: "linear",
                    rotation: 0,
                    colorStops: [
                        { offset: 0, color: "#00ffff" },
                        { offset: 1, color: "#ff00ff" }
                    ]
                }
            },
            backgroundOptions: { color: "#09090b" },
            cornersSquareOptions: { type: "extra-rounded", color: "#00ffff" },
            cornersDotOptions: { type: "dot", color: "#ff00ff" }
        }
    },
    {
        id: "corporate-clean",
        name: "Corporate Clean",
        description: "Professional solid blue with square edges.",
        options: {
            dotsOptions: { type: "square", color: "#1e3a8a", gradient: undefined },
            backgroundOptions: { color: "#ffffff" },
            cornersSquareOptions: { type: "square", color: "#1e3a8a" },
            cornersDotOptions: { type: "square", color: "#1e3a8a" }
        }
    },
    {
        id: "soft-aesthetic",
        name: "Soft Aesthetic",
        description: "Pastel gradients with extra rounded corners.",
        options: {
            dotsOptions: {
                type: "dots",
                color: "#fbcfe8",
                gradient: {
                    type: "linear",
                    rotation: 45,
                    colorStops: [
                        { offset: 0, color: "#fbcfe8" },
                        { offset: 1, color: "#c4b5fd" }
                    ]
                }
            },
            backgroundOptions: { color: "#fafafa" },
            cornersSquareOptions: { type: "extra-rounded", color: "#c4b5fd" },
            cornersDotOptions: { type: "dot", color: "#fbcfe8" }
        }
    }
];

export const generateRandomOptions = (): Partial<Options> => {
    const randomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

    // Explicitly cast consistent types to avoid TS errors with the library's complex union types
    const dotTypes = ["rounded", "dots", "classy", "classy-rounded", "square", "extra-rounded"] as const;
    const cornerTypes = ["square", "dot", "extra-rounded"] as const;

    const randomDotType = dotTypes[Math.floor(Math.random() * dotTypes.length)];
    const randomCornerType = cornerTypes[Math.floor(Math.random() * cornerTypes.length)];
    const randomCornerDotType = cornerTypes[Math.floor(Math.random() * cornerTypes.length)];

    const useGradient = Math.random() > 0.5;

    return {
        dotsOptions: {
            type: randomDotType as any,
            color: randomColor(),
            gradient: useGradient ? {
                type: Math.random() > 0.5 ? "linear" : "radial",
                rotation: Math.floor(Math.random() * 360),
                colorStops: [
                    { offset: 0, color: randomColor() },
                    { offset: 1, color: randomColor() }
                ]
            } : undefined
        },
        backgroundOptions: { color: "#ffffff" },
        cornersSquareOptions: { type: randomCornerType as any, color: randomColor() },
        cornersDotOptions: { type: randomCornerDotType as any, color: randomColor() }
    };
};
