import { motion } from 'framer-motion'
import { Battery, Wifi, Navigation, AlertTriangle, Route, Cpu, Activity, Radio } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function RoverMonitoring({ telemetry }) {
  const { rover } = telemetry
  const isOnline = rover.status === 'ONLINE'

  // Generate signal history
  const signalHistory = Array.from({ length: 20 }, (_, i) => ({
    t: `${i * 3}s`,
    signal: Math.max(0, rover.signal + (Math.random() - 0.5) * 20),
    battery: Math.max(0, rover.battery - i * 0.1),
  }))

  const battColor = rover.battery < 20 ? '#ef4444' : rover.battery < 50 ? '#f59e0b' : '#22c55e'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full p-4 overflow-y-auto space-y-4"
    >
      <div>
        <h2 className="font-display font-bold text-xl text-neon-50">Monitoreo del Rover</h2>
        <p className="font-outfit text-sm text-sage-400">Telemetría en tiempo real — Unidad AGRS-01</p>
      </div>

      {/* Status hero */}
      <div className="grid grid-cols-4 gap-3">
        <motion.div
          className="glass rounded-2xl p-5 border col-span-1"
          style={{ borderColor: isOnline ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)' }}
          animate={{ boxShadow: isOnline ? ['0 0 20px rgba(34,197,94,0.2)', '0 0 40px rgba(34,197,94,0.15)', '0 0 20px rgba(34,197,94,0.2)'] : ['0 0 20px rgba(239,68,68,0.2)', '0 0 40px rgba(239,68,68,0.15)', '0 0 20px rgba(239,68,68,0.2)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Radio size={14} style={{ color: isOnline ? '#22c55e' : '#ef4444' }} />
            <span className="font-mono text-xs text-sage-400">ESTADO</span>
          </div>
          <div className="font-display font-bold text-2xl" style={{ color: isOnline ? '#22c55e' : '#ef4444' }}>
            {rover.status}
          </div>
          <div className="font-mono text-xs text-sage-500 mt-1">{rover.mode}</div>
        </motion.div>

        {[
          { icon: Battery, label: 'Batería', value: `${rover.battery}%`, color: battColor, sub: rover.battery < 20 ? 'CARGA URGENTE' : 'Normal' },
          { icon: Wifi, label: 'Señal', value: `${rover.signal}%`, color: rover.signal < 40 ? '#ef4444' : '#22c55e', sub: `${rover.syncLatency}ms latencia` },
          { icon: Route, label: 'Ruta Completa', value: `${rover.routeProgress}%`, color: '#38bdf8', sub: `${rover.failures} fallo(s)` },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-2xl p-5 border border-neon-700/15">
            <div className="flex items-center gap-2 mb-3">
              <stat.icon size={14} className="text-sage-400" />
              <span className="font-mono text-xs text-sage-400">{stat.label.toUpperCase()}</span>
            </div>
            <div className="font-display font-bold text-2xl" style={{ color: stat.color }}>{stat.value}</div>
            <div className="font-mono text-[10px] text-sage-500 mt-1">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Signal chart */}
        <div className="glass rounded-2xl p-4 border border-neon-700/15">
          <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">Histórico de Señal</h3>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={signalHistory}>
              <XAxis dataKey="t" tick={{ fontSize: 7, fill: '#4d7a5a', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 7, fill: '#4d7a5a', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(6,18,9,0.95)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="signal" stroke="#22c55e" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Position */}
        <div className="glass rounded-2xl p-4 border border-neon-700/15">
          <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">Posición GPS</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Latitud', value: `${rover.lat?.toFixed(6)}°` },
              { label: 'Longitud', value: `${rover.lng?.toFixed(6)}°` },
              { label: 'Velocidad', value: `${rover.speed?.toFixed(2)} m/s` },
              { label: 'Fallos', value: rover.failures, danger: rover.failures > 0 },
            ].map(f => (
              <div key={f.label} className="rounded-xl p-3 bg-void/40 border border-neon-700/10">
                <div className="font-mono text-[9px] text-sage-500 mb-1">{f.label.toUpperCase()}</div>
                <div className={`font-mono text-sm font-bold ${f.danger ? 'text-critical' : 'text-neon-200'}`}>{f.value}</div>
              </div>
            ))}
          </div>

          {rover.failures > 0 && (
            <motion.div
              className="mt-3 flex items-center gap-2 rounded-lg p-2 bg-critical/8 border border-critical/30"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <AlertTriangle size={11} className="text-critical" />
              <span className="font-mono text-[9px] text-critical">Rover en modo de recuperación</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Diagnostics */}
      <div className="glass rounded-2xl p-4 border border-neon-700/15">
        <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">Diagnóstico del Sistema</h3>
        <div className="grid grid-cols-5 gap-2">
          {[
            { label: 'Motor izq.', ok: isOnline },
            { label: 'Motor der.', ok: isOnline },
            { label: 'LiDAR', ok: isOnline },
            { label: 'GPS', ok: isOnline || rover.signal > 20 },
            { label: 'Soil probe', ok: rover.failures === 0 },
            { label: 'Radio 4G', ok: rover.signal > 30 },
            { label: 'Cámara', ok: isOnline },
            { label: 'IMU', ok: isOnline },
            { label: 'Temp sensor', ok: true },
            { label: 'Batería BMS', ok: rover.battery > 5 },
          ].map((d) => (
            <div key={d.label} className="rounded-lg p-2.5 bg-void/40 border border-neon-700/10">
              <div className={`w-2 h-2 rounded-full mb-1.5 ${d.ok ? 'bg-neon-400' : 'bg-critical'}`}>
                {d.ok && <motion.div className="w-2 h-2 rounded-full bg-neon-400" animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }} transition={{ duration: 2, repeat: Infinity }} />}
              </div>
              <div className="font-mono text-[9px] text-sage-400">{d.label}</div>
              <div className={`font-mono text-[9px] font-bold ${d.ok ? 'text-neon-400' : 'text-critical'}`}>{d.ok ? 'OK' : 'FAIL'}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
