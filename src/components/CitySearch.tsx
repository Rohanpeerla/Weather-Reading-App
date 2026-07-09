import { useEffect, useRef, useState } from "react";
import { Search, X, MapPin, Loader2 } from "lucide-react";
import type { CityResult } from "../types";
import { searchCities } from "../services/weather";

interface Props {
  onSelect: (city: CityResult) => void;
  disabled?: boolean;
}

export default function CitySearch({ onSelect, disabled }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityResult[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const cities = await searchCities(query);
        setResults(cities);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-md ring-1 ring-white/20 focus-within:ring-white/40">
        <Search className="h-4 w-4 shrink-0 text-white/80" />
        <input
          type="search"
          value={query}
          disabled={disabled}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search city…"
          className="w-full bg-transparent text-sm font-medium text-white placeholder:text-white/60 outline-none disabled:opacity-60"
        />
        {searching && <Loader2 className="h-4 w-4 animate-spin text-white/80" />}
        {query && !searching && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setOpen(false);
            }}
            className="rounded-full p-0.5 hover:bg-white/10"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-white/95 py-1 shadow-2xl backdrop-blur-md">
          {results.map((city) => (
            <li key={city.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(city);
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-sky-50"
              >
                <MapPin className="h-4 w-4 shrink-0 text-sky-500" />
                <span>
                  <span className="font-semibold text-slate-800">{city.name}</span>
                  <span className="text-slate-500">
                    {city.admin1 ? `, ${city.admin1}` : ""}
                    {city.country ? `, ${city.country}` : ""}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
