import React, { useState } from 'react';
import { Wifi, Battery, CheckCircle2, AlertTriangle, MonitorSmartphone, PowerOff, MoreVertical, Baby } from 'lucide-react';
import { useDevices, useAssignment, useUnassignDevice, useGenerateCredentials } from '../features/devices/hooks';
import { DEVICE_STATUS } from '../constants/status';
import { Skeleton } from '../components/ui/skeleton';
import { AssignDeviceModal } from '../components/AssignDeviceModal';
import { cn } from '../lib/utils';
import { formatRelativeTime } from '../lib/utils/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Button } from '../components/ui/button';
import { useAuth } from '../features/auth/hooks';

const DeviceRow = ({ device, onAssign }) => {
  const { data: assignment, isLoading: isAssignmentLoading } = useAssignment(device.deviceKey);
  const { mutate: unassignDevice, isPending: isUnassigning } = useUnassignDevice();
  const { mutate: generateCreds, isPending: isGenCreds } = useGenerateCredentials();
  const { user } = useAuth();

  const isActive = device.status === DEVICE_STATUS.ONLINE;
  const isWarning = false;
  const isOffline = device.status === DEVICE_STATUS.OFFLINE;
  // Note: we don't have battery from API yet, mocking display via fallback

  const handleUnassign = () => {
    if (confirm(`Unassign ${device.deviceKey}?`)) {
      unassignDevice({ deviceKey: device.deviceKey, data: { reason: 'manual' } });
    }
  };

  const handleGenerateCredentials = () => {
    generateCreds({ deviceKey: device.deviceKey }, {
      onSuccess: (data) => {
        // In a real app we would present this in a modal copy to clipboard. Using prompt for quick hackathon hack
        prompt(`Credentials for ${device.deviceKey}. PLEASE SAVE SECRET NOW:`, data.secret);
      }
    });
  };

  return (
    <TableRow className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
      <TableCell className="px-6 border-b-0 py-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded", isActive ? "bg-emerald-100 text-emerald-600" : isWarning ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-500 dark:bg-gray-800")}>
            {isActive ? <CheckCircle2 size={16} /> : isOffline ? <PowerOff size={16} /> : <AlertTriangle size={16} />}
          </div>
          <span className="font-bold font-mono text-[var(--color-text-main)] text-sm">{device.deviceKey}</span>
        </div>
      </TableCell>
      <TableCell className="px-6 border-b-0 py-4 text-sm text-[var(--color-text-muted)]">
        {device.name} <br /> <span className="text-xs opacity-70">{device.location}</span>
      </TableCell>
      <TableCell className="px-6 border-b-0 py-4">
        <span className={cn(
          "px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider",
          isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
            isWarning ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
              "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
        )}>
          {device.status}
        </span>
      </TableCell>
      <TableCell className="px-6 border-b-0 py-4">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">{device.lastSeenAt ? formatRelativeTime(device.lastSeenAt) : 'Never'}</span>
      </TableCell>
      <TableCell className="px-6 border-b-0 py-4">
        {isAssignmentLoading ? (
          <Skeleton className="h-4 w-20" />
        ) : assignment?.active ? (
          <span className="text-sm font-bold text-[var(--color-primary)]">
            {assignment.newbornId}
          </span>
        ) : (
          <span className="text-sm text-gray-400 italic">Unassigned</span>
        )}
      </TableCell>
      <TableCell className="px-6 border-b-0 py-4 text-right">
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4 text-[var(--color-text-muted)]" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {assignment?.active ? (
              <DropdownMenuItem onClick={handleUnassign} className="text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20 focus:text-rose-600">
                Unassign Infant
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => onAssign(device)}>
                Assign Infant
              </DropdownMenuItem>
            )}
            {user?.role === 'admin' && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleGenerateCredentials}>
                  Generate Credentials
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
};

export default function Devices() {
  const { data: devices, isLoading } = useDevices();
  const [assigningDevice, setAssigningDevice] = useState(null);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-main)] flex items-center gap-3">
          <Baby className="text-[var(--color-primary)]" size={32} />
          Infant Monitors
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">Monitor connectivity and infant assignment status.</p>
      </header>

      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : devices?.length === 0 ? (
          <div className="p-12 text-center text-[var(--color-text-muted)]">
            <Baby className="mx-auto h-12 w-12 opacity-20 mb-4" />
            <p>No monitors found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-gray-900 border-b border-[var(--color-border)]">
                <TableRow className="hover:bg-transparent border-b-0">
                  <TableHead className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Device</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Details</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Status</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Last Seen</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)]">Assignment</TableHead>
                  <TableHead className="px-6 py-4 font-semibold text-xs uppercase tracking-wider text-[var(--color-text-muted)] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-[var(--color-border)]">
                {devices.map((device) => (
                  <DeviceRow key={device.id} device={device} onAssign={setAssigningDevice} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <AssignDeviceModal
        device={assigningDevice}
        isOpen={!!assigningDevice}
        onClose={() => setAssigningDevice(null)}
      />
    </div>
  );
}
