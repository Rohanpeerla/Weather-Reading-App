import type { HourlyForecast } from "../types";
import { formatTemp } from "../utils";
import { TrendingUp } from "lucide-react";

interface Props {
  hourly: HourlyForecast[];
}

export default function TempTrend({ hourly }: Props) {
  if (hourly.length < 2) return null;

  const temps = hourly.map((h) => h.temp);
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = Math.max(max - min, 1);

  const width = 520;
  const height = 120;
  const padX = 16;
  const padY = 18;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = temps.map((temp, i) => {
    const x = padX + (i / (temps.length - 1)) * chartW;
    const y = padY + chartH - ((temp - min) / range) * chartH;
    return { x, y, temp, label: hourly[i].time };
  });

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const area = `${line} L ${points[points.length - 1].x} ${height - 4} L ${points[0].x} ${height - 4} Z`;

  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between gap-2 text-slate-700">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          <h3 className="font-semibold">Temperature Trend</h3>
        </div>
        <p className="text-sm text-slate-500">
          {formatTemp(min)} – {formatTemp(max)}
        </p>
      </div>

      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-32 w-full min-w-[320px]">
          <defs>
            <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#tempFill)" />
          <path d={line} fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" className="fill-white stroke-sky-500" strokeWidth="2" />
              {(i === 0 || i === points.length - 1 || i % 3 === 0) && (
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  className="fill-slate-700 text-[10px] font-semibold"
                >
                  {formatTemp(p.temp)}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-1 flex justify-between px-1 text-xs text-slate-500">
        <span>{hourly[0]?.time}</span>
        <span>{hourly[Math.floor(hourly.length / 2)]?.time}</span>
        <span>{hourly[hourly.length - 1]?.time}</span>
      </div>
    </div>
  );
}
