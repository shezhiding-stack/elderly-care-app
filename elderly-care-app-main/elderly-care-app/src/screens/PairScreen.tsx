import { useState } from 'react'
import { useUserStore } from '../store/userStore'
import { PairInfo } from '../types'
import { Users, ArrowLeft, Check, AlertCircle } from 'lucide-react'

export default function PairScreen() {
  const { profile, pairInfo, setPairInfo, clearPair, setScreen } = useUserStore()

  const [partnerId, setPartnerId] = useState('')
  const [partnerName, setPartnerName] = useState('')
  const [partnerAge, setPartnerAge] = useState('')
  const [step, setStep] = useState<'input' | 'confirm' | 'success'>('input')
  const [error, setError] = useState('')

  const handleNext = () => {
    setError('')
    if (!partnerId.trim() || partnerId.trim().length !== 6 || isNaN(Number(partnerId))) {
      setError('请输入有效的 6 位数字 ID')
      return
    }
    if (partnerId.trim() === profile?.id) {
      setError('不能与自己配对，请输入对方的 ID')
      return
    }
    if (!partnerName.trim()) {
      setError('请输入对方的姓名')
      return
    }
    const ageNum = parseInt(partnerAge)
    if (!partnerAge || isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('请输入对方的有效年龄')
      return
    }
    setStep('confirm')
  }

  const getMyRole = (): 'elderly' | 'family' => {
    const myAge = profile?.age ?? 0
    const theirAge = parseInt(partnerAge)
    return myAge >= theirAge ? 'elderly' : 'family'
  }

  const handleConfirm = () => {
    const myRole = getMyRole()
    const info: PairInfo = {
      partnerId: partnerId.trim(),
      partnerName: partnerName.trim(),
      partnerAge: parseInt(partnerAge),
      myRole,
    }
    setPairInfo(info)
    setStep('success')
  }

  const handleCancelPair = () => {
    clearPair()
    setScreen('role-select')
  }

  const myRole = getMyRole()
  const myAge = profile?.age ?? 0

  // 已配对状态展示
  if (pairInfo && step === 'input') {
    return (
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-white flex flex-col">
        <div className="flex items-center gap-3 px-5 pt-6 pb-4">
          <button
            onClick={() => setScreen('role-select')}
            className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:scale-95"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <h1 className="text-xl font-bold text-gray-800">家人配对</h1>
        </div>

        <div className="px-5 flex-1">
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Check size={24} className="text-green-500" />
              </div>
              <div>
                <p className="font-bold text-green-700">配对成功</p>
                <p className="text-xs text-green-500">已与家人建立连接</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">对方姓名</span>
                <span className="font-semibold text-gray-800">{pairInfo.partnerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">对方 ID</span>
                <span className="font-mono font-semibold text-gray-800">{pairInfo.partnerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">对方年龄</span>
                <span className="font-semibold text-gray-800">{pairInfo.partnerAge} 岁</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">我的角色</span>
                <span className="font-bold text-blue-600">
                  {pairInfo.myRole === 'elderly' ? '👴 老人端' : '👨‍👩‍👧 子女端'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4 text-xs text-blue-500 mb-6">
            <p className="font-medium text-blue-600 mb-1">ℹ️ 角色分配规则</p>
            <p>年龄较大的一方自动分配为<strong>老人端</strong>，年龄较小的一方为<strong>子女端</strong>。进入主界面后也可手动切换。</p>
          </div>

          <button
            onClick={handleCancelPair}
            className="w-full py-3 border-2 border-red-200 text-red-400 rounded-2xl font-medium active:scale-95 transition-all text-sm"
          >
            解除配对
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-blue-50 to-white flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-4">
        <button
          onClick={() => setScreen('role-select')}
          className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm active:scale-95"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </button>
        <h1 className="text-xl font-bold text-gray-800">与家人配对</h1>
      </div>

      <div className="px-5 flex-1 overflow-y-auto pb-8">
        {step === 'input' && (
          <>
            {/* 我的信息卡 */}
            <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm">
              <p className="text-xs text-gray-400 mb-2">我的信息</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-xl">
                  👤
                </div>
                <div>
                  <p className="font-bold text-gray-800">{profile?.lastName}{profile?.firstName}</p>
                  <p className="text-xs text-gray-400">ID: <span className="font-mono font-semibold text-gray-600">{profile?.id}</span> · {profile?.age} 岁</p>
                </div>
              </div>
            </div>

            {/* 图示 */}
            <div className="flex items-center justify-center gap-4 mb-5">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">👤</div>
                <p className="text-xs text-gray-400 mt-1">我</p>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users size={20} className="text-blue-400" />
                <p className="text-xs text-blue-400">配对</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">👤</div>
                <p className="text-xs text-gray-400 mt-1">家人</p>
              </div>
            </div>

            {/* 表单 */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-4 mb-4">
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                  对方的 6 位 ID <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="请输入对方的 6 位 ID"
                  value={partnerId}
                  maxLength={6}
                  onChange={(e) => { setPartnerId(e.target.value); setError('') }}
                  className="w-full border-2 border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-gray-800 text-lg font-mono tracking-widest outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                  对方姓名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="请输入对方的姓名"
                  value={partnerName}
                  onChange={(e) => { setPartnerName(e.target.value); setError('') }}
                  className="w-full border-2 border-gray-200 focus:border-blue-400 rounded-xl px-4 py-3 text-gray-800 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                  对方年龄 <span className="text-red-400">*</span>
                </label>
                <div className="flex items-center border-2 border-gray-200 focus-within:border-blue-400 rounded-xl px-4 py-3 transition-colors">
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="请输入对方年龄"
                    value={partnerAge}
                    onChange={(e) => { setPartnerAge(e.target.value); setError('') }}
                    className="flex-1 text-gray-800 outline-none bg-transparent"
                  />
                  <span className="text-gray-400 text-sm">岁</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-500">
                <AlertCircle size={16} className="flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="bg-blue-50 rounded-2xl p-3 text-xs text-blue-500 mb-5">
              <strong>角色分配规则：</strong>年龄较大的一方为老人端，年龄较小的一方为子女端。年龄相同时，你为老人端。
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              下一步
            </button>
          </>
        )}

        {step === 'confirm' && (
          <>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
              <h3 className="font-bold text-gray-700 mb-4">确认配对信息</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">对方姓名</span>
                  <span className="font-semibold text-gray-800">{partnerName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">对方 ID</span>
                  <span className="font-mono font-semibold text-gray-800">{partnerId}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">对方年龄</span>
                  <span className="font-semibold text-gray-800">{partnerAge} 岁</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">我的年龄</span>
                  <span className="font-semibold text-gray-800">{myAge} 岁</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-gray-500 text-sm">我的角色（自动分配）</span>
                  <span className={`font-bold text-base ${myRole === 'elderly' ? 'text-orange-500' : 'text-blue-500'}`}>
                    {myRole === 'elderly' ? '👴 老人端' : '👨‍👩‍👧 子女端'}
                  </span>
                </div>
              </div>
            </div>

            <div className={`rounded-2xl p-4 mb-5 text-sm ${myRole === 'elderly' ? 'bg-orange-50 border border-orange-200 text-orange-600' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
              {myRole === 'elderly'
                ? `你（${myAge}岁）年龄较大，将以老人端身份进入，享受用药提醒和健康管理功能。`
                : `你（${myAge}岁）年龄较小，将以子女端身份进入，可查看家人健康数据并录入信息。`
              }
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('input')}
                className="flex-1 py-3.5 border-2 border-gray-200 text-gray-600 rounded-2xl font-medium active:scale-95 transition-all"
              >
                返回修改
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 py-3.5 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all
                  ${myRole === 'elderly'
                    ? 'bg-gradient-to-r from-orange-400 to-orange-500 shadow-orange-200'
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-blue-200'
                  }`}
              >
                确认配对
              </button>
            </div>
          </>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check size={40} className="text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">配对成功！</h2>
            <p className="text-gray-500 text-center text-sm mb-2">
              已与 <span className="font-semibold text-gray-700">{partnerName}</span> 建立连接
            </p>
            <p className="text-center text-sm mb-8">
              你的角色：<span className={`font-bold ${myRole === 'elderly' ? 'text-orange-500' : 'text-blue-500'}`}>
                {myRole === 'elderly' ? '👴 老人端' : '👨‍👩‍👧 子女端'}
              </span>
            </p>
            <button
              onClick={() => setScreen('role-select')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-blue-200 active:scale-95 transition-all"
            >
              返回主页
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
