import { useState } from 'react'
import { useMedicationStore } from '../store/medicationStore'
import { Pill, Plus, Trash2, Clock, ChevronDown, ChevronUp, X } from 'lucide-react'

interface NewMedForm {
  name: string
  dosage: string
  disease: string
  notes: string
  times: string[]
}

const emptyForm: NewMedForm = {
  name: '',
  dosage: '',
  disease: '',
  notes: '',
  times: ['08:00'],
}

export default function MedicationManageScreen() {
  const { medications, addMedication, removeMedication } = useMedicationStore()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<NewMedForm>({ ...emptyForm })
  const [errors, setErrors] = useState<Partial<NewMedForm>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const presetMeds = medications.filter((m) => !m.isCustom)
  const customMeds = medications.filter((m) => m.isCustom)

  const addTime = () => {
    if (form.times.length >= 6) return
    setForm((prev) => ({ ...prev, times: [...prev.times, '12:00'] }))
  }

  const removeTime = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      times: prev.times.filter((_, i) => i !== idx),
    }))
  }

  const updateTime = (idx: number, val: string) => {
    setForm((prev) => {
      const times = [...prev.times]
      times[idx] = val
      return { ...prev, times }
    })
  }

  const validate = () => {
    const errs: Partial<NewMedForm> = {}
    if (!form.name.trim()) errs.name = '请输入药品名称'
    if (!form.dosage.trim()) errs.dosage = '请输入剂量'
    if (form.times.length === 0) errs.times = ['请至少添加一个服药时间'] as string[]
    return errs
  }

  const handleSubmit = () => {
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    addMedication({
      name: form.name.trim(),
      dosage: form.dosage.trim(),
      disease: form.disease.trim() || '其他',
      notes: form.notes.trim(),
      times: form.times,
      isCustom: true,
    })
    setForm({ ...emptyForm })
    setErrors({})
    setShowForm(false)
  }

  const MedItem = ({ med, isCustom }: { med: typeof medications[0]; isCustom: boolean }) => {
    const expanded = expandedId === med.id
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-3 overflow-hidden">
        <div
          className="flex items-center gap-3 p-4 cursor-pointer"
          onClick={() => setExpandedId(expanded ? null : med.id)}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isCustom ? 'bg-purple-100' : 'bg-orange-100'}`}>
            <Pill size={20} className={isCustom ? 'text-purple-500' : 'text-orange-500'} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-gray-800 truncate">{med.name}</p>
              {isCustom && (
                <span className="text-xs bg-purple-100 text-purple-500 px-1.5 py-0.5 rounded-full flex-shrink-0">自定义</span>
              )}
            </div>
            <p className="text-sm text-gray-400">{med.dosage} · {med.disease}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {isCustom && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeMedication(med.id)
                }}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-400 active:scale-95 transition-all"
              >
                <Trash2 size={15} />
              </button>
            )}
            {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
          </div>
        </div>
        {expanded && (
          <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-2">
            <div className="flex items-start gap-2">
              <Clock size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400 mb-1">服药时间</p>
                <div className="flex flex-wrap gap-2">
                  {med.times.map((t) => (
                    <span key={t} className="bg-orange-50 text-orange-600 text-sm font-medium px-2.5 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </div>
            </div>
            {med.notes && (
              <div className="bg-amber-50 rounded-xl p-2.5">
                <p className="text-xs text-amber-600">💡 {med.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#FFF8F5] pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-orange-400 to-orange-500 px-5 pt-6 pb-10 text-white">
        <h1 className="text-3xl font-bold">我的药品</h1>
        <p className="text-orange-100 mt-1 text-sm">管理全部服药清单</p>
        <div className="mt-3 flex gap-3">
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
            <p className="text-xl font-bold">{medications.length}</p>
            <p className="text-xs text-orange-100">总药品</p>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
            <p className="text-xl font-bold">{presetMeds.length}</p>
            <p className="text-xs text-orange-100">系统药品</p>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
            <p className="text-xl font-bold">{customMeds.length}</p>
            <p className="text-xs text-orange-100">自定义</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6">
        {/* 系统预设药品 */}
        <div className="mb-5">
          <h3 className="text-base font-bold text-gray-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-orange-400 rounded-full" />
            系统药品（{presetMeds.length}）
          </h3>
          {presetMeds.map((med) => (
            <MedItem key={med.id} med={med} isCustom={false} />
          ))}
        </div>

        {/* 自定义药品 */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-600 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-400 rounded-full" />
              自定义药品（{customMeds.length}）
            </h3>
          </div>
          {customMeds.length === 0 && !showForm && (
            <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center mb-3">
              <p className="text-gray-400 text-sm">还没有自定义药品</p>
              <p className="text-gray-300 text-xs mt-1">点击下方按钮添加</p>
            </div>
          )}
          {customMeds.map((med) => (
            <MedItem key={med.id} med={med} isCustom={true} />
          ))}
        </div>

        {/* 添加药品表单 */}
        {showForm ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 mb-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Plus size={18} className="text-purple-500" />
                添加自定义药品
              </h3>
              <button
                onClick={() => { setShowForm(false); setErrors({}) }}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400 active:scale-95"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3">
              {/* 药品名称 */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  药品名称 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="如：阿莫西林胶囊"
                  value={form.name}
                  onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: undefined })) }}
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-gray-800 outline-none transition-colors text-sm
                    ${errors.name ? 'border-red-300' : 'border-gray-200 focus:border-purple-400'}`}
                />
                {errors.name && <p className="text-red-400 text-xs mt-0.5">{errors.name}</p>}
              </div>

              {/* 剂量 */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  剂量 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="如：500mg / 2片"
                  value={form.dosage}
                  onChange={(e) => { setForm((p) => ({ ...p, dosage: e.target.value })); setErrors((p) => ({ ...p, dosage: undefined })) }}
                  className={`w-full border-2 rounded-xl px-3 py-2.5 text-gray-800 outline-none transition-colors text-sm
                    ${errors.dosage ? 'border-red-300' : 'border-gray-200 focus:border-purple-400'}`}
                />
                {errors.dosage && <p className="text-red-400 text-xs mt-0.5">{errors.dosage}</p>}
              </div>

              {/* 适应症 */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">适应症（选填）</label>
                <input
                  type="text"
                  placeholder="如：高血压、糖尿病、其他"
                  value={form.disease}
                  onChange={(e) => setForm((p) => ({ ...p, disease: e.target.value }))}
                  className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2.5 text-gray-800 outline-none transition-colors text-sm"
                />
              </div>

              {/* 备注 */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">服用备注（选填）</label>
                <input
                  type="text"
                  placeholder="如：饭后服用、不可与牛奶同服"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full border-2 border-gray-200 focus:border-purple-400 rounded-xl px-3 py-2.5 text-gray-800 outline-none transition-colors text-sm"
                />
              </div>

              {/* 服药时间 */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-2 block">
                  服药时间 <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  {form.times.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="flex items-center border-2 border-gray-200 focus-within:border-purple-400 rounded-xl px-3 py-2 flex-1 transition-colors">
                        <Clock size={14} className="text-gray-400 mr-2 flex-shrink-0" />
                        <input
                          type="time"
                          value={t}
                          onChange={(e) => updateTime(idx, e.target.value)}
                          className="flex-1 text-gray-800 text-sm outline-none bg-transparent"
                        />
                      </div>
                      {form.times.length > 1 && (
                        <button
                          onClick={() => removeTime(idx)}
                          className="w-8 h-8 flex items-center justify-center bg-red-50 rounded-xl text-red-400 flex-shrink-0 active:scale-95"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {form.times.length < 6 && (
                  <button
                    onClick={addTime}
                    className="mt-2 flex items-center gap-1.5 text-purple-500 text-xs font-medium active:scale-95"
                  >
                    <Plus size={14} /> 添加服药时间
                  </button>
                )}
                {errors.times && <p className="text-red-400 text-xs mt-0.5">{errors.times[0]}</p>}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-purple-200 active:scale-95 transition-all"
            >
              💊 保存药品
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-purple-200 hover:-translate-y-0.5 active:scale-95 transition-all mb-4"
          >
            <Plus size={20} />
            添加自定义药品
          </button>
        )}
      </div>
    </div>
  )
}
