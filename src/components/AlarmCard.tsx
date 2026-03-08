import { AlarmRecord, AlarmLevel } from '../types'
import { CheckCircle, AlertTriangle, AlertOctagon, Info } from 'lucide-react'

const LEVEL_CONFIG: Record<AlarmLevel, { bg: string; border: string; text: string; icon: typeof Info }> = {
  info:     { bg: '#E3F2FD', border: '#90CAF9', text: '#1565C0', icon: Info },
  warning:  { bg: '#FFF8E1', border: '#FFD54F', text: '#E65100', icon: AlertTriangle },
  danger:   { bg: '#FFF3F3', border: '#EF9A9A', text: '#C62828', icon: AlertOctagon },
  critical: { bg: '#FFEBEE', border: '#EF5350', text: '#B71C1C', icon: AlertOctagon },
}

interface Props {
  alarm: AlarmRecord
  onAcknowledge: (id: string) => void
}

export default function AlarmCard({ alarm, onAcknowledge }: Props) {
  const cfg = LEVEL_CONFIG[alarm.level]
  const Icon = cfg.icon
  const timeStr = new Date(alarm.timestamp).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  return (
    <div
      className="rounded-2xl p-3.5 mb-2 flex items-start gap-3 shadow-sm"
      style={{
        backgroundColor: cfg.bg,
        borderLeft: `4px solid ${cfg.border}`,
        opacity: alarm.acknowledged ? 0.55 : 1,
      }}
    >
      <div className="mt-0.5 flex-shrink-0">
        <Icon size={20} color={cfg.text} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-sm" style={{ color: cfg.text }}>
            {alarm.metric} 异常
            <span className="ml-1.5 font-normal text-xs opacity-70">
              {alarm.value} {alarm.unit}
            </span>
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0">{timeStr}</span>
        </div>
        <p className="text-xs mt-0.5 leading-relaxed" style={{ color: cfg.text }}>
          {alarm.message}
        </p>
        {!alarm.acknowledged && (
          <button
            onClick={() => onAcknowledge(alarm.id)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-opacity active:opacity-70"
            style={{ backgroundColor: cfg.border + '55', color: cfg.text }}
          >
            <CheckCircle size={12} />
            已知晓
          </button>
        )}
        {alarm.acknowledged && (
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-gray-400">
            <CheckCircle size={11} /> 已确认
          </span>
        )}
      </div>
    </div>
  )
}
