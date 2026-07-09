import type { WeatherCondition } from "../types";

interface Props {
  condition: WeatherCondition;
  isDay: boolean;
}

export default function WeatherAtmosphere({ condition, isDay }: Props) {
  const showRain = condition === "Rain" || condition === "Thunderstorm";
  const showSnow = condition === "Snow";
  const showStars = !isDay && !showRain;
  const showClouds = condition === "Cloudy" || condition === "Partly Cloudy" || condition === "Rain";
  const showSunGlow = isDay && (condition === "Sunny" || condition === "Partly Cloudy");

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {showSunGlow && (
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-amber-200/30 blur-3xl animate-pulse" />
      )}

      {showClouds &&
        Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`cloud-${i}`}
            className="absolute rounded-full bg-white/10 blur-2xl weather-cloud-float"
            style={{
              width: `${140 + i * 40}px`,
              height: `${50 + i * 12}px`,
              top: `${10 + i * 14}%`,
              left: `${-10 + i * 18}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: `${18 + i * 4}s`,
            }}
          />
        ))}

      {showRain &&
        Array.from({ length: 40 }).map((_, i) => (
          <span
            key={`rain-${i}`}
            className="absolute w-0.5 rounded-full bg-white/40 weather-bg-rain"
            style={{
              left: `${(i * 7.3) % 100}%`,
              top: `${-10 - (i % 5) * 8}%`,
              height: `${12 + (i % 4) * 6}px`,
              animationDelay: `${(i % 10) * 0.12}s`,
              animationDuration: `${0.7 + (i % 5) * 0.15}s`,
            }}
          />
        ))}

      {showSnow &&
        Array.from({ length: 28 }).map((_, i) => (
          <span
            key={`snow-${i}`}
            className="absolute rounded-full bg-white/80 weather-bg-snow"
            style={{
              left: `${(i * 9.1) % 100}%`,
              top: `${-8 - (i % 6) * 6}%`,
              width: `${3 + (i % 3)}px`,
              height: `${3 + (i % 3)}px`,
              animationDelay: `${(i % 8) * 0.25}s`,
              animationDuration: `${3 + (i % 5) * 0.6}s`,
            }}
          />
        ))}

      {showStars &&
        Array.from({ length: 24 }).map((_, i) => (
          <span
            key={`star-${i}`}
            className="absolute rounded-full bg-white weather-star"
            style={{
              left: `${(i * 13.7) % 100}%`,
              top: `${(i * 17.3) % 70}%`,
              width: `${1 + (i % 3)}px`,
              height: `${1 + (i % 3)}px`,
              animationDelay: `${(i % 6) * 0.4}s`,
            }}
          />
        ))}

      {condition === "Thunderstorm" && (
        <div className="absolute inset-0 bg-white/0 weather-lightning" />
      )}
    </div>
  );
}
