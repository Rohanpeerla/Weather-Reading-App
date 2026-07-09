import type { AirQuality, WeatherCondition } from "./types";

export function formatTemp(celsius: number): string {
  return `${Math.round(celsius)}°`;
}

export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

export function formatDistance(km: number): string {
  return `${Math.round(km)} km`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function aqiFromPm25(pm25: number): AirQuality {
  let aqi: number;
  let label: string;
  let description: string;

  if (pm25 <= 12) {
    aqi = Math.round((50 / 12) * pm25);
    label = "Good";
    description = "Air quality is ideal for outdoor activities.";
  } else if (pm25 <= 35.4) {
    aqi = Math.round(((100 - 51) / (35.4 - 12.1)) * (pm25 - 12.1) + 51);
    label = "Moderate";
    description = "Sensitive people should limit prolonged outdoor exertion.";
  } else if (pm25 <= 55.4) {
    aqi = Math.round(((150 - 101) / (55.4 - 35.5)) * (pm25 - 35.5) + 101);
    label = "Unhealthy for Sensitive Groups";
    description = "Children and people with lung issues should reduce outdoor time.";
  } else if (pm25 <= 150.4) {
    aqi = Math.round(((200 - 151) / (150.4 - 55.5)) * (pm25 - 55.5) + 151);
    label = "Unhealthy";
    description = "Everyone may begin to experience health effects outdoors.";
  } else if (pm25 <= 250.4) {
    aqi = Math.round(((300 - 201) / (250.4 - 150.5)) * (pm25 - 150.5) + 201);
    label = "Very Unhealthy";
    description = "Health alert: avoid outdoor activities if possible.";
  } else {
    aqi = Math.min(500, Math.round(((500 - 301) / (500 - 250.5)) * (pm25 - 250.5) + 301));
    label = "Hazardous";
    description = "Emergency conditions — stay indoors with filtered air.";
  }

  return {
    aqi: Math.max(0, Math.min(500, aqi)),
    label,
    description,
    pm25: Math.round(pm25 * 10) / 10,
    pm10: 0,
  };
}

export function aqiColor(label: string): string {
  switch (label) {
    case "Good":
      return "text-emerald-600 bg-emerald-100";
    case "Moderate":
      return "text-yellow-700 bg-yellow-100";
    case "Unhealthy for Sensitive Groups":
      return "text-orange-700 bg-orange-100";
    case "Unhealthy":
      return "text-red-700 bg-red-100";
    case "Very Unhealthy":
      return "text-purple-700 bg-purple-100";
    default:
      return "text-rose-800 bg-rose-200";
  }
}

export function getOutfitTip(temp: number, condition: WeatherCondition, uvIndex: number): {
  title: string;
  tip: string;
  emoji: string;
} {
  if (condition === "Rain" || condition === "Thunderstorm") {
    return {
      title: "Bring a waterproof layer",
      tip: "Rain is expected — pack an umbrella and water-resistant shoes.",
      emoji: "☔",
    };
  }
  if (condition === "Snow") {
    return {
      title: "Bundle up for snow",
      tip: "Wear insulated boots, gloves, and layers that trap heat.",
      emoji: "🧣",
    };
  }
  if (temp <= 5) {
    return {
      title: "Cold-weather gear",
      tip: "Coat, scarf, and warm layers recommended for this chill.",
      emoji: "🧥",
    };
  }
  if (temp <= 12) {
    return {
      title: "Light jacket weather",
      tip: "A sweater or light jacket should keep you comfortable outside.",
      emoji: "🧶",
    };
  }
  if (temp <= 20) {
    return {
      title: "Perfect for layers",
      tip: "Long sleeves or a light cardigan work well for mild temps.",
      emoji: "👕",
    };
  }
  if (temp <= 28) {
    if (uvIndex >= 6) {
      return {
        title: "Sunny & warm",
        tip: "Light clothing plus sunscreen and sunglasses recommended.",
        emoji: "🕶️",
      };
    }
    return {
      title: "Warm day vibes",
      tip: "Breathable fabrics and a water bottle will keep you cool.",
      emoji: "🥤",
    };
  }
  return {
    title: "Hot day ahead",
    tip: "Wear light colors, stay hydrated, and seek shade mid-day.",
    emoji: "🥵",
  };
}

export function getActivityTip(condition: WeatherCondition, aqiLabel: string, precipChance: number): {
  title: string;
  tip: string;
  emoji: string;
} {
  if (aqiLabel.includes("Unhealthy") || aqiLabel === "Hazardous" || aqiLabel === "Very Unhealthy") {
    return {
      title: "Indoor day preferred",
      tip: "Air quality is poor — plan indoor workouts or coffee-shop hangs.",
      emoji: "🏠",
    };
  }
  if (condition === "Thunderstorm") {
    return {
      title: "Stay weather-aware",
      tip: "Thunderstorms possible — keep outdoor plans flexible and check radar.",
      emoji: "⚡",
    };
  }
  if (condition === "Rain" || precipChance >= 50) {
    return {
      title: "Cozy indoor plans",
      tip: "Great day for museums, cafes, or a movie if you want to stay dry.",
      emoji: "🎬",
    };
  }
  if (condition === "Snow") {
    return {
      title: "Winter adventure",
      tip: "Fresh snow — ideal for a short walk or snow photos if roads are safe.",
      emoji: "❄️",
    };
  }
  if (condition === "Sunny" || condition === "Clear") {
    return {
      title: "Get outside",
      tip: "Clear skies make this a great window for a walk, picnic, or outdoor coffee.",
      emoji: "🚶",
    };
  }
  return {
    title: "Easy outdoor day",
    tip: "Mild conditions — a good day for errands, parks, or a casual bike ride.",
    emoji: "🌿",
  };
}

export function backgroundForCondition(condition: WeatherCondition, isDay: boolean): string {
  if (!isDay) {
    if (condition === "Rain" || condition === "Thunderstorm") {
      return "from-slate-900 via-indigo-950 to-slate-800";
    }
    if (condition === "Snow") {
      return "from-slate-800 via-blue-950 to-indigo-900";
    }
    return "from-indigo-950 via-slate-900 to-blue-950";
  }

  switch (condition) {
    case "Sunny":
      return "from-sky-400 via-blue-400 to-cyan-500";
    case "Partly Cloudy":
      return "from-sky-400 via-blue-500 to-indigo-500";
    case "Cloudy":
      return "from-slate-400 via-slate-500 to-blue-600";
    case "Rain":
      return "from-slate-500 via-blue-700 to-indigo-800";
    case "Thunderstorm":
      return "from-slate-700 via-indigo-800 to-purple-900";
    case "Snow":
      return "from-slate-300 via-sky-300 to-blue-500";
    case "Clear":
      return "from-indigo-900 via-slate-900 to-blue-950";
    default:
      return "from-sky-400 via-blue-500 to-indigo-600";
  }
}
