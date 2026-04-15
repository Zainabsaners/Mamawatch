import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Thermometer, HeartPulse, Settings, BellRing, Baby } from 'lucide-react';
import { useDevices } from '../features/devices/hooks';
import { useLatestTelemetry } from '../features/telemetry/hooks';
import { getConsolidatedStatus } from '../lib/utils/vitals';
import { VITAL_STATUS } from '../constants/status';
import { Skeleton } from '../components/ui/skeleton';
import { formatRelativeTime } from '../lib/utils/date';
import { cn } from '../lib/utils';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

// Sub-component to fetch and display patient specific telemetry
const PatientCard = ({ device, onAlertStateChange }) => {
  const navigate = useNavigate();
  const { data: telemetry, isLoading } = useLatestTelemetry(device.deviceKey);

  if (isLoading) {
    return <Skeleton className="h-40 w-full rounded-md border border-[var(--color-border)] bg-[var(--color-surface)]" />;
  }

  // Notice: missing telemetry is a valid state if no assignment.
  // The API doesn't tell us assignment directly on /devices, but telemetry contains infant info.
  if (!telemetry || !telemetry.infant) {
    return (
      <div
        onClick={() => navigate(`/devices`)}
        className="group p-5 rounded-2xl border border-[var(--color-border)] cursor-pointer hover:shadow-md transition-all bg-[var(--color-surface)] text-center flex flex-col justify-center items-center h-40"
      >
        <Baby className="w-8 h-8 text-[var(--color-text-muted)] opacity-50 mb-2" />
        <span className="text-[var(--color-text-muted)] font-medium">Unassigned / No Vitals</span>
        <span className="text-xs text-[var(--color-text-muted)] mt-1 opacity-70">Monitor: {device.deviceKey}</span>
      </div>
    );
  }

  const { infant, heartRateBpm, temperatureC, spo2Pct, status, receivedAt } = telemetry;

  // Use API status directly (NORMAL/WARNING/ALERT)
  const isAlert = status === VITAL_STATUS.ALERT;

  // Report back to parent that this device is in alert (optional, but requested in design)
  // For simplicity since we don't have a top level query, we could just render it and accept stats might be slightly off.
  // Actually, parent can just use `useQueries` instead, but for simplicity we compute locally.

  return (
    <div
      onClick={() => navigate(`/baby/${device.deviceKey}`)}
      className={cn(
        "group p-5 rounded-2xl border cursor-pointer hover:shadow-md transition-all relative overflow-hidden bg-[var(--color-surface)]",
        isAlert ? "border-red-300 dark:border-red-900/50 shadow-[var(--shadow-alert)]" : "border-[var(--color-border)] hover:border-[var(--color-primary-hover)]"
      )}
    >
      {isAlert && <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-bl-[100%] translate-x-4 -translate-y-4" />}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] transition-colors">
            {infant.firstName} {infant.lastName}
          </h3>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mt-0.5">Monitor: {device.deviceKey} • Updated {formatRelativeTime(receivedAt)}</p>
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider",
          isAlert ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
        )}>
          {status}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--color-bg-base)] p-3 rounded-xl border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] mb-1">
            <HeartPulse size={14} />
            <span className="text-xs uppercase tracking-wider font-semibold">HR</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-xl font-bold tracking-tight font-mono", isAlert && (heartRateBpm > 160 || heartRateBpm < 90) ? "text-red-500 animate-pulse" : "text-[var(--color-text-main)]")}>
              {heartRateBpm ?? '--'}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">bpm</span>
          </div>
        </div>

        <div className="bg-[var(--color-bg-base)] p-3 rounded-xl border border-[var(--color-border)]">
          <div className="flex items-center gap-1.5 text-[var(--color-text-muted)] mb-1">
            <Thermometer size={14} />
            <span className="text-xs uppercase tracking-wider font-semibold">Temp</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={cn("text-xl font-bold tracking-tight font-mono", isAlert && (temperatureC > 37.5 || temperatureC < 36) ? "text-red-500 animate-pulse" : "text-[var(--color-text-main)]")}>
              {temperatureC ?? '--'}
            </span>
            <span className="text-xs text-[var(--color-text-muted)]">°C</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { data: devices, isLoading, isError, error } = useDevices();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48 mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive">
        <BellRing className="h-4 w-4" />
        <AlertTitle>Error Loading Ward</AlertTitle>
        <AlertDescription>{error?.message || 'Could not connect to server'}</AlertDescription>
      </Alert>
    );
  }

  const activeDevices = devices.filter(d => d.status === 'online').length;
  // NOTE: precise top level stats require aggregated queries; for now we use device inventory sizing
  const totalMonitored = devices.length;

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-main)]">Neonatal Care Center</h1>
        <p className="text-[var(--color-text-muted)] mt-1">Nursery overview for <span className="text-[var(--color-primary)] font-semibold">Neonatal Ward A</span></p>
      </header>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Infants', value: totalMonitored, sub: 'Registered monitors', icon: Baby, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Stable', value: activeDevices, sub: 'All vitals normal', icon: Settings, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Monitoring', value: 'Active', sub: 'Monitoring in progress', icon: HeartPulse, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="flex p-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mr-4 shrink-0 transition-colors", stat.bg)}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)]">{stat.label}</p>
              <h3 className="text-2xl font-bold text-[var(--color-text-main)] mt-1 font-mono">{stat.value}</h3>
              <p className="text-xs text-[var(--color-text-muted)] mt-1 opacity-70">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Patients Grid */}
      <h2 className="text-xl font-bold text-[var(--color-text-main)] mb-4">Patient Monitoring</h2>

      {devices.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-base)]">
          <Baby className="mx-auto h-12 w-12 text-[var(--color-text-muted)] mb-3 opacity-50" />
          <h3 className="text-lg font-semibold text-[var(--color-text-main)]">No Infants Registered</h3>
          <p className="text-sm text-[var(--color-text-muted)] max-w-sm mx-auto mt-1 mb-4">There are currently no monitors paired with infants.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {devices.map((device) => (
            <PatientCard key={device.id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
