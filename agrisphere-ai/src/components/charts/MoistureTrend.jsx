import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { motion } from 'framer-motion'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-lg p-2.5 border border-neon-500/30 text-xs">
      <div className="font-mono text-sage-400 mb-1.5">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-4 mb-0.5">
          <span className="font-outfit" style={{ color: p.color }}>Zona {p.dataKey}</span>
          <span className="font-mono font-bold" style={{ color: p.color }}>{p.value?.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

export default function MoistureTrend({ data }) {
  const recent = data?.slice(-12) || []

  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="font-display font-semibold text-xs text-neon-100">Humedad Radicular — 24h</span>
        <div className="flex items-center gap-3">
          {[{ key: 'A', color: '#ef4444' }, { key: 'B', color: '#22c55e' }, { key: 'C', color: '#38bdf8' }].map(z => (
            <div key={z.key} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ background: z.color }} />
              <span className="font-mono text-[9px] text-sage-400">Z-{z.key}</span>
            </div>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={100}>
        <AreaChart data={recent} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradC" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="hour" tick={{ fontSize: 7, fill: '#4d7a5a', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} interval={3} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 7, fill: '#4d7a5a', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
          <ReferenceLine y={30} stroke="rgba(239,68,68,0.3)" strokeDasharray="4,4" />
          <ReferenceLine y={70} stroke="rgba(56,189,248,0.3)" strokeDasharray="4,4" />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="A" stroke="#ef4444" strokeWidth={1.5} fill="url(#gradA)" dot={false} />
          <Area type="monotone" dataKey="B" stroke="#22c55e" strokeWidth={1.5} fill="url(#gradB)" dot={false} />
          <Area type="monotone" dataKey="C" stroke="#38bdf8" strokeWidth={1.5} fill="url(#gradC)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
