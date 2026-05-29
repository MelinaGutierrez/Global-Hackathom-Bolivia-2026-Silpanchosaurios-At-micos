import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const INK   = '#0f172a'
const GREEN = '#16a34a'
const ink   = (o) => `rgba(15,23,42,${o})`
const gn    = (o) => `rgba(22,163,74,${o})`

// Zone A: ink (may be dry), Zone B: green, Zone C: mid-ink
const ZONE_COLORS = { A: INK, B: GREEN, C: gn(0.55) }

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background:'#fff', borderRadius:8, padding:'8px 10px',
      border:`1px solid ${ink(0.10)}`, boxShadow:'0 4px 12px rgba(0,0,0,0.07)',
      fontFamily:'Outfit'
    }}>
      <div style={{ fontSize:9, fontWeight:500, color:ink(0.40), marginBottom:4, letterSpacing:'0.05em', textTransform:'uppercase' }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ display:'flex', justifyContent:'space-between', gap:12, fontSize:11 }}>
          <span style={{ color:ZONE_COLORS[p.dataKey], fontWeight:500 }}>Zone {p.dataKey}</span>
          <span style={{ color:ZONE_COLORS[p.dataKey], fontWeight:700 }}>{p.value?.toFixed(1)}%</span>
        </div>
      ))}
    </div>
  )
}

export default function MoistureTrend({ data }) {
  const recent = data?.slice(-12) || []
  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:6 }}>
        {Object.entries(ZONE_COLORS).map(([k,c]) => (
          <div key={k} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:c }} />
            <span style={{ fontFamily:'Outfit', fontSize:9, fontWeight:500, color:ink(0.40), letterSpacing:'0.04em' }}>
              Zone {k}
            </span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={72}>
        <AreaChart data={recent} margin={{ top:4, right:0, bottom:0, left:-24 }}>
          <defs>
            {Object.entries(ZONE_COLORS).map(([k,c]) => (
              <linearGradient key={k} id={`mg${k}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={c} stopOpacity={0.18}/>
                <stop offset="95%" stopColor={c} stopOpacity={0}/>
              </linearGradient>
            ))}
          </defs>
          <XAxis dataKey="hour"
            tick={{ fontSize:7, fill:ink(0.35), fontFamily:'Outfit' }}
            tickLine={false} axisLine={false} interval={4} />
          <YAxis domain={[0,100]}
            tick={{ fontSize:7, fill:ink(0.35), fontFamily:'Outfit' }}
            tickLine={false} axisLine={false} />
          <ReferenceLine y={30} stroke={ink(0.12)} strokeDasharray="3,3" />
          <ReferenceLine y={70} stroke={gn(0.18)} strokeDasharray="3,3" />
          <Tooltip content={<CustomTooltip />} />
          {Object.entries(ZONE_COLORS).map(([k,c]) => (
            <Area key={k} type="monotone" dataKey={k}
              stroke={c} strokeWidth={1.5} fill={`url(#mg${k})`} dot={false} />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
