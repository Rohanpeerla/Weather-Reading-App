import type { CityResult } from "../types";

const STORAGE_KEY = "weatherly-favorites";

export function loadFavorites(): CityResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CityResult[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: CityResult[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites.slice(0, 8)));
  } catch {
    // ignore
  }
}

export function isFavorite(favorites: CityResult[], lat: number, lon: number): boolean {
  return favorites.some(
    (f) => Math.abs(f.latitude - lat) < 0.01 && Math.abs(f.longitude - lon) < 0.01
  );
}

export function toggleFavorite(favorites: CityResult[], city: CityResult): CityResult[] {
  if (isFavorite(favorites, city.latitude, city.longitude)) {
    return favorites.filter(
      (f) => !(Math.abs(f.latitude - city.latitude) < 0.01 && Math.abs(f.longitude - city.longitude) < 0.01)
    );
  }
  return [city, ...favorites].slice(0, 8);
}
