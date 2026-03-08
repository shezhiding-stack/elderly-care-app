import { useRoleStore } from '../store/roleStore'
import { useUserStore } from '../store/userStore'
import { ArrowLeftRight, LogOut } from 'lucide-react'

export default function RoleSwitch() {
  const { currentRole, setRole } = useRoleStore()
  const { setScreen } = useUserStore()

  if (currentRole === 'select') return null

  const isElderly = currentRole === 'elderly'

  return (
    <div className="flex items-center gap-2">
      {/* 切换角色 */}
      <button
        onClick={() => {
          setRole(isElderly ? 'family' : 'elderly')
          setScreen('main')
        }}
        className={`
          flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
          transition-all duration-200 active:scale-95
          ${isElderly
            ? 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
          }
        `}
      >
        <ArrowLeftRight size={12} />
        切换
      </button>
      {/* 返回主页 */}
      <button
        onClick={() => setScreen('role-select')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all active:scale-95"
      >
        <LogOut size={12} />
        主页
      </button>
    </div>
  )
}
