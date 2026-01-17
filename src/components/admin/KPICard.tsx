interface KPICardProps {
  label: string;
  value: string | number;
  subtitle?: string | React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  error?: string;
}

export function KPICard({ label, value, subtitle, trend, isLoading, error }: KPICardProps) {
  if (error) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-6">
        <div className="text-sm text-[#666666] mb-2">{label}</div>
        <div className="text-sm text-red-600">Error loading</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-[#EBEBEB] rounded-lg p-6 animate-pulse">
        <div className="h-4 bg-[#F8F8F8] rounded w-20 mb-3"></div>
        <div className="h-8 bg-[#F8F8F8] rounded w-16 mb-2"></div>
        <div className="h-3 bg-[#F8F8F8] rounded w-24"></div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EBEBEB] rounded-lg p-6 hover:border-[#00843D] transition-colors">
      <div className="text-sm text-[#666666] mb-2">{label}</div>
      <div className="text-2xl font-semibold text-[#1A1A1A] mb-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>

      {trend && (
        <div className={`text-sm ${trend.isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
          {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% vs 7d ago
        </div>
      )}

      {subtitle && !trend && (
        <div className="text-sm text-[#666666]">{subtitle}</div>
      )}
    </div>
  );
}

export function KPICardSkeleton() {
  return (
    <div className="bg-white border border-[#EBEBEB] rounded-lg p-6 animate-pulse">
      <div className="h-4 bg-[#F8F8F8] rounded w-20 mb-3"></div>
      <div className="h-8 bg-[#F8F8F8] rounded w-16 mb-2"></div>
      <div className="h-3 bg-[#F8F8F8] rounded w-24"></div>
    </div>
  );
}
