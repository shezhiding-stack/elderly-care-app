import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProfile, PairInfo, AppScreen } from '../types'

/** 生成 6 位唯一数字 ID */
const generateId = (): string => {
  const base = Math.floor(100000 + Math.random() * 900000).toString()
  // 与 localStorage 中已有 ID 去重（极低概率重复，直接用时间戳兜底）
  return base
}

interface UserState {
  currentScreen: AppScreen
  profile: UserProfile | null
  pairInfo: PairInfo | null

  setScreen: (screen: AppScreen) => void
  login: (lastName: string, firstName: string, age: number) => void
  logout: () => void
  setPairInfo: (info: PairInfo) => void
  clearPair: () => void
  getDisplayName: () => string
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentScreen: 'login',
      profile: null,
      pairInfo: null,

      setScreen: (screen) => set({ currentScreen: screen }),

      login: (lastName, firstName, age) => {
        const profile: UserProfile = {
          id: generateId(),
          lastName,
          firstName,
          age,
          createdAt: new Date().toISOString(),
        }
        set({ profile, currentScreen: 'role-select' })
      },

      logout: () => set({ profile: null, pairInfo: null, currentScreen: 'login' }),

      setPairInfo: (info) => set({ pairInfo: info }),

      clearPair: () => set({ pairInfo: null }),

      getDisplayName: () => {
        const { profile } = get()
        if (!profile) return '用户'
        return profile.lastName + (profile.firstName || '')
      },
    }),
    {
      name: 'elderly-care-user',
    }
  )
)
