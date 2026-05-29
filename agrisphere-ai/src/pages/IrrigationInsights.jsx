import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts'
import { Droplets, TrendingDown, Zap, CheckCircle } from 'lucide-react'

const WEEKLY_DATA = [
  { day: 'Lun', actual: 4200, optimal: 3800, saved: 0 },
  { day: 'Mar', actual: 3100, optimal: 3800, saved: 700 },
  { day: 'Mié', actual: 2800, optimal: 3600, saved: 800 },
  { day: 'Jue', actual: 5200, optimal: 4000, saved: -1200 },
  { day: 'Vie', actual: 3600, optimal: 3700, saved: 100 },
  { day: 'Sáb', actual: 2400, optimal: 3200, saved: 800 },
  { day: 'Dom', actual: 1800, optimal: 2800, saved: 1000 },
]

export default function IrrigationInsights({ telemetry }) {
  const { water, ai, moisture } = telemetry

  const totalSaved = WEEKLY_DATA.reduce((s, d) => s + Math.max(0, d.saved), 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full p-4 overflow-y-auto space-y-4"
    >
      <div>
        <h2 className="font-display font-bold text-xl text-neon-50">Insights de Riego</h2>
        <p className="font-outfit text-sm text-sage-400">Análisis de eficiencia y optimización IA</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Droplets, label: 'Agua Ahorrada Semana', value: `${(totalSaved / 1000).toFixed(1)}k L`, color: '#22c55e', sub: 'vs. riego tradicional' },
          { icon: TrendingDown, label: 'Eficiencia de Riego', value: `${water.efficiency}%`, color: '#38bdf8', sub: 'índice IA optimizado' },
          { icon: Zap, label: 'Decisión IA Actual', value: ai.decision.replace(/_/g, ' '), color: ai.riskLevel === 'CRITICAL' ? '#ef4444' : '#22c55e', sub: `${ai.confidence}% confianza` },
          { icon: CheckCircle, label: 'Zonas Estables', value: `${[moisture.A, moisture.B, moisture.C].filter(m => m >= 40 && m < 70).length}/3`, color: '#a78bfa', sub: 'dentro de rango óptimo' },
        ].map((kpi) => (
          <div key={kpi.label} className="glass rounded-2xl p-4 border border-neon-700/15">
            <kpi.icon size={14} style={{ color: kpi.color }} className="mb-2" />
            <div className="font-mono text-[9px] text-sage-500 mb-1">{kpi.label.toUpperCase()}</div>
            <div className="font-display font-bold text-xl" style={{ color: kpi.color }}>{kpi.value}</div>
            <div className="font-mono text-[9px] text-sage-500 mt-1">{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Weekly consumption */}
        <div className="glass rounded-2xl p-4 border border-neon-700/15">
          <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">Consumo Semanal vs. Óptimo IA (L)</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={WEEKLY_DATA} barGap={4}>
              <XAxis dataKey="day" tick={{ fontSize: 8, fill: '#4d7a5a', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 7, fill: '#4d7a5a', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(6,18,9,0.95)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="actual" fill="rgba(34,197,94,0.5)" radius={[3, 3, 0, 0]} name="Consumo real" />
              <Bar dataKey="optimal" fill="rgba(56,189,248,0.3)" radius={[3, 3, 0, 0]} name="Óptimo IA" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* AI recommendations log */}
        <div className="glass rounded-2xl p-4 border border-neon-700/15">
          <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">Historial de Decisiones IA</h3>
          <div className="space-y-2">
            {[
              { time: '08:32', decision: 'IRRIGATE_NOW', zone: 'A', vol: 22, conf: 94 },
              { time: '07:15', decision: 'STABLE', zone: 'B', vol: null, conf: 91 },
              { time: '06:48', decision: 'CONSERVE_WATER', zone: 'ALL', vol: 8, conf: 88 },
              { time: '05:20', decision: 'STABLE', zone: 'C', vol: null, conf: 93 },
              { time: '04:01', decision: 'STOP_IRRIGATION', zone: 'C', vol: 0, conf: 97 },
              { time: 'Ayer', decision: 'IRRIGATE_NOW', zone: 'A/B', vol: 18, conf: 89 },
            ].map((log, i) => {
              const color = log.decision === 'IRRIGATE_NOW' ? '#ef4444' : log.decision === 'STOP_IRRIGATION' ? '#38bdf8' : log.decision === 'CONSERVE_WATER' ? '#8b5cf6' : '#22c55e'
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 rounded-lg p-2 bg-void/40 border border-neon-700/10"
                >
                  <span className="font-mono text-[9px] text-sage-500 w-10 flex-shrink-0">{log.time}</span>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="font-mono text-[10px] font-bold flex-1" style={{ color }}>{log.decision.replace(/_/g, ' ')}</span>
                  <span className="font-mono text-[9px] text-sage-500">Z-{log.zone}</span>
                  {log.vol != null && <span className="font-mono text-[9px] text-neon-300">{log.vol}L/m²</span>}
                  <span className="font-mono text-[9px] text-sage-600">{log.conf}%</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Irrigation schedule */}
      <div className="glass rounded-2xl p-4 border border-neon-700/15">
        <h3 className="font-display font-semibold text-sm text-neon-100 mb-3">Programa de Riego IA — Próximas 24h</h3>
        <div className="grid grid-cols-6 gap-2">
          {Array.from({ length: 12 }, (_, i) => {
            const hour = (new Date().getHours() + i * 2) % 24
            const recommend = [2, 3, 8].includes(i)
            const critical = i === 2
            return (
              <div key={i} className={`rounded-xl p-2.5 border text-center ${
                critical ? 'border-critical/40 bg-critical/8' :
                recommend ? 'border-neon-500/30 bg-neon-500/8' :
                'border-neon-700/10 bg-void/40'
              }`}>
                <div className="font-mono text-[9px] text-sage-500 mb-1">{String(hour).padStart(2, '0')}:00</div>
                <div className={`font-mono text-[9px] font-bold ${critical ? 'text-critical' : recommend ? 'text-neon-400' : 'text-sage-600'}`}>
                  {critical ? 'URGENT' : recommend ? 'RIEGO' : 'PAUSA'}
                </div>
                {recommend && <div className="font-mono text-[8px] text-sage-400 mt-0.5">{critical ? '22L' : '12L'}/m²</div>}
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}
