
import { useState, useEffect } from 'react';
import { fetchWeatherData, getCityFromZone, WeatherData } from '../utils/weather';

export function useWeather(zone: string) {
    const [data, setData] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        const city = getCityFromZone(zone);

        const load = async () => {
            try {
                setLoading(true);
                // Artificial delay to prevent flash if fast, and debounce slightly
                // await new Promise(r => setTimeout(r, 500)); 

                const result = await fetchWeatherData(city);
                if (mounted) {
                    if (result) {
                        setData(result);
                        setError(false);
                    } else {
                        setError(true);
                    }
                }
            } catch (e) {
                if (mounted) setError(true);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        load();

        // Refresh every 30 minutes
        const interval = setInterval(load, 30 * 60 * 1000);

        return () => {
            mounted = false;
            clearInterval(interval);
        };
    }, [zone]);

    return { data, loading, error };
}
