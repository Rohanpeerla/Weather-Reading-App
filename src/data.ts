import type { WeatherData } from "./types";

function hoursFromNow(hours: number): string {
  const d = new Date(Date.now() + hours * 60 * 60 * 1000);
  d.setMinutes(0, 0, 0);
  return d.toISOString();
}

function minutesFromNow(minutes: number): string {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

/** Fallback sample data used when geolocation or the weather API is unavailable. */
export const SAMPLE_DATA: WeatherData = {
  location: "San Francisco, CA",
  latitude: 37.7749,
  longitude: -122.4194,
  current: {
    temp: 18,
    condition: "Partly Cloudy",
    high: 21,
    low: 14,
    feelsLike: 17,
    humidity: 62,
    windSpeed: 14,
    pressure: 1015,
    visibility: 10,
    uvIndex: 5,
    isDay: true,
    sunrise: new Date().toISOString().slice(0, 10) + "T06:42",
    sunset: new Date().toISOString().slice(0, 10) + "T19:18",
  },
  hourly: [
    { time: "Now", isoTime: hoursFromNow(0), temp: 18, condition: "Partly Cloudy", precipChance: 5 },
    { time: "1 PM", isoTime: hoursFromNow(1), temp: 19, condition: "Sunny", precipChance: 0 },
    { time: "2 PM", isoTime: hoursFromNow(2), temp: 20, condition: "Sunny", precipChance: 0 },
    { time: "3 PM", isoTime: hoursFromNow(3), temp: 21, condition: "Partly Cloudy", precipChance: 5 },
    { time: "4 PM", isoTime: hoursFromNow(4), temp: 20, condition: "Partly Cloudy", precipChance: 10 },
    { time: "5 PM", isoTime: hoursFromNow(5), temp: 19, condition: "Cloudy", precipChance: 15 },
    { time: "6 PM", isoTime: hoursFromNow(6), temp: 17, condition: "Cloudy", precipChance: 20 },
    { time: "7 PM", isoTime: hoursFromNow(7), temp: 16, condition: "Rain", precipChance: 55 },
    { time: "8 PM", isoTime: hoursFromNow(8), temp: 15, condition: "Rain", precipChance: 70 },
    { time: "9 PM", isoTime: hoursFromNow(9), temp: 15, condition: "Rain", precipChance: 65 },
    { time: "10 PM", isoTime: hoursFromNow(10), temp: 14, condition: "Cloudy", precipChance: 30 },
    { time: "11 PM", isoTime: hoursFromNow(11), temp: 14, condition: "Cloudy", precipChance: 20 },
    { time: "12 AM", isoTime: hoursFromNow(12), temp: 13, condition: "Clear", precipChance: 5 },
  ],
  weekly: [
    { day: "Today", high: 21, low: 14, condition: "Partly Cloudy", precipChance: 10 },
    { day: "Tue", high: 20, low: 13, condition: "Sunny", precipChance: 0 },
    { day: "Wed", high: 18, low: 12, condition: "Rain", precipChance: 80 },
    { day: "Thu", high: 17, low: 11, condition: "Cloudy", precipChance: 25 },
    { day: "Fri", high: 19, low: 12, condition: "Partly Cloudy", precipChance: 15 },
    { day: "Sat", high: 22, low: 14, condition: "Sunny", precipChance: 0 },
    { day: "Sun", high: 21, low: 13, condition: "Thunderstorm", precipChance: 60 },
  ],
  airQuality: {
    aqi: 42,
    label: "Good",
    description: "Air quality is ideal for outdoor activities.",
    pm25: 8.2,
    pm10: 14.5,
  },
  minutely: [
    { time: minutesFromNow(0), precipitation: 0, weatherCode: 2 },
    { time: minutesFromNow(15), precipitation: 0, weatherCode: 2 },
    { time: minutesFromNow(30), precipitation: 0.2, weatherCode: 61 },
    { time: minutesFromNow(45), precipitation: 0.8, weatherCode: 61 },
    { time: minutesFromNow(60), precipitation: 1.2, weatherCode: 63 },
    { time: minutesFromNow(75), precipitation: 0.4, weatherCode: 61 },
    { time: minutesFromNow(90), precipitation: 0, weatherCode: 3 },
    { time: minutesFromNow(105), precipitation: 0, weatherCode: 2 },
  ],
  rainAlert: null,
};
