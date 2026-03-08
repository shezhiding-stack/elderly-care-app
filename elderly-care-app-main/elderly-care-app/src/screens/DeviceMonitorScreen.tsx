import { useEffect, useRef } from 'react'
import { useDeviceStore } from '../store/deviceStore'
import {
  getHeartRateStatus,
  getBloodOxygenStatus,
  getTemperatureStatus,
} from '../utils/healthUtils'
import HealthDataCard from '../components/HealthDataCard'
import AlarmCard from '../components/AlarmCard'
import {
  Bluetooth,
  BluetoothOff,
  BluetoothSearching,
  Battery,
  Activity,
  Bell,
  BellOff,
  Trash2,
  Footprints,
  Thermometer,
  Wind,
} from 'lucide-react'

// ── 工具：格式化最后同步时间 ─────────────────────────────
function formatLastSync(iso: string | null) {
  if (!iso) return '从未同步'
  const d = new Date(iso)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ── 电量颜色 ──────────────────────────────────────────────
function batteryColor(pct: number) {
  if (pct <= 15) return '#D32F2F'
  if (pct <= 30) return '#FF9800'
  return '#4CAF50'
}

export default function DeviceMonitorScreen() {
  const {
    device,
    realtimeData,
    alarms,
    isMonitoring,
    connectDevice,
    disconnectDevice,
    startMonitoring,
    stopMonitoring,
    acknowledgeAlarm,
    clearAllAlarms,
  } = useDeviceStore()

  // 页面卸载时停止监测（防止后台继续跑 setInterval）
  const stopRef = useRef(stopMonitoring)
  stopRef.current = stopMonitoring
  useEffect(() => {
    return () => {
      // 切换 tab 时不停止，让数据在后台继续更新
    }
  }, [])

  const unacknowledgedCount = alarms.filter((a) => !a.acknowledged).length

  // ── 连接/断开按钮逻辑 ────────────────────────────────────
  const handleConnectionToggle = () => {
    if (device.status === 'disconnected' || device.status === 'error') {
      connectDevice()
    } else if (device.status === 'connected') {
      disconnectDevice()
    }
  }

  // ── 监测开关逻辑 ─────────────────────────────────────────
  const handleMonitorToggle = () => {
    if (isMonitoring) {
      stopMonitoring()
    } else {
      startMonitoring()
    }
  }

  // ── 状态图标 ─────────────────────────────────────────────
  const BluetoothIcon =
    device.status === 'connected'
      ? Bluetooth
      : device.status === 'connecting'
      ? BluetoothSearching
      : BluetoothOff

  const statusLabel: Record<string, string> = {
    disconnected: '未连接',
    connecting: '连接中…',
    connected: '已连接',
    error: '连接失败',
  }

  const statusColor: Record<string, string> = {
    disconnected: '#9E9E9E',
    connecting: '#FF9800',
    connected: '#4CAF50',
    error: '#D32F2F',
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 pb-4">
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-4 pt-5 pb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-lg opacity-90">智能穿戴设备</div>
            <div className="text-2xl font-bold mt-0.5">{device.name}</div>
            <div className="text-xs opacity-70 mt-0.5">{device.model} · {device.firmwareVersion}</div>
          </div>
          {/* 电量 */}
          <div className="flex flex-col items-center bg-white/20 rounded-2xl px-3 py-2">
            <Battery size={22} color="#fff" />
            <span
              className="text-sm font-bold mt-0.5"
              style={{ color: device.status === 'connected' ? '#fff' : '#ffffffaa' }}
            >
              {Math.floor(device.battery)}%
            </span>
          </div>
        </div>

        {/* 状态栏 */}
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1"
          >
            <BluetoothIcon size={14} color="#fff" />
            <span className="text-xs text-white font-medium">
              {statusLabel[device.status]}
            </span>
            <span
              className="w-1.5 h-1.5 rounded-full ml-0.5"
              style={{ backgroundColor: statusColor[device.status] }}
            />
          </div>
          {device.lastSyncAt && (
            <span className="text-xs text-white/70">
              上次同步 {formatLastSync(device.lastSyncAt)}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 -mt-3">
        {/* ── 操作按钮 ────────────────────────────────────────── */}
        <div className="flex gap-3 mb-4">
          {/* 连接/断开 */}
          <button
            onClick={handleConnectionToggle}
            disabled={device.status === 'connecting'}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-60"
            style={{
              backgroundColor:
                device.status === 'connected' ? '#FFF3E0' : '#E0F2F1',
              color: device.status === 'connected' ? '#E65100' : '#00796B',
            }}
          >
            <BluetoothIcon size={16} />
            {device.status === 'connected'
              ? '断开设备'
              : device.status === 'connecting'
              ? '连接中…'
              : '连接设备'}
          </button>

          {/* 开始/停止监测 */}
          <button
            onClick={handleMonitorToggle}
            disabled={device.status !== 'connected'}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-semibold text-sm shadow-sm transition-all active:scale-95 disabled:opacity-40"
            style={{
              backgroundColor: isMonitoring ? '#FCE4EC' : '#E8F5E9',
              color: isMonitoring ? '#C62828' : '#2E7D32',
            }}
          >
            <Activity size={16} />
            {isMonitoring ? '停止监测' : '开始监测'}
          </button>
        </div>

        {/* ── 实时数据卡片 ─────────────────────────────────────── */}
        {realtimeData ? (
          <>
            <h3 className="text-base font-bold text-gray-700 mb-2 flex items-center gap-1.5">
              <Activity size={16} className="text-teal-500" />
              实时健康数据
              {isMonitoring && (
                <span className="ml-auto flex items-center gap-1 text-xs font-normal text-teal-600">
                  <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse" />
                  监测中
                </span>
              )}
            </h3>

            {/* 心率 + 血氧 */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <HealthDataCard
                label="心率"
                value={realtimeData.heartRate}
                unit="bpm"
                icon="❤️"
                status={getHeartRateStatus(realtimeData.heartRate)}
                isLarge
              />
              <HealthDataCard
                label="血氧 SpO₂"
                value={realtimeData.bloodOxygen}
                unit="%"
                icon="💨"
                status={getBloodOxygenStatus(realtimeData.bloodOxygen)}
                isLarge
              />
            </div>

            {/* 体温 + 步数 */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <HealthDataCard
                label="体温"
                value={realtimeData.temperature}
                unit="°C"
                icon="🌡️"
                status={getTemperatureStatus(realtimeData.temperature)}
              />
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex-1 min-w-0"
                style={{ borderLeft: '4px solid #7C4DFF' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">👟</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: '#7C4DFF', backgroundColor: '#EDE7F6' }}>
                    今日
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {realtimeData.steps.toLocaleString()}
                  <span className="text-sm font-normal text-gray-400 ml-1">步</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">步数</div>
              </div>
            </div>

            {/* 血压（若有） */}
            {realtimeData.systolic !== undefined && realtimeData.diastolic !== undefined && (
              <div className="mb-3">
                <HealthDataCard
                  label="血压（参考）"
                  value={`${realtimeData.systolic}/${realtimeData.diastolic}`}
                  unit="mmHg"
                  icon="🫀"
                  status={
                    realtimeData.systolic >= 140
                      ? { label: '偏高', color: '#F44336', bg: '#FFF3F3' }
                      : { label: '正常', color: '#4CAF50', bg: '#F1F8E9' }
                  }
                />
              </div>
            )}
          </>
        ) : (
          /* 未开始监测时的提示 */
          <div className="bg-white rounded-2xl p-6 text-center mb-4 shadow-sm border border-gray-100">
            {device.status === 'connected' ? (
              <>
                <div className="text-4xl mb-2">📡</div>
                <p className="text-gray-500 text-sm">设备已连接</p>
                <p className="text-gray-400 text-xs mt-1">点击「开始监测」获取实时健康数据</p>
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">⌚</div>
                <p className="text-gray-500 text-sm">暂无数据</p>
                <p className="text-gray-400 text-xs mt-1">请先连接穿戴设备</p>
              </>
            )}
          </div>
        )}

        {/* ── 报警面板 ─────────────────────────────────────────── */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-gray-700 flex items-center gap-1.5">
              {unacknowledgedCount > 0 ? (
                <Bell size={16} className="text-red-500" />
              ) : (
                <BellOff size={16} className="text-gray-400" />
              )}
              报警记录
              {unacknowledgedCount > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unacknowledgedCount}
                </span>
              )}
            </h3>
            {alarms.length > 0 && (
              <button
                onClick={clearAllAlarms}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} />
                清空
              </button>
            )}
          </div>

          {alarms.length === 0 ? (
            <div className="bg-white rounded-2xl p-5 text-center shadow-sm border border-gray-100">
              <div className="text-3xl mb-1">✅</div>
              <p className="text-gray-400 text-sm">暂无异常报警</p>
              <p className="text-gray-300 text-xs mt-0.5">所有指标均在正常范围内</p>
            </div>
          ) : (
            <div>
              {alarms.map((alarm) => (
                <AlarmCard
                  key={alarm.id}
                  alarm={alarm}
                  onAcknowledge={acknowledgeAlarm}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── 监测阈值说明 ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h4 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-1.5">
            <Thermometer size={14} />
            监测阈值参考
          </h4>
          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">❤️ 心率</span>
              <span>50–100 bpm（危险 &lt;40 / &gt;130）</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">💨 血氧</span>
              <span>≥94%（危险 &lt;90%）</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">🌡️ 体温</span>
              <span>36.0–37.3°C（发烧 &gt;38.5°C）</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1">🫀 血压</span>
              <span>&lt;140/90 mmHg</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
