import type { WeatherCondition } from "../types";

interface WeatherIconProps {
  condition: WeatherCondition;
  className?: string;
  isDay?: boolean;
}

export default function WeatherIcon({ condition, className = "w-24 h-24", isDay = true }: WeatherIconProps) {
  const common = `drop-shadow-md ${className}`;

  const effectiveCondition = condition === "Sunny" && !isDay ? "Clear" : condition;

  switch (effectiveCondition) {
    case "Sunny":
      return (
        <svg viewBox="0 0 64 64" className={common}>
          <g className="weather-spin" style={{ transformOrigin: "32px 32px" }}>
            <circle cx="32" cy="32" r="12" className="fill-amber-400" />
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1="32"
                y1="6"
                x2="32"
                y2="14"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                transform={`rotate(${i * 45} 32 32)`}
                className="text-amber-500"
              />
            ))}
          </g>
        </svg>
      );

    case "Partly Cloudy":
      return (
        <svg viewBox="0 0 64 64" className={common}>
          <g className="weather-spin" style={{ transformOrigin: "32px 32px" }}>
            <circle cx="32" cy="32" r="10" className="fill-amber-400" />
            {Array.from({ length: 8 }).map((_, i) => (
              <line
                key={i}
                x1="32"
                y1="8"
                x2="32"
                y2="15"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${i * 45} 32 32)`}
                className="text-amber-500"
              />
            ))}
          </g>
          <path
            d="M44 48h6c5.5 0 10-4.5 10-10s-4.5-10-10-10c-.7 0-1.3.1-2 .2C46.6 23.1 40.8 19 34 19c-8.8 0-16 7.2-16 16 0 .8.1 1.5.2 2.3C10.9 39.1 6 45 6 52c0 1.1.9 2 2 2h36"
            className="fill-white/90"
          />
        </svg>
      );

    case "Cloudy":
      return (
        <svg viewBox="0 0 64 64" className={common}>
          <path
            d="M18 46h28c5.5 0 10-4.5 10-10s-4.5-10-10-10c-.7 0-1.3.1-2 .2C41.6 21.1 35.8 17 29 17c-8.8 0-16 7.2-16 16 0 .8.1 1.5.2 2.3C5.9 37.1 1 43 1 50c0 1.1.9 2 2 2h15"
            className="fill-white/80 weather-drift"
          />
          <path
            d="M36 48h8c4.4 0 8-3.6 8-8s-3.6-8-8-8c-.5 0-1.1.1-1.6.2C41.3 27.3 36.6 24 31 24c-7 0-13 5.7-13 13 0 .6.1 1.2.2 1.8C11.8 40.7 8 45.3 8 51c0 .9.7 1.6 1.6 1.6H28"
            className="fill-slate-200/90 weather-drift-reverse"
          />
        </svg>
      );

    case "Rain":
      return (
        <svg viewBox="0 0 64 64" className={common}>
          <path
            d="M14 38h36c5.5 0 10-4.5 10-10s-4.5-10-10-10c-.7 0-1.3.1-2 .2C50.6 11.1 44.8 7 38 7c-8.8 0-16 7.2-16 16 0 .8.1 1.5.2 2.3C14.9 29.1 10 35 10 42c0 1.1.9 2 2 2h2"
            className="fill-slate-300"
          />
          <g className="text-blue-500">
            <line x1="22" y1="44" x2="19" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="weather-rain" style={{ animationDelay: "0s" }} />
            <line x1="32" y1="44" x2="29" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="weather-rain" style={{ animationDelay: "0.2s" }} />
            <line x1="42" y1="44" x2="39" y2="54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="weather-rain" style={{ animationDelay: "0.4s" }} />
          </g>
        </svg>
      );

    case "Thunderstorm":
      return (
        <svg viewBox="0 0 64 64" className={common}>
          <path
            d="M14 36h36c5.5 0 10-4.5 10-10s-4.5-10-10-10c-.7 0-1.3.1-2 .2C50.6 9.1 44.8 5 38 5c-8.8 0-16 7.2-16 16 0 .8.1 1.5.2 2.3C14.9 27.1 10 33 10 40c0 1.1.9 2 2 2h2"
            className="fill-slate-400"
          />
          <path
            d="M34 36L26 48h6l-4 14 14-14h-6l6-12H34z"
            className="fill-amber-400 weather-flash"
          />
        </svg>
      );

    case "Snow":
      return (
        <svg viewBox="0 0 64 64" className={common}>
          <path
            d="M14 38h36c5.5 0 10-4.5 10-10s-4.5-10-10-10c-.7 0-1.3.1-2 .2C50.6 11.1 44.8 7 38 7c-8.8 0-16 7.2-16 16 0 .8.1 1.5.2 2.3C14.9 29.1 10 35 10 42c0 1.1.9 2 2 2h2"
            className="fill-slate-200"
          />
          <g className="text-blue-200">
            {[
              { cx: 20, cy: 46 },
              { cx: 32, cy: 50 },
              { cx: 44, cy: 46 },
            ].map((p, i) => (
              <circle
                key={i}
                cx={p.cx}
                cy={p.cy}
                r="2.5"
                fill="currentColor"
                className="weather-snow"
                style={{ animationDelay: `${i * 0.3}s` }}
              />
            ))}
          </g>
        </svg>
      );

    case "Clear":
      return (
        <svg viewBox="0 0 64 64" className={common}>
          <path
            d="M38 16a12 12 0 1 1-16 16 12 12 0 1 0 16-16z"
            className="fill-slate-200 weather-float"
          />
          <circle cx="50" cy="14" r="1.5" className="fill-white weather-twinkle" style={{ animationDelay: "0s" }} />
          <circle cx="12" cy="20" r="1.5" className="fill-white weather-twinkle" style={{ animationDelay: "0.5s" }} />
          <circle cx="54" cy="40" r="1.5" className="fill-white weather-twinkle" style={{ animationDelay: "1s" }} />
          <circle cx="16" cy="50" r="1.5" className="fill-white weather-twinkle" style={{ animationDelay: "1.5s" }} />
        </svg>
      );

    default:
      return null;
  }
}
