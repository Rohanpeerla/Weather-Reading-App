import { Sunrise, Sunset, Wind, Sparkles } from "lucide-react";
import type { AirQuality, CurrentConditions, WeatherCondition } from "../types";
import { aqiColor, formatTime, getActivityTip, getOutfitTip } from "../utils";

interface Props {
  current: CurrentConditions;
  airQuality: AirQuality;
  precipChance: number;
  condition: WeatherCondition;
}

export default function Insights({ current, airQuality, precipChance, condition }: Props) {
  const outfit = getOutfitTip(current.temp, condition, current.uvIndex);
  const activity = getActivityTip(condition, airQuality.label, precipChance);
  const aqiClass = aqiColor(airQuality.label);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2 text-slate-700">
          <Sunrise className="h-5 w-5 text-amber-500" />
          <h3 className="font-semibold">Sun & Air</h3>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-4">
            <div className="mb-1 flex items-center gap-2 text-amber-700">
              <Sunrise className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Sunrise</span>
            </div>
            <p className="text-xl font-bold text-slate-800">{formatTime(current.sunrise)}</p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 p-4">
            <div className="mb-1 flex items-center gap-2 text-indigo-700">
              <Sunset className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Sunset</span>
            </div>
            <p className="text-xl font-bold text-slate-800">{formatTime(current.sunset)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white/70 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Air Quality</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900">{airQuality.aqi}</p>
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${aqiClass}`}>
                {airQuality.label}
              </span>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p>PM2.5: {airQuality.pm25} µg/m³</p>
              <p className="mt-1">PM10: {airQuality.pm10} µg/m³</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-600">{airQuality.description}</p>
        </div>
      </div>

      <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2 text-slate-700">
          <Sparkles className="h-5 w-5 text-violet-500" />
          <h3 className="font-semibold">Today&apos;s Tips</h3>
        </div>

        <div className="space-y-3">
          <TipCard emoji={outfit.emoji} title={outfit.title} tip={outfit.tip} />
          <TipCard emoji={activity.emoji} title={activity.title} tip={activity.tip} />
          <div className="flex items-start gap-3 rounded-2xl bg-sky-50/80 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
              <Wind className="h-5 w-5 text-teal-500" />
            </div>
            <div>
              <p className="font-semibold text-slate-800">Comfort check</p>
              <p className="mt-1 text-sm text-slate-600">
                Feels like {current.feelsLike}°C with {current.humidity}% humidity and {current.windSpeed}{" "}
                km/h winds.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TipCard({ emoji, title, tip }: { emoji: string; title: string; tip: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/70 p-4 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-sky-100 text-xl shadow-sm">
        {emoji}
      </div>
      <div>
        <p className="font-semibold text-slate-800">{title}</p>
        <p className="mt-1 text-sm text-slate-600">{tip}</p>
      </div>
    </div>
  );
}
