export type Role = 'select' | 'elderly' | 'family'

export type ElderlyTab = 'home' | 'disease' | 'records' | 'meds' | 'device'
export type FamilyTab = 'report' | 'chart' | 'entry' | 'meds' | 'device'

export type AppScreen = 'login' | 'role-select' | 'pair' | 'main'

export interface UserProfile {
  id: string          // 唯一 6 位数字 ID
  lastName: string    // 姓（必填）
  firstName: string   // 名（选填）
  age: number
  createdAt: string
}

export interface PairInfo {
  partnerId: string
  partnerName: string
  partnerAge: number
  myRole: 'elderly' | 'family'  // 年龄大的为老人端
}

export interface Medication {
  id: string
  name: string
  dosage: string
  times: string[]
  disease: string
  notes: string
  taken: Record<string, boolean>
  isCustom?: boolean  // 用户自定义添加的药品
}

export interface HealthRecord {
  id: string
  date: string
  systolic: number
  diastolic: number
  bloodSugar: number
  weight: number
  heartRate: number
  note?: string
}

export interface DiseaseInfo {
  id: string
  name: string
  icon: string
  color: string
  bgColor: string
  description: string
  dietAdvice: string[]
  exerciseAdvice: string[]
  prohibitions: string[]
  medications: string[]
  warningSymptoms: string[]
}

export interface NotificationSchedule {
  medicationId: string
  time: string
  enabled: boolean
}

// ── 硬件设备相关 ──────────────────────────────────────────

export type DeviceStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

export type AlarmLevel = 'info' | 'warning' | 'danger' | 'critical'

export interface DeviceInfo {
  id: string
  name: string          // 设备名称，如「小米手环7」
  model: string         // 型号
  battery: number       // 电量 0-100
  status: DeviceStatus
  lastSyncAt: string | null
  firmwareVersion: string
}

/** 一次实时采样 */
export interface RealtimeSample {
  timestamp: number     // Unix ms
  heartRate: number     // 心率 bpm
  bloodOxygen: number   // 血氧 SpO2 %
  temperature: number   // 体温 °C
  steps: number         // 当日步数
  systolic?: number     // 血压收缩压（部分设备支持）
  diastolic?: number    // 血压舒张压
}

/** 报警记录 */
export interface AlarmRecord {
  id: string
  timestamp: number
  level: AlarmLevel
  metric: string        // e.g. '心率', '血氧'
  value: number
  unit: string
  message: string
  acknowledged: boolean // 是否已确认
}
