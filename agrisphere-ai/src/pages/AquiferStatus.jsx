import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { Waves, AlertTriangle, TrendingDown, BarChart3, Droplets } from 'lucide-react'

const WELLS = [
  { id: 'P-01', name: 'Pozo Norte', depth: 18.4, level: 72, trend: 'stable', pumping: 2.1 },
  { id: 'P-02', name: 'Pozo Central', depth: 24.1, level: 58, trend: 'declining', pumping: 3.4 },
  { id: 'P-03', name: 'Pozo Sur', depth: 31.8, level: 34, trend: 'critical', pumping: 4.8 },
  { id: 'P-04', name: 'Pozo Auxiliar', depth: 12.2, level: 88, trend: 'stable', pumping: 1.2 },
]

export default function AquiferStatus({ telemetry }) {
  const { water, charts } = telemetry
  const stressColor = water.aquiferStress > 75 ? '#ef4444' : water.aquiferStress > 50 ? '#f59e0b' : '#22c55e'

  // 30-day depth projection
  const projection = Array.from({ length: 30 }, (_, i) => ({
    day: `D+${i}`,
    depth: parseFloat(water.aquiferDepth) + i * (water.aquiferStress > 60 ? 0.18 : 0.05) + (Math.random() - 0.5) * 0.5,
    critical: 45,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full p-4 overflow-y-auto space-y-4"
    >
      <div>
        <h2 className="font-display font-bold text-xl text-neon-50">Estado del Acuífero</h2>
        <p className="font-outfit text-sm text-sage-400">Monitoreo de agua subterránea — Valle Alto de Cochabamba</p>
      </div>

      {/* Hero stress gauge */}
      <div className="grid grid-cols-4 gap-3">
        <motion.div
          className="glass rounded-2xl p-5 border col-span-1"
          style={{ borderColor: stressColor + '50' }}
          animate={{ boxShadow: [`0 0 20px ${stressColor}22`, `0 0 40px ${stressColor}15`, `0 0 20px ${stressColor}22`] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Waves size={14} style={{ color: stressColor }} />
            <span className="font-mono text-[9px] text-sage-500">ESTRÉS ACUÍFERO</span>
          </div>
          <div className="font-display font-bold text-4xl" style={{ color: stressColor }}>{water.aquiferStress}%</div>
          <div className="mt-2 h-1.5 bg-void/60 rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: stressColor }}
              animate={{ width: `${water.aquiferStress}%` }} transition={{ duration: 1 }} />
          </div>
          {water.aquiferStress > 65 && (
            <div className="mt-2 flex items-center gap-1">
              <AlertTriangle size={9} style={{ color: stressColor }} />
              <span className="font-mono text-[8px]" style={{ color: stressColor }}>PRESIÓN ALTA</span>
            </div>
          )}
        </motion.div>

        {[
          { icon: TrendingDown, label: 'Profundidad Actual', value: `${water.aquiferDepth}m`, sub: 'nivel freático', color: '#38bdf8' },
          { icon: Droplets, label: 'Recarga Estimada', value: '4.2 mm/d', sub: 'precipitación efectiva', color: '#22c55e' },
          { icon: BarChart3, label: 'Extracción Total', value: `${(water.consumption / 1000).toFixed(1)}k L/d`, sub: 'todos los pozos', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5 border border-neon-700/15">
            <s.icon size={14} style={{ color: s.color }} className="mb-2" />
            <div className="font-mono text-[9px] text-sage-500 mb-1">{s.label.toUpperCase()}</div>
            <div className="font-display font-bold text-2xl" style={{ color: s.color }}>{s.value}</div>
            <div className="font-mono text-[9px] text-sage-500 mt-1">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Depth trend */}
        <div className="glass rounded-2xl p-4 border border-neon-700/15">
          <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">Proyección 30 días — Nivel Freático</h3>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={projection}>
              <defs>
                <linearGradient id="depthGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 7, fill: '#4d7a5a', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 7, fill: '#4d7a5a', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(6,18,9,0.95)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="depth" stroke="#0ea5e9" strokeWidth={2} fill="url(#depthGrad)" dot={false} name="Prof. (m)" />
              <Line type="monotone" dataKey="critical" stroke="rgba(239,68,68,0.5)" strokeWidth={1} strokeDasharray="4,4" dot={false} name="Límite crítico" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Wells */}
        <div className="glass rounded-2xl p-4 border border-neon-700/15">
          <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">Estado de Pozos</h3>
          <div className="space-y-3">
            {WELLS.map(well => {
              const color = well.trend === 'critical' ? '#ef4444' : well.trend === 'declining' ? '#f59e0b' : '#22c55e'
              return (
                <div key={well.id} className="flex items-center gap-3 rounded-xl p-2.5 bg-void/40 border border-neon-700/10">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }}>
                    {well.trend === 'critical' && (
                      <motion.div className="w-2 h-2 rounded-full" style={{ background: color }}
                        animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-mono text-[10px] font-bold text-neon-200">{well.name}</span>
                      <span className="font-mono text-[9px]" style={{ color }}>{well.trend.toUpperCase()}</span>
                    </div>
                    <div className="h-1 bg-void/60 rounded-full mt-1 overflow-hidden">
                      <div className="h-full rounded-full" style={{ background: color, width: `${well.level}%`, opacity: 0.8 }} />
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-xs font-bold text-neon-200">{well.depth}m</div>
                    <div className="font-mono text-[8px] text-sage-500">{well.pumping} m³/h</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sustainability score */}
      <div className="glass rounded-2xl p-4 border border-neon-700/15">
        <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">
          Índice de Sostenibilidad Hídrica — Cliza, Valle Alto
        </h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { label: 'Tasa de Recarga', score: 62, unit: 'mm/año' },
            { label: 'Tasa Extracción', score: 100 - water.aquiferStress, unit: '%' },
            { label: 'Calidad Agua', score: 78, unit: 'índice' },
            { label: 'Cobertura Vegetal', score: 54, unit: '%' },
            { label: 'Eficiencia Uso', score: water.efficiency, unit: '%' },
          ].map(m => {
            const c = m.score > 65 ? '#22c55e' : m.score > 40 ? '#f59e0b' : '#ef4444'
            return (
              <div key={m.label} className="rounded-xl p-3 bg-void/40 border border-neon-700/10 text-center">
                <div className="font-mono text-[9px] text-sage-500 mb-2">{m.label.toUpperCase()}</div>
                <div className="relative w-12 h-12 mx-auto mb-2">
                  <svg viewBox="0 0 44 44" className="rotate-[-90deg]">
                    <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="4" />
                    <motion.circle cx="22" cy="22" r="18" fill="none" stroke={c} strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 18}`}
                      animate={{ strokeDashoffset: 2 * Math.PI * 18 * (1 - m.score / 100) }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-[10px] font-bold" style={{ color: c }}>{m.score}</span>
                  </div>
                </div>
                <div className="font-mono text-[8px] text-sage-500">{m.unit}</div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
