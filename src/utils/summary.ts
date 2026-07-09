import type { WeatherData } from "../types";
import { formatTemp } from "../utils";

export function buildDailySummary(weather: WeatherData): string {
  const { current, hourly, weekly, airQuality, rainAlert, location } = weather;
  const nextHours = hourly.slice(0, 6);
  const maxPrecip = Math.max(...nextHours.map((h) => h.precipChance), 0);
  const peakTemp = Math.max(...nextHours.map((h) => h.temp), current.temp);
  const lowTemp = Math.min(...nextHours.map((h) => h.temp), current.temp);

  const parts: string[] = [];
  parts.push(
    `Right now in ${location.split(",")[0]} it's ${formatTemp(current.temp)}C and ${current.condition.toLowerCase()}.`
  );

  if (rainAlert) {
    parts.push(`Rain is expected in about ${Math.max(1, rainAlert.minutesUntil)} minutes — umbrella time.`);
  } else if (maxPrecip >= 50) {
    parts.push(`There's a ${maxPrecip}% chance of rain in the next few hours.`);
  } else {
    parts.push("No major rain expected in the next couple of hours.");
  }

  parts.push(
    `Near-term range looks like ${formatTemp(lowTemp)}–${formatTemp(peakTemp)}C, with today's high near ${formatTemp(current.high)}C.`
  );

  if (airQuality.aqi >= 101) {
    parts.push(`Air quality is ${airQuality.label.toLowerCase()} (AQI ${airQuality.aqi}).`);
  } else if (current.uvIndex >= 6) {
    parts.push(`UV is elevated at ${current.uvIndex} — sunscreen is a good idea.`);
  } else {
    parts.push(`Air quality is ${airQuality.label.toLowerCase()}.`);
  }

  const tomorrow = weekly[1];
  if (tomorrow) {
    parts.push(
      `Tomorrow (${tomorrow.day}): ${tomorrow.condition.toLowerCase()}, ${formatTemp(tomorrow.low)}–${formatTemp(tomorrow.high)}C.`
    );
  }

  return parts.join(" ");
}

export function buildShareText(weather: WeatherData): string {
  const { location, current, airQuality } = weather;
  return [
    `Weatherly · ${location}`,
    `${formatTemp(current.temp)}C · ${current.condition}`,
    `H ${formatTemp(current.high)} / L ${formatTemp(current.low)} · Feels like ${formatTemp(current.feelsLike)}C`,
    `Humidity ${current.humidity}% · Wind ${current.windSpeed} km/h · AQI ${airQuality.aqi} (${airQuality.label})`,
  ].join("\n");
}
