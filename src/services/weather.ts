import type {
  WeatherCondition,
  WeatherData,
  HourlyForecast,
  DailyForecast,
  CurrentConditions,
  CityResult,
  AirQuality,
  MinutePrecip,
} from "../types";
import { aqiFromPm25 } from "../utils";
import { findUpcomingRain, findUpcomingRainFromHourly } from "./rainAlerts";

function mapWeatherCode(code: number, isDay: boolean): WeatherCondition {
  if (code === 0) return isDay ? "Sunny" : "Clear";
  if (code === 1 || code === 2) return "Partly Cloudy";
  if (code === 3 || code === 45 || code === 48) return "Cloudy";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "Rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "Snow";
  if ([95, 96, 99].includes(code)) return "Thunderstorm";
  return "Cloudy";
}

function formatHourLabel(iso: string, index: number): string {
  if (index === 0) return "Now";
  const date = new Date(iso);
  return date.toLocaleTimeString("en-US", { hour: "numeric", hour12: true });
}

function formatDayLabel(iso: string, index: number): string {
  if (index === 0) return "Today";
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export async function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 12000,
      maximumAge: 5 * 60 * 1000,
    });
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  try {
    const geoRes = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (geoRes.ok) {
      const geo = await geoRes.json();
      const address = geo.address ?? {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.municipality ||
        address.county ||
        address.state_district ||
        "Your Location";
      const region = address.state || address.region || address.country || "";
      return region ? `${city}, ${region}` : city;
    }

    return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  } catch {
    return "Your Location";
  }
}

export async function searchCities(query: string): Promise<CityResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=6&language=en&format=json`
  );

  if (!res.ok) throw new Error("City search failed.");

  const data = await res.json();
  if (!data.results) return [];

  return data.results.map(
    (r: {
      id: number;
      name: string;
      country: string;
      admin1?: string;
      latitude: number;
      longitude: number;
    }) => ({
      id: r.id,
      name: r.name,
      country: r.country,
      admin1: r.admin1,
      latitude: r.latitude,
      longitude: r.longitude,
      label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
    })
  );
}

interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    weather_code: number;
    surface_pressure: number;
    wind_speed_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
    is_day: number[];
    visibility: number[];
    uv_index: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    uv_index_max: number[];
    sunrise: string[];
    sunset: string[];
  };
  minutely_15?: {
    time: string[];
    precipitation: number[];
    weather_code: number[];
  };
}

interface AirQualityResponse {
  current?: {
    european_aqi?: number;
    us_aqi?: number;
    pm2_5?: number;
    pm10?: number;
  };
}

async function fetchAirQuality(lat: number, lon: number): Promise<AirQuality> {
  try {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: "european_aqi,us_aqi,pm2_5,pm10",
      timezone: "auto",
    });
    const res = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${params}`);
    if (!res.ok) throw new Error("AQI failed");
    const data: AirQualityResponse = await res.json();
    const pm25 = data.current?.pm2_5 ?? 10;
    const base = aqiFromPm25(pm25);
    const aqi = Math.round(data.current?.us_aqi ?? data.current?.european_aqi ?? base.aqi);
    return {
      ...base,
      aqi,
      pm10: Math.round((data.current?.pm10 ?? 0) * 10) / 10,
    };
  } catch {
    return aqiFromPm25(12);
  }
}

export async function fetchWeather(
  lat: number,
  lon: number,
  locationName?: string
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "weather_code",
      "surface_pressure",
      "wind_speed_10m",
    ].join(","),
    hourly: [
      "temperature_2m",
      "precipitation_probability",
      "weather_code",
      "is_day",
      "visibility",
      "uv_index",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "uv_index_max",
      "sunrise",
      "sunset",
    ].join(","),
    minutely_15: "precipitation,weather_code",
    forecast_minutely_15: "8",
    timezone: "auto",
    forecast_days: "7",
  });

  const [weatherRes, location, airQuality] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`),
    locationName ? Promise.resolve(locationName) : reverseGeocode(lat, lon),
    fetchAirQuality(lat, lon),
  ]);

  if (!weatherRes.ok) {
    throw new Error("Failed to fetch weather data.");
  }

  const data: OpenMeteoResponse = await weatherRes.json();
  const now = new Date();
  const currentHourIndex = data.hourly.time.findIndex((t) => {
    const d = new Date(t);
    return d.getTime() >= now.getTime() - 30 * 60 * 1000;
  });
  const startHour = currentHourIndex >= 0 ? currentHourIndex : 0;

  const isDay = data.current.is_day === 1;
  const currentCode = data.current.weather_code;

  const current: CurrentConditions = {
    temp: Math.round(data.current.temperature_2m),
    condition: mapWeatherCode(currentCode, isDay),
    high: Math.round(data.daily.temperature_2m_max[0]),
    low: Math.round(data.daily.temperature_2m_min[0]),
    feelsLike: Math.round(data.current.apparent_temperature),
    humidity: Math.round(data.current.relative_humidity_2m),
    windSpeed: Math.round(data.current.wind_speed_10m),
    pressure: Math.round(data.current.surface_pressure),
    visibility: Math.round((data.hourly.visibility[startHour] ?? 10000) / 1000),
    uvIndex: Math.round(data.hourly.uv_index[startHour] ?? data.daily.uv_index_max[0] ?? 0),
    isDay,
    sunrise: data.daily.sunrise[0],
    sunset: data.daily.sunset[0],
  };

  const hourly: HourlyForecast[] = data.hourly.time
    .slice(startHour, startHour + 13)
    .map((time, i) => {
      const idx = startHour + i;
      const hourIsDay = data.hourly.is_day[idx] === 1;
      return {
        time: formatHourLabel(time, i),
        isoTime: time,
        temp: Math.round(data.hourly.temperature_2m[idx]),
        condition: mapWeatherCode(data.hourly.weather_code[idx], hourIsDay),
        precipChance: Math.round(data.hourly.precipitation_probability[idx] ?? 0),
      };
    });

  const weekly: DailyForecast[] = data.daily.time.map((time, i) => ({
    day: formatDayLabel(time, i),
    high: Math.round(data.daily.temperature_2m_max[i]),
    low: Math.round(data.daily.temperature_2m_min[i]),
    condition: mapWeatherCode(data.daily.weather_code[i], true),
    precipChance: Math.round(data.daily.precipitation_probability_max[i] ?? 0),
  }));

  const minutely: MinutePrecip[] = (data.minutely_15?.time ?? []).map((time, i) => ({
    time,
    precipitation: data.minutely_15?.precipitation?.[i] ?? 0,
    weatherCode: data.minutely_15?.weather_code?.[i] ?? 0,
  }));

  const rainAlert =
    findUpcomingRain(minutely, location) ?? findUpcomingRainFromHourly(hourly, location);

  return {
    location,
    latitude: lat,
    longitude: lon,
    current,
    hourly,
    weekly,
    airQuality,
    minutely,
    rainAlert,
  };
}
