import { ExternalLink, Footprints } from "lucide-react";

import { STRAVA_PROFILE_URL, type ActivityTotal, type StravaStats } from "@/lib/strava";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";

function miles(meters: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(meters / 1_609.344);
}

function movingTime(seconds: number) {
  const hours = Math.floor(seconds / 3_600);
  const minutes = Math.round((seconds % 3_600) / 60);
  return hours ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function Metric({ label, total, value }: { label: string; total: ActivityTotal; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
      <small>{total.count} activities</small>
    </div>
  );
}

export function StravaSnapshot({ stats }: { stats: StravaStats | null }) {
  return (
    <aside className="strava-snapshot" aria-labelledby="strava-title">
      <div className="strava-snapshot__header">
        <Footprints aria-hidden="true" size={18} strokeWidth={1.6} />
        <p>TRAINING LOG</p>
      </div>
      <h3 id="strava-title">Running, outside the classroom.</h3>
      {stats ? (
        <dl className="strava-snapshot__stats">
          <Metric label="YTD RUN" total={stats.yearToDateRun} value={`${miles(stats.yearToDateRun.distanceMeters)} mi`} />
          <Metric label="YTD TIME" total={stats.yearToDateRun} value={movingTime(stats.yearToDateRun.movingSeconds)} />
          <Metric label="ALL-TIME RUN" total={stats.allTimeRun} value={`${miles(stats.allTimeRun.distanceMeters)} mi`} />
        </dl>
      ) : null}
      <LiquidGlassButton asChild size="compact">
        <a className="strava-snapshot__link" href={STRAVA_PROFILE_URL} target="_blank" rel="noopener noreferrer">
          View Huy on Strava <ExternalLink aria-hidden="true" size={14} />
        </a>
      </LiquidGlassButton>
    </aside>
  );
}
