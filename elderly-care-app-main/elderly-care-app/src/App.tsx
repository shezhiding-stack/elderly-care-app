import React from 'react'
import { useUserStore } from './store/userStore'
import { useRoleStore } from './store/roleStore'
import LoginScreen from './screens/LoginScreen'
import RoleSelectScreen from './screens/RoleSelectScreen'
import PairScreen from './screens/PairScreen'
import ElderlyLayout from './layouts/ElderlyLayout'
import FamilyLayout from './layouts/FamilyLayout'

export default function App() {
  const { currentScreen, profile } = useUserStore()
  const { currentRole } = useRoleStore()
  const { setScreen } = useUserStore()

  // 未登录 → 登录页
  if (!profile || currentScreen === 'login') {
    return (
      <MobileFrame>
        <LoginScreen />
      </MobileFrame>
    )
  }

  // 配对页
  if (currentScreen === 'pair') {
    return (
      <MobileFrame>
        <PairScreen />
      </MobileFrame>
    )
  }

  // 角色选择页
  if (currentScreen === 'role-select') {
    return (
      <MobileFrame>
        <RoleSelectScreen />
      </MobileFrame>
    )
  }

  // 主界面
  if (currentScreen === 'main') {
    if (currentRole === 'elderly') {
      return <MobileFrame><ElderlyLayout /></MobileFrame>
    }
    if (currentRole === 'family') {
      return <MobileFrame><FamilyLayout /></MobileFrame>
    }
    // currentRole 未设置，跳回角色选择
    setScreen('role-select')
    return null
  }

  // 兜底
  return (
    <MobileFrame>
      <RoleSelectScreen />
    </MobileFrame>
  )
}

function MobileFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-sm h-screen max-h-[844px] bg-white overflow-hidden flex flex-col relative shadow-2xl md:rounded-[40px]">
        {children}
      </div>
    </div>
  )
}
