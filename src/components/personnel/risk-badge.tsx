import { cn } from '@/lib/utils/cn'
import { riskColorMap, riskLabelTh, getRiskLevel, type RiskLevel } from '@/lib/utils/risk-colors'

interface RiskBadgeProps { level: RiskLevel | string | null; score?: number | null; size?: 'sm' | 'md' }

export function RiskBadge({ level, score, size = 'sm' }: RiskBadgeProps) {
  // Recalculate from score using current thresholds (database level may be stale)
  const riskLevel: RiskLevel = score != null ? getRiskLevel(score) : ((level || 'green') as RiskLevel)
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border font-medium', riskColorMap[riskLevel], size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm')}>
      <span className={cn('w-2 h-2 rounded-full', { 'bg-green-500': riskLevel === 'green', 'bg-amber-500': riskLevel === 'amber', 'bg-red-500': riskLevel === 'red', 'bg-red-700': riskLevel === 'critical' })} />
      {riskLabelTh[riskLevel]}
      {score !== null && score !== undefined && <span className="opacity-70">({score.toFixed(0)})</span>}
    </span>
  )
}
