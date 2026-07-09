import type { MinutePrecip, RainAlert, WeatherCondition } from "../types";

const STORAGE_KEY = "weatherly-rain-notified";
const RAIN_THRESHOLD_MM = 0.1;
const ALERT_WINDOW_MINUTES = 15;

function isWetCode(code: number): boolean {
  // WMO: drizzle, rain, freeezing rain, showers, thunderstorm
  return (
    (code >= 51 && code <= 67) ||
    (code >= 80 && code <= 82) ||
    (code >= 95 && code <= 99)
  );
}

function loadNotifiedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function saveNotifiedIds(ids: Set<string>) {
  try {
    // Keep only recent IDs to avoid unbounded growth
    const list = Array.from(ids).slice(-40);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore storage errors
  }
}

export function notificationsSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!notificationsSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  if (Notification.permission === "granted" || Notification.permission === "denied") {
    return Notification.permission;
  }
  return Notification.requestPermission();
}

export function findUpcomingRain(
  minutely: MinutePrecip[],
  location: string,
  now = new Date()
): RainAlert | null {
  if (!minutely.length) return null;

  // Find first future wet step after currently dry conditions
  let currentlyRaining = false;
  const first = minutely[0];
  if (first) {
    const firstAge = (now.getTime() - new Date(first.time).getTime()) / 60000;
    // Treat near-current step as "now"
    if (firstAge <= 10 && (first.precipitation >= RAIN_THRESHOLD_MM || isWetCode(first.weatherCode))) {
      currentlyRaining = true;
    }
  }

  if (currentlyRaining) return null;

  for (const step of minutely) {
    const startsAt = new Date(step.time);
    const minutesUntil = Math.round((startsAt.getTime() - now.getTime()) / 60000);

    // Alert only for rain starting within the next 15 minutes (and not in the past)
    if (minutesUntil < 0) continue;
    if (minutesUntil > ALERT_WINDOW_MINUTES) break;

    const wet = step.precipitation >= RAIN_THRESHOLD_MM || isWetCode(step.weatherCode);
    if (!wet) continue;

    const id = `${location}|${step.time}`;
    const when =
      minutesUntil <= 1
        ? "in about a minute"
        : `in about ${minutesUntil} minutes`;

    const intensity =
      step.precipitation >= 2.5
        ? "Heavy rain"
        : step.precipitation >= 0.5
          ? "Moderate rain"
          : "Light rain";

    return {
      id,
      startsAt: step.time,
      minutesUntil: Math.max(0, minutesUntil),
      intensityMm: step.precipitation,
      location,
      message: `${intensity} expected ${when} near ${location}. Grab an umbrella!`,
    };
  }

  return null;
}

/** Fallback when minutely data is unavailable: use next hourly rain step. */
export function findUpcomingRainFromHourly(
  hourly: { isoTime: string; condition: WeatherCondition; precipChance: number }[],
  location: string,
  now = new Date()
): RainAlert | null {
  if (!hourly.length) return null;

  const first = hourly[0];
  if (first && (first.condition === "Rain" || first.condition === "Thunderstorm")) {
    return null; // already raining
  }

  for (const hour of hourly.slice(1)) {
    const startsAt = new Date(hour.isoTime);
    const minutesUntil = Math.round((startsAt.getTime() - now.getTime()) / 60000);
    if (minutesUntil < 0) continue;
    if (minutesUntil > ALERT_WINDOW_MINUTES) break;

    const wet =
      hour.condition === "Rain" ||
      hour.condition === "Thunderstorm" ||
      hour.precipChance >= 60;

    if (!wet) continue;

    const id = `${location}|${hour.isoTime}`;
    return {
      id,
      startsAt: hour.isoTime,
      minutesUntil: Math.max(0, minutesUntil),
      intensityMm: hour.precipChance / 100,
      location,
      message: `Rain may start in about ${Math.max(1, minutesUntil)} minutes near ${location}. Grab an umbrella!`,
    };
  }

  return null;
}

export function showRainNotification(alert: RainAlert): boolean {
  if (!notificationsSupported()) return false;
  if (Notification.permission !== "granted") return false;

  const notified = loadNotifiedIds();
  if (notified.has(alert.id)) return false;

  try {
    const notification = new Notification("Rain alert — Weatherly", {
      body: alert.message,
      tag: alert.id,
      icon: "/favicon.ico",
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    notified.add(alert.id);
    saveNotifiedIds(notified);
    return true;
  } catch {
    return false;
  }
}

export function markAlertSeen(alertId: string) {
  const notified = loadNotifiedIds();
  notified.add(alertId);
  saveNotifiedIds(notified);
}
