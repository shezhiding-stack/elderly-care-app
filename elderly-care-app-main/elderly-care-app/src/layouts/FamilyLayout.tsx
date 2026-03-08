import { useRoleStore } from '../store/roleStore'
import { useUserStore } from '../store/userStore'
import { useDeviceStore } from '../store/deviceStore'
import { FamilyTab } from '../types'
import FamilyHomeScreen from '../screens/family/FamilyHomeScreen'
import HealthChartScreen from '../screens/family/HealthChartScreen'
import DataEntryScreen from '../screens/family/DataEntryScreen'
import MedicationManageScreen from '../screens/MedicationManageScreen'
import DeviceMonitorScreen from '../screens/DeviceMonitorScreen'
import RoleSwitch from '../components/RoleSwitch'
import { ClipboardList, TrendingUp, PlusCircle, Pill, Watch } from 'lucide-react'

const tabs: Array<{ id: FamilyTab; label: string; icon: typeof ClipboardList }> = [
  { id: 'report', label: '健康报告', icon: ClipboardList },
  { id: 'chart', label: '数据图表', icon: TrendingUp },
  { id: 'entry', label: '录入数据', icon: PlusCircle },
  { id: 'meds', label: '我的药品', icon: Pill },
  { id: 'device', label: '智能设备', icon: Watch },
]

export default function FamilyLayout() {
  const { familyTab, setFamilyTab } = useRoleStore()
  const { getDisplayName } = useUserStore()
  const { alarms } = useDeviceStore()
  const unreadAlarms = alarms.filter((a) => !a.acknowledged).length

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-blue-600 font-bold text-lg">守护家人</span>
          <span className="text-xs bg-blue-100 text-blue-500 px-2 py-0.5 rounded-full">子女端</span>
          <span className="text-xs text-gray-400">{getDisplayName()}</span>
        </div>
        <RoleSwitch />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {familyTab === 'report' && <FamilyHomeScreen />}
        {familyTab === 'chart' && <HealthChartScreen />}
        {familyTab === 'entry' && <DataEntryScreen />}
        {familyTab === 'meds' && <MedicationManageScreen />}
        {familyTab === 'device' && <DeviceMonitorScreen />}
      </div>

      {/* Bottom Tab Bar */}
      <div className="flex bg-white border-t border-gray-100 pb-safe flex-shrink-0 shadow-lg">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = familyTab === id
          const badge = id === 'device' && unreadAlarms > 0 ? unreadAlarms : 0
          return (
            <button
              key={id}
              onClick={() => setFamilyTab(id)}
              className={`
                flex-1 flex flex-col items-center py-2.5 transition-all duration-200 active:scale-95
                ${active ? 'text-blue-600' : 'text-gray-400'}
              `}
            >
              <div className="relative">
                <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 rounded-full min-w-[16px] text-center leading-4">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-xs mt-0.5 font-medium ${active ? 'text-blue-600' : 'text-gray-400'}`}>
                {label}
              </span>
              {active && (
                <span className="w-1 h-1 bg-blue-600 rounded-full mt-0.5" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
