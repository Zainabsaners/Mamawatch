import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAssignment } from '../features/devices/hooks';
import { useTelemetryHistory as useTeleHistoryFetch, useAlertHistory as useAlertHistoryFetch } from '../features/telemetry/hooks';
import VitalCard from '../components/VitalCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChevronLeft, User, Activity, Thermometer, Wind, Beaker, HeartPulse, AlertCircle, Calendar } from 'lucide-react';
import { useTheme } from '../app/providers/ThemeProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { getHeartRateStatus, getSpo2Status, getTemperatureStatus } from '../lib/utils/vitals';
import { VITAL_STATUS } from '../constants/status';
import { formatIsoTimeOnly, formatRelativeTime } from '../lib/utils/date';
import { cn } from '../lib/utils';

export default function BabyDetails() {
  const { id: deviceKey } = useParams();
  const { isDarkMode } = useTheme();

  const { data: assignment, isLoading: isLoadingAssignment } = useAssignment(deviceKey);
  const { data: history = [], isLoading: isLoadingHistory } = useTeleHistoryFetch(deviceKey);
  const { data: alerts = [], isLoading: isLoadingAlerts } = useAlertHistoryFetch(deviceKey);

  const isLoading = isLoadingAssignment || isLoadingHistory || isLoadingAlerts;

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-12 w-1/3 mb-6" />
        <Skeleton className="h-32 w-full mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-36 w-full" />)}
        </div>
      </div>
    );
  }

  // Determine current stats from the most recent payload (index 0)
  const currentTelemetry = history[0];
  const infantName = assignment?.active ? `Patient ${assignment.newbornId}` : (currentTelemetry?.infant ? `${currentTelemetry.infant.firstName} ${currentTelemetry.infant.lastName}` : 'Unassigned Device');

  const hrStatus = getHeartRateStatus(currentTelemetry?.heartRateBpm);
  const tempStatus = getTemperatureStatus(currentTelemetry?.temperatureC);
  const spo2Status = getSpo2Status(currentTelemetry?.spo2Pct);

  const chartColor = isDarkMode ? '#94A3B8' : '#64748B';
  const chartData = [...history].reverse().map(h => ({
    time: formatIsoTimeOnly(h.receivedAt),
    heartRate: h.heartRateBpm,
    spo2: h.spo2Pct,
    temp: h.temperatureC
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <div className="flex items-start gap-4 mb-2">
        <Link to="/dashboard" className="mt-1 p-2 border border-[var(--color-border)] rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-[var(--color-text-muted)] bg-[var(--color-surface)]">
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-main)] flex items-center gap-3">
            <User size={24} className="text-[var(--color-primary)]" />
            {infantName}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] font-medium mt-1">
            Monitor: <span className="font-mono">{deviceKey}</span> • Assigned: {assignment?.active ? 'Yes' : 'No'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-1 h-auto">
          <TabsTrigger value="overview" className="py-2.5 px-6 rounded-xl font-semibold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-400 shadow-none data-[state=active]:shadow-sm transition-all">Overview</TabsTrigger>
          <TabsTrigger value="history" className="py-2.5 px-6 rounded-xl font-semibold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-400 shadow-none data-[state=active]:shadow-sm transition-all">Vitals History</TabsTrigger>
          <TabsTrigger value="alerts" className="py-2.5 px-6 rounded-xl font-semibold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 dark:data-[state=active]:bg-blue-900/30 dark:data-[state=active]:text-blue-400 shadow-none data-[state=active]:shadow-sm transition-all">
            Care Reports <span className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-full px-2 py-0.5 text-xs">{alerts.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 m-0">
          {(!currentTelemetry) && (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertTitle>No telemetry data</AlertTitle>
              <AlertDescription>This device has not transmitted any vitals recently.</AlertDescription>
            </Alert>
          )}

          {/* Critical Alerts Banner (Active at current snapshot) */}
          {hrStatus === VITAL_STATUS.ALERT && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300 shadow-sm animate-in slide-in-from-top-2 rounded-2xl">
              <HeartPulse className="h-5 w-5 text-rose-500 dark:text-rose-400 animate-pulse" />
              <AlertTitle className="text-lg font-bold">Heart Rate Review</AlertTitle>
              <AlertDescription className="font-medium mt-1">Heart rate is currently {currentTelemetry.heartRateBpm} bpm and needs attention.</AlertDescription>
            </Alert>
          )}

          {spo2Status === VITAL_STATUS.ALERT && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/50 dark:border-rose-900 dark:text-rose-300 shadow-sm animate-in slide-in-from-top-2 rounded-2xl">
              <Beaker className="h-5 w-5 text-rose-500 dark:text-rose-400 animate-pulse" />
              <AlertTitle className="text-lg font-bold">Oxygen Level Review</AlertTitle>
              <AlertDescription className="font-medium mt-1">Blood oxygen (SpO2) dropped to {currentTelemetry.spo2Pct}%.</AlertDescription>
            </Alert>
          )}

          {/* Vitals Grid */}
          <div>
            <h2 className="text-sm uppercase tracking-wider font-bold text-[var(--color-text-muted)] border-b border-[var(--color-border)] pb-2 mb-4">Current Telemetry</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <VitalCard title="Heart Rate" value={currentTelemetry?.heartRateBpm} unit="bpm" status={hrStatus} icon={HeartPulse} />
              <VitalCard title="Blood Oxygen" value={currentTelemetry?.spo2Pct} unit="%" status={spo2Status} icon={Activity} />
              <VitalCard title="Core Temp" value={currentTelemetry?.temperatureC} unit="°C" status={tempStatus} icon={Thermometer} />
              <VitalCard title="Conn. Quality" value={currentTelemetry ? "Strong" : "--"} unit="" status={VITAL_STATUS.NORMAL} icon={Wind} />
            </div>
            <p className="text-xs text-right text-[var(--color-text-muted)] mt-2 italic">
              Last transmission: {currentTelemetry ? formatRelativeTime(currentTelemetry.receivedAt) : 'N/A'}
            </p>
          </div>
        </TabsContent>

        <TabsContent value="history" className="m-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Heart Rate Chart */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6 text-[var(--color-text-muted)]">
                <HeartPulse size={18} className="text-[var(--color-primary)]" />
                <h3 className="text-sm uppercase tracking-wider font-bold text-[var(--color-text-main)]">Heart Rate History</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1F2937' : '#F1F5F9'} vertical={false} />
                    <XAxis dataKey="time" stroke={chartColor} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis domain={['auto', 'auto']} stroke={chartColor} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDarkMode ? '#1E293B' : '#FFF', borderColor: isDarkMode ? '#334155' : '#E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0094F7', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="heartRate" stroke="#7DD3FC" strokeWidth={4} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SpO2 Chart */}
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-5">
              <div className="flex items-center gap-2 mb-6 text-[var(--color-text-muted)]">
                <Activity size={18} className="text-emerald-500" />
                <h3 className="text-sm uppercase tracking-wider font-bold text-[var(--color-text-main)]">Oxygen Saturation (SpO2)</h3>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#1F2937' : '#F1F5F9'} vertical={false} />
                    <XAxis dataKey="time" stroke={chartColor} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis domain={[80, 100]} stroke={chartColor} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: isDarkMode ? '#1E293B' : '#FFF', borderColor: isDarkMode ? '#334155' : '#E2E8F0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
                    />
                    <Line type="monotone" dataKey="spo2" stroke="#6EE7B7" strokeWidth={4} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="m-0">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-sm p-5">
            {alerts.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-text-muted)]">
                <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
                <p className="text-lg font-semibold">No alerts recorded</p>
                <p className="text-sm">Patient vitals have remained within stable bounds.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 dark:border-gray-800 ml-4 pl-6 space-y-8">
                {alerts.map((alert) => (
                  <div key={alert.id} className="relative">
                    <div className={cn(
                      "absolute -left-[35px] w-4 h-4 rounded-full border-2 border-[var(--color-surface)] shadow",
                      alert.severity === 'critical' ? "bg-red-500" : "bg-amber-500"
                    )} />
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className={cn(
                          "uppercase tracking-wider font-bold text-xs",
                          alert.severity === 'critical' ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                        )}>
                          {alert.severity} Alert
                        </span>
                        <span className="text-xs font-semibold text-[var(--color-text-muted)] flex items-center gap-1">
                          <Calendar size={12} />
                          {formatRelativeTime(alert.receivedAt)}
                        </span>
                      </div>
                      <p className="text-[var(--color-text-main)] font-medium bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-[var(--color-border)] inline-block">
                        {alert.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// For empty state icon not imported
import { CheckCircle2 } from 'lucide-react';
