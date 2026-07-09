import { Star, X } from "lucide-react";
import type { CityResult } from "../types";

interface Props {
  favorites: CityResult[];
  activeLabel?: string;
  onSelect: (city: CityResult) => void;
  onRemove: (city: CityResult) => void;
}

export default function FavoritesBar({ favorites, activeLabel, onSelect, onRemove }: Props) {
  if (!favorites.length) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Saved places</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {favorites.map((city) => {
          const active = activeLabel === city.label;
          return (
            <div
              key={`${city.latitude}-${city.longitude}`}
              className={`flex shrink-0 items-center gap-1 rounded-full pl-3 pr-1 py-1 text-sm backdrop-blur-md ring-1 transition ${
                active
                  ? "bg-white text-sky-700 ring-white"
                  : "bg-white/15 text-white ring-white/20 hover:bg-white/25"
              }`}
            >
              <button type="button" onClick={() => onSelect(city)} className="flex items-center gap-1.5 font-medium">
                <Star className={`h-3.5 w-3.5 ${active ? "fill-amber-400 text-amber-400" : "text-amber-200"}`} />
                <span className="max-w-[10rem] truncate">{city.name}</span>
              </button>
              <button
                type="button"
                onClick={() => onRemove(city)}
                className={`rounded-full p-1 transition ${
                  active ? "hover:bg-sky-100 text-sky-600" : "hover:bg-white/15 text-white/80"
                }`}
                aria-label={`Remove ${city.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
