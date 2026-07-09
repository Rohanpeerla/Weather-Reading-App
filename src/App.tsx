import { useCallback, useEffect, useRef, useState } from "react";
import { MapPin, RefreshCw, AlertCircle, Loader2, LocateFixed } from "lucide-react";
import type { CityResult, RainAlert, WeatherData } from "./types";
import { SAMPLE_DATA } from "./data";
import { fetchWeather, getCurrentPosition } from "./services/weather";
import {
  findUpcomingRain,
  findUpcomingRainFromHourly,
  getNotificationPermission,
  markAlertSeen,
  requestNotificationPermission,
  showRainNotification,
} from "./services/rainAlerts";
import {
  isFavorite,
  loadFavorites,
  saveFavorites,
  toggleFavorite,
} from "./services/favorites";
import { backgroundForCondition } from "./utils";
import CurrentConditions from "./components/CurrentConditions";
import HourlyForecast from "./components/HourlyForecast";
import WeeklyOutlook from "./components/WeeklyOutlook";
import CitySearch from "./components/CitySearch";
import Insights from "./components/Insights";
import TempTrend from "./components/TempTrend";
import WeatherAtmosphere from "./components/WeatherAtmosphere";
import RainAlertBanner from "./components/RainAlertBanner";
import RainTimeline from "./components/RainTimeline";
import DailySummary from "./components/DailySummary";
import FavoritesBar from "./components/FavoritesBar";

type Status = "loading" | "ready" | "error";

const POLL_MS = 3 * 60 * 1000;

