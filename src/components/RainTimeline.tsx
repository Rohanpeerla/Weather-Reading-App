import { CloudRain } from "lucide-react";
import type { MinutePrecip } from "../types";

interface Props {
  minutely: MinutePrecip[];
}

function intensityLabel(mm: number): string {
  if (mm <= 0) return "Dry";
  if (mm < 0.2) return "Drizzle";
  if (mm < 1) return "Light";
  if (mm < 2.5) return "Moderate";
  return "Heavy";
}

function barColor(mm: number): string {
  if (mm <= 0) return "bg-slate-200";
  if (mm < 0.2) return "bg-sky-200";
  if (mm < 1) return "bg-sky-400";
  if (mm < 2.5) return "bg-blue-500";
  return "bg-indigo-600";
}

export default function RainTimeline({ minutely }: Props) {
  if (!minutely.length) return null;

  const steps = minutely.slice(0, 8);
  const max = Math.max(...steps.map((s) => s.precipitation), 0.5);
  const wetSoon = steps.some((s) => s.precipitation > 0);

  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-md">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-700">
          <CloudRain className="h-5 w-5 text-sky-600" />
          <h3 className="font-semibold">Next 2 Hours Rain</h3>
        </div>
        <p className={`text-xs font-semibold ${wetSoon ? "text-sky-700" : "text-emerald-700"}`}>
          {wetSoon ? "Precipitation likely" : "Looks dry"}
        </p>
      </div>
      <p className="mb-4 text-sm text-slate-500">15-minute intensity forecast</p>

      <div className="flex items-end gap-2 sm:gap-3">
        {steps.map((step, i) => {
          const height = Math.max(8, Math.round((step.precipitation / max) * 88));
          const label = new Date(step.time).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          });
          return (
            <div key={step.time + i} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end justify-center">
                <div
                  className={`w-full max-w-[2.25rem] rounded-t-lg ${barColor(step.precipitation)} transition-all`}
                  style={{ height: `${height}px` }}
                  title={`${label}: ${step.precipitation.toFixed(1)} mm · ${intensityLabel(step.precipitation)}`}
                />
              </div>
              <p className="text-[10px] font-medium text-slate-500 sm:text-xs">{i === 0 ? "Now" : label}</p>
              <p className="text-[10px] font-semibold text-slate-700">{intensityLabel(step.precipitation)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
