import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DeviceInfo, DeviceStatus, RealtimeSample, AlarmRecord, AlarmLevel } from '../types'

// ── 阈值配置 ─────────────────────────────────────────────
export const THRESHOLDS = {
  heartRate: { low: 50, high: 100, criticalHigh: 130, criticalLow: 40 },
  bloodOxygen: { low: 94, criticalLow: 90 },           // SpO2 % 
  temperature: { low: 36.0, high: 37.3, criticalHigh: 38.5, criticalLow: 35.0 },
  systolic: { high: 140, criticalHigh: 180 },
  diastolic: { high: 90, criticalHigh: 120 },
}

const DEFAULT_DEVICE: DeviceInfo = {
  id: 'dev-001',
  name: '智能健康手环',
  model: 'HC-Band Pro',
  battery: 82,
  status: 'disconnected',
  lastSyncAt: null,
  firmwareVersion: 'v2.3.1',
}

interface DeviceState {
  device: DeviceInfo
  realtimeData: RealtimeSample | null
  alarms: AlarmRecord[]
  isMonitoring: boolean
  simulationTimerId: number | null

  // actions
  connectDevice: () => void
  disconnectDevice: () => void
  startMonitoring: () => void
  stopMonitoring: () => void
  acknowledgeAlarm: (id: string) => void
  clearAllAlarms: () => void
  _tick: () => void          // internal
}

/** 生成一次模拟采样（数值随机但在合理范围内波动） */
function generateSample(prev: RealtimeSample | null): RealtimeSample {
  const rand = (base: number, range: number, decimals = 0) => {
    const v = base + (Math.random() - 0.5) * range * 2
    return parseFloat(v.toFixed(decimals))
  }

  const heartRate = prev
    ? Math.max(40, Math.min(150, rand(prev.heartRate, 4)))
    : rand(72, 6)

  const bloodOxygen = prev
    ? Math.max(85, Math.min(100, rand(prev.bloodOxygen, 1, 1)))
    : rand(97, 1, 1)

  const temperature = prev
    ? Math.max(34.5, Math.min(40.0, rand(prev.temperature, 0.1, 1)))
    : rand(36.6, 0.2, 1)

  const steps = prev ? prev.steps + Math.floor(Math.random() * 8) : Math.floor(Math.random() * 500)

  // 偶尔触发异常值（概率约 5%）来演示报警
  const trigger = Math.random()
  const abnormal: Partial<RealtimeSample> = {}
  if (trigger < 0.03) abnormal.heartRate = Math.random() < 0.5 ? 38 : 135
  if (trigger >= 0.03 && trigger < 0.05) abnormal.bloodOxygen = 88 + Math.random() * 2

  return {
    timestamp: Date.now(),
    heartRate: abnormal.heartRate ?? heartRate,
    bloodOxygen: abnormal.bloodOxygen ?? bloodOxygen,
    temperature,
    steps,
    systolic: prev?.systolic ?? rand(120, 10),
    diastolic: prev?.diastolic ?? rand(78, 8),
  }
}

