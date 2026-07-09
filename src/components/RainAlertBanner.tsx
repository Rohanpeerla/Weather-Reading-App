import { Bell, BellOff, BellRing, CloudRain, X } from "lucide-react";
import type { RainAlert } from "../types";

interface Props {
  alert: RainAlert | null;
  permission: NotificationPermission | "unsupported";
  enabled: boolean;
  onEnable: () => void;
  onDismiss: () => void;
}

export default function RainAlertBanner({ alert, permission, enabled, onEnable, onDismiss }: Props) {
  return (
    <div className="space-y-3">
      {alert && (
        <div className="flex items-start gap-3 rounded-2xl border border-sky-200 bg-sky-50/95 p-4 text-sky-950 shadow-lg animate-[fadeIn_0.35s_ease]">
          <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
            <CloudRain className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">Rain starting soon</p>
            <p className="mt-1 text-sm text-sky-900/90">{alert.message}</p>
            <p className="mt-2 text-xs font-medium text-sky-700">
              Alert window: 15 minutes before rain begins
            </p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-full p-1 text-sky-700/70 transition hover:bg-sky-100 hover:text-sky-900"
            aria-label="Dismiss rain alert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl bg-white/20 p-4 text-white backdrop-blur-md ring-1 ring-white/20 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-white/15 p-2">
            {enabled ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
          </div>
          <div>
            <p className="font-semibold">Rain notifications</p>
            <p className="text-sm text-white/80">
              Get a browser alert ~15 minutes before rain starts at your selected location.
            </p>
            {permission === "denied" && (
              <p className="mt-1 text-xs text-amber-100">
                Notifications are blocked. Enable them in your browser site settings.
              </p>
            )}
            {permission === "unsupported" && (
              <p className="mt-1 text-xs text-amber-100">
                This browser does not support notifications.
              </p>
            )}
            {enabled && (
              <p className="mt-1 text-xs text-emerald-100">Notifications are on for this device.</p>
            )}
          </div>
        </div>

        {permission !== "unsupported" && permission !== "denied" && (
          <button
            type="button"
            onClick={onEnable}
            disabled={enabled}
            className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-white px-4 py-2 text-sm font-semibold text-sky-700 shadow transition hover:bg-sky-50 disabled:cursor-default disabled:bg-white/80 disabled:text-sky-600"
          >
            {enabled ? <BellRing className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            {enabled ? "Enabled" : "Enable alerts"}
          </button>
        )}

        {permission === "denied" && (
          <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white/90">
            <BellOff className="h-4 w-4" />
            Blocked
          </div>
        )}
      </div>
    </div>
  );
}
