import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass-strong rounded-lg p-2.5 border border-aquifer/30 text-xs">
      <div className="font-mono text-sage-400 mb-1">{label}</div>
      <div className="font-mono font-bold text-aquifer">{payload[0]?.value?.toFixed(1)}m prof.</div>
    </div>
  )
}

export default function AquiferDepth({ data }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="font-display font-semibold text-xs text-neon-100">Profundidad Acuífero — 12 meses</span>
        <span className="font-mono text-[9px] text-aquifer">metros bajo tierra</span>
      </div>
      <ResponsiveContainer width="100%" height={90}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={14}>
          <XAxis dataKey="month" tick={{ fontSize: 7, fill: '#4d7a5a', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 7, fill: '#4d7a5a', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="depth" radius={[3, 3, 0, 0]}>
            {data?.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.depth > 35 ? '#ef4444' : entry.depth > 25 ? '#f59e0b' : '#0ea5e9'}
                opacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
