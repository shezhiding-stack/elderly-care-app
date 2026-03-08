import { useUserStore } from '../store/userStore'
import { useRoleStore } from '../store/roleStore'
import { Heart, Copy, Users, LogOut, Link } from 'lucide-react'
import { useState } from 'react'

export default function RoleSelectScreen() {
  const { profile, pairInfo, getDisplayName, logout, setScreen } = useUserStore()
  const { setRole } = useRoleStore()
  const [copied, setCopied] = useState(false)

  const copyId = () => {
    if (!profile) return
    navigator.clipboard.writeText(profile.id).catch(() => {
      // 降级方案：创建临时 input 复制
      const el = document.createElement('input')
      el.value = profile.id
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEnterAs = (role: 'elderly' | 'family') => {
    setRole(role)
    setScreen('main')
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col items-center pt-10 pb-6 px-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
          <Heart size={40} className="text-white" fill="white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">你好，{getDisplayName()}</h1>
        <p className="text-gray-400 mt-1 text-sm">请选择进入方式</p>
      </div>

      {/* ID Card */}
      <div className="mx-5 mb-5 bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-400 mb-1">我的专属 ID（可分享给家人配对）</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold tracking-widest text-gray-800">{profile?.id}</span>
          <button
            onClick={copyId}
            className="flex items-center gap-1.5 bg-orange-50 text-orange-500 px-3 py-1.5 rounded-xl text-sm font-medium active:scale-95 transition-all"
          >
            <Copy size={14} />
            {copied ? '已复制！' : '复制'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">年龄：{profile?.age} 岁</p>
      </div>

      {/* 配对状态 */}
      {pairInfo ? (
        <div className="mx-5 mb-5 bg-green-50 border border-green-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <Link size={16} className="text-green-500" />
            <span className="font-semibold text-green-700">已与家人配对</span>
          </div>
          <p className="text-sm text-green-600">
            {pairInfo.partnerName}（{pairInfo.partnerAge}岁）·
            你的角色：<span className="font-bold">{pairInfo.myRole === 'elderly' ? '👴 老人端' : '👨‍👩‍👧 子女端'}</span>
          </p>
          <p className="text-xs text-green-500 mt-1">配对后角色已自动分配，也可手动选择</p>
        </div>
      ) : (
        <button
          onClick={() => setScreen('pair')}
          className="mx-5 mb-5 flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-2xl p-4 w-[calc(100%-2.5rem)] active:scale-95 transition-all"
        >
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users size={20} className="text-blue-500" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-blue-700 text-sm">与家人配对</p>
            <p className="text-xs text-blue-400 mt-0.5">输入对方 ID，自动分配老人/子女端</p>
          </div>
          <span className="ml-auto text-blue-400 text-lg">›</span>
        </button>
      )}

      {/* 角色选择 */}
      <div className="px-5 space-y-4 pb-6">
        <p className="text-xs text-gray-400 font-medium text-center">— 或手动选择进入方式 —</p>

        {/* 如果已配对，高亮推荐角色 */}
        <button
          onClick={() => handleEnterAs('elderly')}
          className={`w-full text-white rounded-3xl p-5 shadow-lg active:scale-95 transition-all duration-300 text-left
            ${pairInfo?.myRole === 'elderly'
              ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-orange-200 ring-2 ring-orange-300'
              : 'bg-gradient-to-r from-orange-300 to-orange-400 shadow-orange-100'
            }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              👴
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">老人端</span>
                {pairInfo?.myRole === 'elderly' && (
                  <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">推荐</span>
                )}
              </div>
              <div className="text-orange-100 text-sm mt-0.5">用药提醒 · 慢病管理 · 健康记录</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleEnterAs('family')}
          className={`w-full text-white rounded-3xl p-5 shadow-lg active:scale-95 transition-all duration-300 text-left
            ${pairInfo?.myRole === 'family'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200 ring-2 ring-blue-300'
              : 'bg-gradient-to-r from-blue-400 to-blue-500 shadow-blue-100'
            }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
              👨‍👩‍👧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">子女端</span>
                {pairInfo?.myRole === 'family' && (
                  <span className="text-xs bg-white/30 px-2 py-0.5 rounded-full">推荐</span>
                )}
              </div>
              <div className="text-blue-100 text-sm mt-0.5">健康报告 · 数据图表 · 信息录入</div>
            </div>
          </div>
        </button>

        {/* 退出登录 */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3 text-gray-400 text-sm active:scale-95 transition-all"
        >
          <LogOut size={14} />
          退出登录
        </button>
      </div>
    </div>
  )
}
