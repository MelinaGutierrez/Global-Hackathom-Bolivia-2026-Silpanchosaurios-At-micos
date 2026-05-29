import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white rounded-lg p-2 border border-gray-200 shadow-float text-xs">
      <div className="font-outfit text-gray-400 mb-1">{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} className="flex justify-between gap-3">
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
      <div className="flex items-center gap-3 mb-2">
        {[{ k:'A', c:'#ef4444' }, { k:'B', c:'#16a34a' }, { k:'C', c:'#3b82f6' }].map(z => (
          <div key={z.k} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: z.c }} />
            <span className="text-[9px] font-outfit text-gray-400">Z-{z.k}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart data={recent} margin={{ top: 4, right: 0, bottom: 0, left: -24 }}>
          <defs>
            {[['A','#ef4444'],['B','#16a34a'],['C','#3b82f6']].map(([k,c]) => (
              <linearGradient key={k} id={`mg${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={c} stopOpacity={0.2}/>
                <stop offset="95%" stopColor={c} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="hour" tick={{ fontSize: 7, fill: '#9ca3af', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} interval={4} />
          <YAxis domain={[0,100]} tick={{ fontSize: 7, fill: '#9ca3af', fontFamily: 'DM Mono' }} tickLine={false} axisLine={false} />
          <ReferenceLine y={30} stroke="rgba(239,68,68,0.2)" strokeDasharray="3,3" />
          <ReferenceLine y={70} stroke="rgba(59,130,246,0.2)" strokeDasharray="3,3" />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="A" stroke="#ef4444" strokeWidth={1.5} fill="url(#mgA)" dot={false} />
          <Area type="monotone" dataKey="B" stroke="#16a34a" strokeWidth={1.5} fill="url(#mgB)" dot={false} />
          <Area type="monotone" dataKey="C" stroke="#3b82f6" strokeWidth={1.5} fill="url(#mgC)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
