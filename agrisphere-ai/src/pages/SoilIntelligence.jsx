import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { Layers, Thermometer, Zap, FlaskConical } from 'lucide-react'

const SOIL_PROFILES = [
  { depth: '0-15cm', label: 'Capa superficial', n: 42, p: 18, k: 85, ph: 6.8, ec: 0.4 },
  { depth: '15-35cm', label: 'Zona radicular', n: 38, p: 22, k: 71, ph: 7.0, ec: 0.5 },
  { depth: '35-60cm', label: 'Subsuelo superior', n: 21, p: 14, k: 55, ph: 7.2, ec: 0.6 },
  { depth: '60-90cm', label: 'Subsuelo medio', n: 12, p: 9, k: 38, ph: 7.4, ec: 0.7 },
]

export default function SoilIntelligence({ telemetry }) {
  const { moisture } = telemetry

  const radarData = [
    { metric: 'Humedad', A: moisture.A, B: moisture.B, C: moisture.C },
    { metric: 'Nitrógeno', A: 42, B: 55, C: 38 },
    { metric: 'Fósforo', A: 18, B: 22, C: 31 },
    { metric: 'Potasio', A: 85, B: 71, C: 62 },
    { metric: 'pH norm.', A: 68, B: 70, C: 72 },
    { metric: 'CE', A: 40, B: 50, C: 35 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full p-4 overflow-y-auto space-y-4"
    >
      <div>
        <h2 className="font-display font-bold text-xl text-neon-50">Inteligencia del Suelo</h2>
        <p className="font-outfit text-sm text-sage-400">Análisis composicional y de humedad radicular</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {/* Radar */}
        <div className="glass rounded-2xl p-4 border border-neon-700/15 col-span-1">
          <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">Perfil Multi-zona</h3>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(34,197,94,0.1)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: '#4d7a5a', fontFamily: 'DM Mono' }} />
              <Radar name="Zona A" dataKey="A" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
              <Radar name="Zona B" dataKey="B" stroke="#22c55e" fill="#22c55e" fillOpacity={0.1} />
              <Radar name="Zona C" dataKey="C" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {[{ label: 'Zona A', color: '#ef4444' }, { label: 'Zona B', color: '#22c55e' }, { label: 'Zona C', color: '#38bdf8' }].map(z => (
              <div key={z.label} className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: z.color }} />
                <span className="font-mono text-[9px] text-sage-400">{z.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Soil profile layers */}
        <div className="glass rounded-2xl p-4 border border-neon-700/15 col-span-2">
          <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">Perfil de Suelo por Profundidad</h3>
          <div className="space-y-2">
            {SOIL_PROFILES.map((layer, i) => (
              <motion.div
                key={layer.depth}
                className="rounded-xl p-3 border border-neon-700/10"
                style={{ background: `rgba(34,197,94,${0.04 - i * 0.008})` }}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 flex-shrink-0">
                    <div className="font-mono text-[10px] text-neon-400 font-bold">{layer.depth}</div>
                    <div className="font-mono text-[8px] text-sage-500">{layer.label}</div>
                  </div>
                  {[
                    { label: 'N', value: layer.n, unit: 'mg/kg', color: '#22c55e' },
                    { label: 'P', value: layer.p, unit: 'mg/kg', color: '#38bdf8' },
                    { label: 'K', value: layer.k, unit: 'mg/kg', color: '#f59e0b' },
                    { label: 'pH', value: layer.ph, unit: '', color: '#a78bfa' },
                    { label: 'CE', value: layer.ec, unit: 'dS/m', color: '#fb923c' },
                  ].map(n => (
                    <div key={n.label} className="flex-1 text-center">
                      <div className="font-mono text-[8px] text-sage-500">{n.label}</div>
                      <div className="font-mono text-xs font-bold" style={{ color: n.color }}>{n.value}{n.unit}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Moisture over depth */}
      <div className="grid grid-cols-3 gap-3">
        {['A', 'B', 'C'].map(zone => {
          const pct = moisture[zone]
          const color = pct < 25 ? '#ef4444' : pct < 40 ? '#f59e0b' : pct < 70 ? '#22c55e' : '#38bdf8'
          const depths = [
            { d: '0-15', v: Math.min(100, pct * 1.3) },
            { d: '15-35', v: pct },
            { d: '35-60', v: pct * 0.85 },
            { d: '60-90', v: pct * 0.6 },
          ]
          return (
            <div key={zone} className="glass rounded-2xl p-4 border border-neon-700/15">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-display font-semibold text-sm text-neon-100">Zona {zone}</h3>
                <span className="font-mono text-lg font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
              </div>
              <div className="space-y-2">
                {depths.map(d => (
                  <div key={d.d}>
                    <div className="flex justify-between mb-0.5">
                      <span className="font-mono text-[9px] text-sage-500">{d.d}cm</span>
                      <span className="font-mono text-[10px]" style={{ color }}>{d.v.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-void/60 rounded-full overflow-hidden">
                      <motion.div className="h-full rounded-full" style={{ background: color, width: `${d.v}%` }}
                        animate={{ width: `${d.v}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}
