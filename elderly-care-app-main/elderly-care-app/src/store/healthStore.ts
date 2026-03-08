import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { HealthRecord } from '../types'

const generateMockData = (): HealthRecord[] => {
  const records: HealthRecord[] = []
  const now = new Date()
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    records.push({
      id: `record-${i}`,
      date: dateStr,
      systolic: 115 + Math.floor(Math.random() * 25),
      diastolic: 72 + Math.floor(Math.random() * 15),
      bloodSugar: parseFloat((5.0 + Math.random() * 2).toFixed(1)),
      weight: parseFloat((65 + Math.random() * 4 - 2).toFixed(1)),
      heartRate: 65 + Math.floor(Math.random() * 20),
    })
  }
  return records
}

interface HealthState {
  records: HealthRecord[]
  addRecord: (record: Omit<HealthRecord, 'id'>) => void
  getLatestRecord: () => HealthRecord | null
  getRecordsByDays: (days: number) => HealthRecord[]
}

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      records: generateMockData(),

      addRecord: (record) => {
        const newRecord: HealthRecord = {
          ...record,
          id: `record-${Date.now()}`,
        }
        set((state) => {
          // 若同一日期已有记录，则替换而非追加
          const filtered = state.records.filter((r) => r.date !== record.date)
          return {
            records: [...filtered, newRecord].sort((a, b) =>
              a.date.localeCompare(b.date)
            ),
          }
        })
      },

      getLatestRecord: () => {
        const { records } = get()
        if (records.length === 0) return null
        return records[records.length - 1]
      },

      getRecordsByDays: (days) => {
        const { records } = get()
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - days)
        const cutoffStr = cutoff.toISOString().split('T')[0]
        return records.filter((r) => r.date >= cutoffStr)
      },
    }),
    {
      name: 'elderly-care-health-records',
    }
  )
)
