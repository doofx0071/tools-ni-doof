
import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, CloudDrizzle, Wind } from "lucide-react";

export interface WeatherData {
    temperature: number;
    weatherCode: number;
    isDay: number;
}

// Map WMO Weather Codes to Lucide Icons and Descriptions
export const mapWmoCodeToIcon = (code: number, isDay: number = 1) => {
    // 0: Clear sky
    if (code === 0) return { icon: Sun, label: "Clear Sky" };
    // 1, 2, 3: Mainly clear, partly cloudy, and overcast
    if (code >= 1 && code <= 3) return { icon: Cloud, label: "Cloudy" };
    // 45, 48: Fog and depositing rime fog
    if (code === 45 || code === 48) return { icon: CloudFog, label: "Foggy" };
    // 51, 53, 55: Drizzle: Light, moderate, and dense intensity
    if (code >= 51 && code <= 55) return { icon: CloudDrizzle, label: "Drizzle" };
    // 56, 57: Freezing Drizzle: Light and dense intensity
    if (code === 56 || code === 57) return { icon: CloudSnow, label: "Freezing Drizzle" };
    // 61, 63, 65: Rain: Slight, moderate and heavy intensity
    if (code >= 61 && code <= 65) return { icon: CloudRain, label: "Rain" };
    // 66, 67: Freezing Rain: Light and heavy intensity
    if (code === 66 || code === 67) return { icon: CloudSnow, label: "Freezing Rain" };
    // 71, 73, 75: Snow fall: Slight, moderate, and heavy intensity
    if (code >= 71 && code <= 77) return { icon: CloudSnow, label: "Snow" };
    // 80, 81, 82: Rain showers: Slight, moderate, and violent
    if (code >= 80 && code <= 82) return { icon: CloudRain, label: "Showers" };
    // 85, 86: Snow showers slight and heavy
    if (code === 85 || code === 86) return { icon: CloudSnow, label: "Snow Showers" };
    // 95: Thunderstorm: Slight or moderate
    // 96, 99: Thunderstorm with slight and heavy hail
    if (code >= 95) return { icon: CloudLightning, label: "Thunderstorm" };

    return { icon: Sun, label: "Unknown" };
};

export const getCityFromZone = (zone: string): string => {
    // "Asia/Manila" -> "Manila"
    // "America/New_York" -> "New York"
    const cityPart = zone.split("/")[1];
    return cityPart ? cityPart.replace(/_/g, " ") : zone;
};

export const fetchWeatherData = async (city: string): Promise<WeatherData | null> => {
    try {
        // 1. Geocoding
        const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
        const geoData = await geoRes.json();

        if (!geoData.results || geoData.results.length === 0) {
            console.warn(`Weather: Could not find coordinates for ${city}`);
            return null;
        }

        const { latitude, longitude } = geoData.results[0];

        // 2. Weather
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,is_day`);
        const weatherData = await weatherRes.json();

        if (!weatherData.current) {
            return null;
        }

        return {
            temperature: weatherData.current.temperature_2m,
            weatherCode: weatherData.current.weather_code,
            isDay: weatherData.current.is_day
        };

    } catch (error) {
        console.error("Weather fetch error:", error);
        return null;
    }
};
