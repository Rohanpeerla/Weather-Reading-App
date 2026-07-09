import { useState } from "react";
import { BookOpenText, Copy, Check, Share2 } from "lucide-react";
import type { WeatherData } from "../types";
import { buildDailySummary, buildShareText } from "../utils/summary";

interface Props {
  weather: WeatherData;
}

export default function DailySummary({ weather }: Props) {
  const summary = buildDailySummary(weather);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildShareText(weather));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    const text = buildShareText(weather);
    if (navigator.share) {
      try {
        await navigator.share({ title: `Weatherly · ${weather.location}`, text });
        return;
      } catch {
        // fall through to copy
      }
    }
    await handleCopy();
  };

  return (
    <div className="rounded-3xl bg-white/80 p-6 shadow-xl backdrop-blur-md">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-700">
          <BookOpenText className="h-5 w-5 text-violet-600" />
          <h3 className="font-semibold">Today at a Glance</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-200"
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </button>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-slate-700 sm:text-base">{summary}</p>
    </div>
  );
}
