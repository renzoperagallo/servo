interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  showLabel = true,
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(Math.round((value / max) * 100), 100);
  const isOverBudget = value > max;

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-sm text-slate-400">
            {isOverBudget ? 'Sobre presupuesto' : `${percentage}% usado`}
          </span>
          <span className="text-sm font-mono text-slate-500">
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-slate-800 rounded-full overflow-hidden`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOverBudget
              ? 'bg-red-500'
              : percentage > 80
              ? 'bg-yellow-500'
              : 'bg-servo-500'
          }`}
          style={{ width: `${isOverBudget ? 100 : percentage}%` }}
        />
      </div>
    </div>
  );
}