/** 根据采样数据生成报警列表 */
function checkAlarms(sample: RealtimeSample): Omit<AlarmRecord, 'id' | 'acknowledged'>[] {
  const alarms: Omit<AlarmRecord, 'id' | 'acknowledged'>[] = []
  const ts = sample.timestamp
  const { heartRate, bloodOxygen, temperature } = sample
  const thr = THRESHOLDS

  // 心率
  if (heartRate <= thr.heartRate.criticalLow) {
    alarms.push({ timestamp: ts, level: 'critical', metric: '心率', value: heartRate, unit: 'bpm', message: `心率严重过低（${heartRate} bpm），请立即就医！` })
  } else if (heartRate >= thr.heartRate.criticalHigh) {
    alarms.push({ timestamp: ts, level: 'critical', metric: '心率', value: heartRate, unit: 'bpm', message: `心率严重过快（${heartRate} bpm），请立即就医！` })
  } else if (heartRate < thr.heartRate.low) {
    alarms.push({ timestamp: ts, level: 'warning', metric: '心率', value: heartRate, unit: 'bpm', message: `心率偏低（${heartRate} bpm），请注意休息` })
  } else if (heartRate > thr.heartRate.high) {
    alarms.push({ timestamp: ts, level: 'warning', metric: '心率', value: heartRate, unit: 'bpm', message: `心率偏快（${heartRate} bpm），请放松` })
  }

  // 血氧
  if (bloodOxygen < thr.bloodOxygen.criticalLow) {
    alarms.push({ timestamp: ts, level: 'critical', metric: '血氧', value: bloodOxygen, unit: '%', message: `血氧饱和度危险（${bloodOxygen}%），请立即急救！` })
  } else if (bloodOxygen < thr.bloodOxygen.low) {
    alarms.push({ timestamp: ts, level: 'danger', metric: '血氧', value: bloodOxygen, unit: '%', message: `血氧偏低（${bloodOxygen}%），请保持通风并休息` })
  }

  // 体温
  if (temperature >= thr.temperature.criticalHigh) {
    alarms.push({ timestamp: ts, level: 'danger', metric: '体温', value: temperature, unit: '°C', message: `体温过高（${temperature}°C），可能高烧，请就医` })
  } else if (temperature > thr.temperature.high) {
    alarms.push({ timestamp: ts, level: 'warning', metric: '体温', value: temperature, unit: '°C', message: `体温略高（${temperature}°C），请多喝水并观察` })
  } else if (temperature < thr.temperature.criticalLow) {
    alarms.push({ timestamp: ts, level: 'danger', metric: '体温', value: temperature, unit: '°C', message: `体温过低（${temperature}°C），请注意保暖` })
  }

  return alarms
}

export const useDeviceStore = create<DeviceState>()(
  persist(
    (set, get) => ({
      device: DEFAULT_DEVICE,
      realtimeData: null,
      alarms: [],
      isMonitoring: false,
      simulationTimerId: null,

      connectDevice: () => {
        set((s) => ({ device: { ...s.device, status: 'connecting' } }))
        setTimeout(() => {
          set((s) => ({
            device: {
              ...s.device,
              status: 'connected',
              lastSyncAt: new Date().toISOString(),
            },
          }))
        }, 1800)
      },

      disconnectDevice: () => {
        get().stopMonitoring()
        set((s) => ({
          device: { ...s.device, status: 'disconnected' },
          realtimeData: null,
        }))
      },

      startMonitoring: () => {
        if (get().isMonitoring) return
        set({ isMonitoring: true })
        // 立即采一次
        get()._tick()
        const id = window.setInterval(() => get()._tick(), 3000) as unknown as number
        set({ simulationTimerId: id })
      },

      stopMonitoring: () => {
        const { simulationTimerId } = get()
        if (simulationTimerId !== null) {
          clearInterval(simulationTimerId)
        }
        set({ isMonitoring: false, simulationTimerId: null })
      },

      _tick: () => {
        const sample = generateSample(get().realtimeData)
        const newAlarmBases = checkAlarms(sample)

        const newAlarms: AlarmRecord[] = newAlarmBases.map((a) => ({
          ...a,
          id: `alarm-${a.timestamp}-${a.metric}`,
          acknowledged: false,
        }))

        set((s) => {
          // 去重：同 metric 同分钟不重复追加
          const existingKeys = new Set(
            s.alarms.map((a) => `${a.metric}-${Math.floor(a.timestamp / 60000)}`)
          )
          const filtered = newAlarms.filter(
            (a) => !existingKeys.has(`${a.metric}-${Math.floor(a.timestamp / 60000)}`)
          )
          return {
            realtimeData: sample,
            device: {
              ...s.device,
              lastSyncAt: new Date().toISOString(),
              battery: Math.max(1, s.device.battery - 0.02),
            },
            alarms: [...filtered, ...s.alarms].slice(0, 50), // 最多保留 50 条
          }
        })
      },

      acknowledgeAlarm: (id) => {
        set((s) => ({
          alarms: s.alarms.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)),
        }))
      },

      clearAllAlarms: () => set({ alarms: [] }),
    }),
    {
      name: 'elderly-care-device',
      partialize: (s) => ({ device: s.device, alarms: s.alarms }),
    }
  )
)
