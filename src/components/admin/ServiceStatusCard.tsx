'use client';

import type { ServiceHealthStatus } from '@/lib/api';

interface ServiceStatusCardProps {
  name: string;
  health: number;
  status: ServiceHealthStatus;
  latency?: number;
  errorRate?: number;
  successRate?: number;
  className?: string;
}

// Service display names and icons
const serviceConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  api: {
    label: 'API Server',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
      </svg>
    ),
  },
  email: {
    label: 'Email Service',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
  payment: {
    label: 'Payments',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  push: {
    label: 'Push Notifications',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
  },
  database: {
    label: 'Database',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
  },
};

// Status colors and labels
const statusConfig: Record<ServiceHealthStatus, { color: string; bgColor: string; label: string; borderColor: string }> = {
  healthy: {
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    label: 'Operational',
  },
  degraded: {
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    label: 'Degraded',
  },
  down: {
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    label: 'Down',
  },
};

export function ServiceStatusCard({
  name,
  health,
  status,
  latency,
  errorRate,
  successRate,
  className = '',
}: ServiceStatusCardProps) {
  const config = serviceConfig[name] || { label: name, icon: null };
  const statusStyle = statusConfig[status];

  // Calculate health bar color
  const getHealthColor = (score: number): string => {
    if (score >= 75) return 'bg-[#00843D]'; // Design system green
    if (score >= 50) return 'bg-yellow-400';
    return 'bg-red-500';
  };

  return (
    <div
      className={`
        rounded-xl border p-4
        ${statusStyle.bgColor} ${statusStyle.borderColor}
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={statusStyle.color}>{config.icon}</span>
          <span className="font-medium text-gray-900">{config.label}</span>
        </div>
        <span
          className={`
            text-xs font-medium px-2 py-1 rounded-full
            ${status === 'healthy' ? 'bg-green-100 text-green-700' : ''}
            ${status === 'degraded' ? 'bg-yellow-100 text-yellow-700' : ''}
            ${status === 'down' ? 'bg-red-100 text-red-700' : ''}
          `}
        >
          {statusStyle.label}
        </span>
      </div>

      {/* Health Score Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Health</span>
          <span className={`font-semibold ${statusStyle.color}`}>{health}%</span>
        </div>
        <div className="w-full h-2 bg-white rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${getHealthColor(health)}`}
            style={{ width: `${Math.min(100, Math.max(0, health))}%` }}
          />
        </div>
      </div>

      {/* Additional metrics (if provided) */}
      {(latency !== undefined || errorRate !== undefined || successRate !== undefined) && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {latency !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-500">Latency</span>
              <span className="font-medium text-gray-700">{latency}ms</span>
            </div>
          )}
          {errorRate !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-500">Error Rate</span>
              <span className="font-medium text-gray-700">{(errorRate * 100).toFixed(2)}%</span>
            </div>
          )}
          {successRate !== undefined && (
            <div className="flex justify-between">
              <span className="text-gray-500">Success</span>
              <span className="font-medium text-gray-700">{(successRate * 100).toFixed(1)}%</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Skeleton loader for ServiceStatusCard
export function ServiceStatusCardSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>
        <div className="h-5 w-16 bg-gray-200 rounded-full" />
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="h-3 w-12 bg-gray-200 rounded" />
          <div className="h-3 w-8 bg-gray-200 rounded" />
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}
