import { useState } from 'react'
import { useUserStore } from '../store/userStore'
import { Heart, User, Calendar, ChevronRight } from 'lucide-react'

export default function LoginScreen() {
  const { login } = useUserStore()
  const [lastName, setLastName] = useState('')
  const [firstName, setFirstName] = useState('')
  const [age, setAge] = useState('')
  const [errors, setErrors] = useState<{ lastName?: string; age?: string }>({})

  const validate = () => {
    const errs: { lastName?: string; age?: string } = {}
    if (!lastName.trim()) errs.lastName = '请输入您的姓'
    const ageNum = parseInt(age)
    if (!age) errs.age = '请输入您的年龄'
    else if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) errs.age = '请输入有效年龄（1-120）'
    return errs
  }

  const handleLogin = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    login(lastName.trim(), firstName.trim(), parseInt(age))
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-orange-50 via-white to-blue-50 flex flex-col">
      {/* Header */}
      <div className="flex flex-col items-center pt-14 pb-8 px-6">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-3xl flex items-center justify-center mb-4 shadow-lg shadow-orange-200">
          <Heart size={40} className="text-white" fill="white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800">守护家人</h1>
        <p className="text-gray-400 mt-1 text-sm">关爱健康，守护每一天</p>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pb-8 flex flex-col gap-4">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <User size={18} className="text-orange-400" />
            创建您的账户
          </h2>

          {/* 姓 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">
              姓 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              placeholder="请输入您的姓（如：王）"
              value={lastName}
              maxLength={5}
              onChange={(e) => {
                setLastName(e.target.value)
                setErrors((prev) => ({ ...prev, lastName: undefined }))
              }}
              className={`w-full border-2 rounded-xl px-4 py-3 text-gray-800 text-base outline-none transition-colors
                ${errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-orange-400'}`}
            />
            {errors.lastName && (
              <p className="text-red-400 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>

          {/* 名 */}
          <div className="mb-4">
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">
              名 <span className="text-gray-400 text-xs font-normal">（选填）</span>
            </label>
            <input
              type="text"
              placeholder="请输入您的名（如：小明）"
              value={firstName}
              maxLength={10}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-4 py-3 text-gray-800 text-base outline-none transition-colors"
            />
          </div>

          {/* 年龄 */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1.5 block">
              年龄 <span className="text-red-400">*</span>
            </label>
            <div className={`flex items-center border-2 rounded-xl px-4 py-3 transition-colors
              ${errors.age ? 'border-red-300 bg-red-50' : 'border-gray-200 focus-within:border-orange-400'}`}>
              <Calendar size={18} className="text-gray-400 mr-2 flex-shrink-0" />
              <input
                type="number"
                inputMode="numeric"
                placeholder="请输入您的年龄"
                value={age}
                min={1}
                max={120}
                onChange={(e) => {
                  setAge(e.target.value)
                  setErrors((prev) => ({ ...prev, age: undefined }))
                }}
                className="flex-1 text-gray-800 text-base outline-none bg-transparent"
              />
              <span className="text-gray-400 text-sm">岁</span>
            </div>
            {errors.age && (
              <p className="text-red-400 text-xs mt-1">{errors.age}</p>
            )}
          </div>
        </div>

        {/* 说明 */}
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-sm text-orange-600">
          <p className="font-medium mb-1">📋 关于账户 ID</p>
          <p className="text-orange-500 text-xs leading-relaxed">
            注册成功后系统将为您生成唯一的 6 位 ID，可用于与家人配对，实现健康数据共享。
          </p>
        </div>

        {/* 登录按钮 */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-orange-400 to-orange-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-200 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2 mt-auto"
        >
          进入应用
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  )
}
