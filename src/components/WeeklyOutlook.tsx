import { Calendar } from "lucide-react";
import type { DailyForecast } from "../types";
import WeatherIcon from "./WeatherIcon";
import { formatTemp } from "../utils";

interface Props {
  weekly: DailyForecast[];
}

export default function WeeklyOutlook({ weekly }: Props) {
  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2 text-slate-700">
        <Calendar className="h-5 w-5" />
        <h3 className="font-semibold">7-Day Outlook</h3>
      </div>
      <div className="space-y-3">
        {weekly.map((day, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-2xl bg-white/60 p-3 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <p className="w-16 font-semibold text-slate-700">{day.day}</p>
              <WeatherIcon condition={day.condition} className="h-10 w-10" />
              <p className="hidden text-sm text-slate-600 sm:block">{day.condition}</p>
            </div>
            <div className="flex items-center gap-4">
              {day.precipChance > 0 && (
                <span className="text-xs font-medium text-blue-600">{day.precipChance}%</span>
              )}
              <div className="flex w-28 justify-end gap-2 font-semibold">
                <span className="text-slate-900">{formatTemp(day.high)}</span>
                <span className="text-slate-400">{formatTemp(day.low)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
