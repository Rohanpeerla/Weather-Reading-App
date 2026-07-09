import { Clock } from "lucide-react";
import type { HourlyForecast as HourlyForecastType } from "../types";
import WeatherIcon from "./WeatherIcon";
import { formatTemp } from "../utils";

interface Props {
  hourly: HourlyForecastType[];
}

export default function HourlyForecast({ hourly }: Props) {
  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2 text-slate-700">
        <Clock className="h-5 w-5" />
        <h3 className="font-semibold">Hourly Forecast</h3>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 pt-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {hourly.map((hour, index) => (
          <div
            key={index}
            className="flex min-w-[4.5rem] flex-col items-center gap-2 rounded-2xl bg-white/60 p-3 shadow-sm transition-transform hover:-translate-y-1"
          >
            <p className="text-sm font-medium text-slate-600">{hour.time}</p>
            <WeatherIcon condition={hour.condition} className="h-10 w-10" />
            <p className="text-lg font-bold text-slate-800">{formatTemp(hour.temp)}</p>
            {hour.precipChance > 0 && (
              <p className="text-xs font-medium text-blue-600">{hour.precipChance}%</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