export default function App() {
  const [weather, setWeather] = useState<WeatherData>(SAMPLE_DATA);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usingSample, setUsingSample] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(
    getNotificationPermission()
  );
  const [bannerAlert, setBannerAlert] = useState<RainAlert | null>(null);
  const [dismissedAlertId, setDismissedAlertId] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<CityResult[]>(() => loadFavorites());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const weatherRef = useRef(weather);
  weatherRef.current = weather;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const processRainAlert = useCallback(
    (data: WeatherData) => {
      const alert =
        data.rainAlert ??
        findUpcomingRain(data.minutely, data.location) ??
        findUpcomingRainFromHourly(data.hourly, data.location);

      if (alert) {
        setBannerAlert((prev) => {
          if (dismissedAlertId && dismissedAlertId === alert.id) return prev;
          return alert;
        });

        if (getNotificationPermission() === "granted") {
          showRainNotification(alert);
        }
      } else {
        setBannerAlert(null);
      }
    },
    [dismissedAlertId]
  );

  const loadByCoords = useCallback(
    async (lat: number, lon: number, locationName?: string, silent = false) => {
      if (!silent) {
        setStatus("loading");
        setErrorMessage(null);
        setUsingSample(false);
      }

      try {
        const data = await fetchWeather(lat, lon, locationName);
        setWeather(data);
        setStatus("ready");
        setUsingSample(false);
        setLastUpdated(new Date());
        processRainAlert(data);
      } catch (err) {
        if (silent) return;
        const message = err instanceof Error ? err.message : "Unable to load weather data.";
        setWeather(SAMPLE_DATA);
        setUsingSample(true);
        setErrorMessage(message);
        setStatus("error");
        setLastUpdated(new Date());
        processRainAlert(SAMPLE_DATA);
      }
    },
    [processRainAlert]
  );

  const loadCurrentLocation = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);
    setUsingSample(false);

    try {
      const position = await getCurrentPosition();
      const { latitude, longitude } = position.coords;
      await loadByCoords(latitude, longitude);
    } catch (err) {
      const message =
        err instanceof GeolocationPositionError
          ? geolocationErrorMessage(err)
          : err instanceof Error
            ? err.message
            : "Unable to load weather for your location.";

      setWeather(SAMPLE_DATA);
      setUsingSample(true);
      setErrorMessage(message);
      setStatus("error");
      setLastUpdated(new Date());
      processRainAlert(SAMPLE_DATA);
    }
  }, [loadByCoords, processRainAlert]);

  useEffect(() => {
    loadCurrentLocation();
  }, [loadCurrentLocation]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = weatherRef.current;
      if (!current.latitude || !current.longitude) return;
      loadByCoords(current.latitude, current.longitude, current.location, true);
    }, POLL_MS);

    return () => window.clearInterval(timer);
  }, [loadByCoords]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = weatherRef.current;
      const alert =
        findUpcomingRain(current.minutely, current.location) ??
        findUpcomingRainFromHourly(current.hourly, current.location);

      if (alert) {
        setBannerAlert((prev) => {
          if (dismissedAlertId === alert.id) return prev;
          return alert;
        });
        if (getNotificationPermission() === "granted") {
          showRainNotification(alert);
        }
      } else {
        setBannerAlert(null);
      }
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, [dismissedAlertId]);

  const handleCitySelect = (city: CityResult) => {
    setDismissedAlertId(null);
    loadByCoords(city.latitude, city.longitude, city.label);
  };

  const handleToggleFavorite = () => {
    const city: CityResult = {
      id: Date.now(),
      name: weather.location.split(",")[0].trim(),
      country: weather.location.split(",").slice(-1)[0]?.trim() || "",
      admin1: weather.location.split(",")[1]?.trim(),
      latitude: weather.latitude,
      longitude: weather.longitude,
      label: weather.location,
    };
    const next = toggleFavorite(favorites, city);
    setFavorites(next);
    saveFavorites(next);
  };

  const handleRemoveFavorite = (city: CityResult) => {
    const next = favorites.filter(
      (f) =>
        !(Math.abs(f.latitude - city.latitude) < 0.01 && Math.abs(f.longitude - city.longitude) < 0.01)
    );
    setFavorites(next);
    saveFavorites(next);
  };

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    setPermission(result);

    if (result === "granted") {
      const current = weatherRef.current;
      const alert =
        current.rainAlert ??
        findUpcomingRain(current.minutely, current.location) ??
        findUpcomingRainFromHourly(current.hourly, current.location);

      if (alert) {
        setBannerAlert(alert);
        showRainNotification(alert);
      }
    }
  };

  const handleDismissAlert = () => {
    if (bannerAlert) {
      markAlertSeen(bannerAlert.id);
      setDismissedAlertId(bannerAlert.id);
    }
    setBannerAlert(null);
  };

  const bg = backgroundForCondition(weather.current.condition, weather.current.isDay);
  const notificationsEnabled = permission === "granted";
  const favorited = isFavorite(favorites, weather.latitude, weather.longitude);

  return (
    <div
      className={`relative min-h-screen overflow-hidden bg-gradient-to-br ${bg} p-4 text-slate-800 transition-colors duration-700 md:p-8`}
    >
      <WeatherAtmosphere condition={weather.current.condition} isDay={weather.current.isDay} />

      <div className="relative z-10 mx-auto max-w-5xl space-y-6">
        <header className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-white/90">
                <MapPin className="h-5 w-5" />
                <h1 className="text-lg font-semibold">
                  {status === "loading" ? "Updating weather…" : weather.location}
                </h1>
              </div>
              <p className="text-sm text-white/70">{today} · Temperatures in °C</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={loadCurrentLocation}
                disabled={status === "loading"}
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LocateFixed className="h-4 w-4" />
                My location
              </button>
              <button
                onClick={() => loadByCoords(weather.latitude, weather.longitude, weather.location)}
                disabled={status === "loading"}
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/30 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          <CitySearch onSelect={handleCitySelect} disabled={status === "loading"} />
          <FavoritesBar
            favorites={favorites}
            activeLabel={weather.location}
            onSelect={handleCitySelect}
            onRemove={handleRemoveFavorite}
          />
        </header>

        {(status === "ready" || status === "error") && (
          <RainAlertBanner
            alert={bannerAlert}
            permission={permission}
            enabled={notificationsEnabled}
            onEnable={handleEnableNotifications}
            onDismiss={handleDismissAlert}
          />
        )}

        {status === "loading" && (
          <div className="flex items-center justify-center gap-3 rounded-3xl bg-white/80 p-10 shadow-xl backdrop-blur-md">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <p className="font-medium text-slate-700">Fetching the latest conditions…</p>
          </div>
        )}

        {status === "error" && errorMessage && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50/95 p-4 text-amber-900 shadow-lg">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-semibold">Could not load live weather</p>
              <p className="text-amber-800/90">{errorMessage}</p>
              {usingSample && (
                <p className="text-amber-800/90">
                  Showing sample weather for {SAMPLE_DATA.location}. Search a city or allow location
                  access to try again.
                </p>
              )}
            </div>
          </div>
        )}

        {(status === "ready" || status === "error") && (
          <>
            <CurrentConditions
              data={weather.current}
              location={weather.location}
              isFavorite={favorited}
              onToggleFavorite={handleToggleFavorite}
              lastUpdated={lastUpdated}
            />
            <DailySummary weather={weather} />
            <RainTimeline minutely={weather.minutely} />
            <Insights
              current={weather.current}
              airQuality={weather.airQuality}
              precipChance={weather.hourly[0]?.precipChance ?? 0}
              condition={weather.current.condition}
            />
            <TempTrend hourly={weather.hourly} />
            <HourlyForecast hourly={weather.hourly} />
            <WeeklyOutlook weekly={weather.weekly} />
          </>
        )}
      </div>
    </div>
  );
}

function geolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location permission was denied. Please allow location access in your browser settings.";
    case error.POSITION_UNAVAILABLE:
      return "Your location could not be determined. Check that location services are enabled.";
    case error.TIMEOUT:
      return "Location request timed out. Please try again.";
    default:
      return "Unable to access your location.";
  }
}
