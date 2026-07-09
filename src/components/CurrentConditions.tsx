import { Wind, Droplets, Eye, Gauge, Thermometer, Sun, Star } from "lucide-react";
import type { CurrentConditions as CurrentConditionsType } from "../types";
import WeatherIcon from "./WeatherIcon";
import { formatDistance, formatSpeed, formatTemp } from "../utils";

interface Props {
  data: CurrentConditionsType;
  location: string;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  lastUpdated?: Date | null;
}

export default function CurrentConditions({
  data,
  location,
  isFavorite,
  onToggleFavorite,
  lastUpdated,
}: Props) {
  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-md md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium uppercase tracking-wider text-slate-500">Current Weather</p>
            {onToggleFavorite && (
              <button
                type="button"
                onClick={onToggleFavorite}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-500"
                aria-label={isFavorite ? "Remove from favorites" : "Save to favorites"}
                title={isFavorite ? "Remove from favorites" : "Save to favorites"}
              >
                <Star className={`h-4 w-4 ${isFavorite ? "fill-amber-400 text-amber-400" : ""}`} />
              </button>
            )}
          </div>
          <h2 className="text-2xl font-bold text-slate-800">{location}</h2>
          <p className="text-slate-600">{data.condition}</p>
          {lastUpdated && (
            <p className="text-xs text-slate-400">
              Updated {lastUpdated.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <WeatherIcon condition={data.condition} isDay={data.isDay} className="h-20 w-20 md:h-24 md:w-24" />
          <div>
            <p className="text-6xl font-extrabold tracking-tight text-slate-900">
              {formatTemp(data.temp)}
              <span className="ml-1 text-3xl font-semibold text-slate-500">C</span>
            </p>
            <p className="text-slate-600">
              H: {formatTemp(data.high)} · L: {formatTemp(data.low)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-3">
        <DetailItem icon={<Thermometer className="h-5 w-5 text-rose-500" />} label="Feels Like" value={formatTemp(data.feelsLike)} />
        <DetailItem icon={<Droplets className="h-5 w-5 text-blue-500" />} label="Humidity" value={`${data.humidity}%`} />
        <DetailItem icon={<Wind className="h-5 w-5 text-teal-500" />} label="Wind" value={formatSpeed(data.windSpeed)} />
        <DetailItem icon={<Gauge className="h-5 w-5 text-purple-500" />} label="Pressure" value={`${data.pressure} hPa`} />
        <DetailItem icon={<Eye className="h-5 w-5 text-amber-500" />} label="Visibility" value={formatDistance(data.visibility)} />
        <DetailItem icon={<Sun className="h-5 w-5 text-orange-500" />} label="UV Index" value={`${data.uvIndex} of 11`} />
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="rounded-xl bg-white p-2 shadow-sm">{icon}</div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="font-semibold text-slate-800">{value}</p>
      </div>
    </div>
  );
}
