export type WeatherCondition =
  | "Sunny"
  | "Partly Cloudy"
  | "Cloudy"
  | "Rain"
  | "Thunderstorm"
  | "Snow"
  | "Clear";

export interface CurrentConditions {
  temp: number; // Celsius
  condition: WeatherCondition;
  high: number;
  low: number;
  feelsLike: number;
  humidity: number; // %
  windSpeed: number; // km/h
  pressure: number; // hPa
  visibility: number; // km
  uvIndex: number;
  isDay: boolean;
  sunrise: string;
  sunset: string;
}

export interface HourlyForecast {
  time: string;
  isoTime: string;
  temp: number;
  condition: WeatherCondition;
  precipChance: number;
}

export interface DailyForecast {
  day: string;
  high: number;
  low: number;
  condition: WeatherCondition;
  precipChance: number;
}

export interface AirQuality {
  aqi: number;
  label: string;
  description: string;
  pm25: number;
  pm10: number;
}

export interface MinutePrecip {
  time: string; // ISO
  precipitation: number; // mm
  weatherCode: number;
}

export interface RainAlert {
  id: string;
  startsAt: string; // ISO
  minutesUntil: number;
  intensityMm: number;
  location: string;
  message: string;
}

export interface WeatherData {
  location: string;
  latitude: number;
  longitude: number;
  current: CurrentConditions;
  hourly: HourlyForecast[];
  weekly: DailyForecast[];
  airQuality: AirQuality;
  minutely: MinutePrecip[];
  rainAlert: RainAlert | null;
}

export interface CityResult {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  label: string;
}
