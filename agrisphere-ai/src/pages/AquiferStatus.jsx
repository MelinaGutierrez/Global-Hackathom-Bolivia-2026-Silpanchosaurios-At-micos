import { motion } from 'framer-motion'
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Waves, AlertTriangle, TrendingDown, BarChart3, Droplets } from 'lucide-react'

const INK   = '#0f172a'
const GREEN = '#16a34a'
const ink   = (o) => `rgba(15,23,42,${o})`

const WELLS = [
  { id: 'W-01', name: 'North Well',     depth: 18.4, level: 72, trend: 'stable',    pumping: 2.1 },
  { id: 'W-02', name: 'Central Well',   depth: 24.1, level: 58, trend: 'declining', pumping: 3.4 },
  { id: 'W-03', name: 'South Well',     depth: 31.8, level: 34, trend: 'critical',  pumping: 4.8 },
  { id: 'W-04', name: 'Auxiliary Well', depth: 12.2, level: 88, trend: 'stable',    pumping: 1.2 },
]

function trendColor(t) {
  return { critical: '#dc2626', declining: '#d97706', stable: GREEN }[t] || INK
}

const SUSTAINABILITY = [
  { label: 'Recharge',   score: 62, unit: 'mm/yr' },
  { label: 'Extraction', score: null,unit: '%'     },   // filled from water.aquiferStress
  { label: 'Quality',    score: 78, unit: 'index'  },
  { label: 'Vegetal',    score: 54, unit: '%'       },
  { label: 'Efficiency', score: null,unit: '%'     },   // filled from water.efficiency
]

function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: `1px solid ${ink(0.08)}`, borderRadius: 12, ...style }}>{children}</div>
}

function RingScore({ score, label, unit }) {
  const c   = score > 65 ? GREEN : score > 40 ? '#d97706' : '#dc2626'
  const r   = 17
  const cir = 2 * Math.PI * r
  return (
    <div style={{ background: '#f8fafc', border: `1px solid ${ink(0.07)}`, borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
      <div style={{ fontFamily: 'Outfit', fontSize: 9, fontWeight: 600, color: ink(0.38), letterSpacing: '0.04em', marginBottom: 8 }}>
        {label.toUpperCase()}
      </div>
      <div style={{ position: 'relative', width: 48, height: 48, margin: '0 auto 8px' }}>
        <svg viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
          <circle cx="22" cy="22" r={r} fill="none" stroke={ink(0.07)} strokeWidth={4} />
          <motion.circle cx="22" cy="22" r={r} fill="none" stroke={c} strokeWidth={4}
            strokeDasharray={cir}
            animate={{ strokeDashoffset: cir * (1 - score / 100) }}
            initial={{ strokeDashoffset: cir }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 700, color: c }}>{score}</span>
        </div>
      </div>
      <div style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.35) }}>{unit}</div>
    </div>
  )
}

export default function AquiferStatus({ telemetry }) {
  const { water } = telemetry
  const stress      = water.aquiferStress
  const stressColor = stress > 75 ? '#dc2626' : stress > 50 ? '#d97706' : GREEN

  const projection = Array.from({ length: 30 }, (_, i) => ({
    day: `D+${i}`,
    depth:    parseFloat(water.aquiferDepth) + i * (stress > 60 ? 0.18 : 0.05) + (Math.random() - 0.5) * 0.4,
    critical: 45,
  }))

  const scores = [62, 100 - stress, 78, 54, water.efficiency]

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      style={{ height: '100%', padding: 14, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {/* Top stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
        {/* Stress card */}
        <Card style={{ padding: 15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <Waves size={12} style={{ color: stressColor }} />
            <span style={{ fontFamily: 'Outfit', fontSize: 9, fontWeight: 600, color: ink(0.38), letterSpacing: '0.06em' }}>STRESS LEVEL</span>
          </div>
          <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 30, color: stressColor, lineHeight: 1 }}>{stress}%</div>
          <div style={{ marginTop: 8, height: 5, background: ink(0.06), borderRadius: 4, overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', borderRadius: 4, background: stressColor }}
              animate={{ width: `${stress}%` }} transition={{ duration: 1 }} />
          </div>
          {stress > 65 && (
            <motion.div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 7 }}
              animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
              <AlertTriangle size={9} style={{ color: stressColor }} />
              <span style={{ fontFamily: 'Outfit', fontSize: 9, fontWeight: 600, color: stressColor }}>HIGH PRESSURE</span>
            </motion.div>
          )}
        </Card>

        {[
          { icon: TrendingDown, label: 'WATER TABLE', value: `${water.aquiferDepth} m`,                  sub: 'current depth',          color: '#2563eb' },
          { icon: Droplets,     label: 'RECHARGE',    value: '4.2 mm/d',                                 sub: 'effective precipitation', color: GREEN     },
          { icon: BarChart3,    label: 'EXTRACTION',  value: `${(water.consumption/1000).toFixed(1)}k L/d`, sub: 'all wells / day',      color: '#d97706' },
        ].map(s => (
          <Card key={s.label} style={{ padding: 15 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
              <s.icon size={12} style={{ color: s.color }} />
              <span style={{ fontFamily: 'Outfit', fontSize: 9, fontWeight: 600, color: ink(0.38), letterSpacing: '0.06em' }}>{s.label}</span>
            </div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 24, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 10, color: ink(0.38), marginTop: 5 }}>{s.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Projection */}
        <Card style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK, marginBottom: 10 }}>
            30-Day Depth Projection
          </div>
          <ResponsiveContainer width="100%" height={155}>
            <AreaChart data={projection}>
              <defs>
                <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#2563eb" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: ink(0.3), fontFamily: 'Outfit' }} tickLine={false} axisLine={false} interval={5} />
              <YAxis tick={{ fontSize: 9, fill: ink(0.3), fontFamily: 'Outfit' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${ink(0.1)}`, borderRadius: 8, fontSize: 11, fontFamily: 'Outfit' }} />
              <Area type="monotone" dataKey="depth"    stroke="#2563eb" strokeWidth={2} fill="url(#dg)" dot={false} name="Depth (m)" />
              <Line type="monotone" dataKey="critical" stroke="rgba(220,38,38,0.4)" strokeWidth={1.5} strokeDasharray="5,4" dot={false} name="Critical limit" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Wells */}
        <Card style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK, marginBottom: 10 }}>Well Status</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WELLS.map(w => {
              const c = trendColor(w.trend)
              return (
                <div key={w.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 11px', borderRadius: 8,
                  background: '#f8fafc', border: `1px solid ${ink(0.07)}`,
                }}>
                  <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                    {w.trend === 'critical' && (
                      <motion.div style={{ position: 'absolute', inset: -2, borderRadius: '50%', border: `1.5px solid ${c}`, opacity: 0.5 }}
                        animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 1.4, repeat: Infinity }} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 600, color: INK }}>{w.name}</span>
                      <span style={{ fontFamily: 'Outfit', fontSize: 9, fontWeight: 600, color: c }}>{w.trend.toUpperCase()}</span>
                    </div>
                    <div style={{ height: 4, background: ink(0.07), borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div style={{ height: '100%', borderRadius: 3, background: c }}
                        animate={{ width: `${w.level}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Outfit', fontSize: 13, fontWeight: 700, color: INK }}>{w.depth}m</div>
                    <div style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.38) }}>{w.pumping} m³/h</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Sustainability scores */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK, marginBottom: 12 }}>Sustainability Index</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {SUSTAINABILITY.map((m, i) => (
            <RingScore key={m.label} score={scores[i]} label={m.label} unit={m.unit} />
          ))}
        </div>
      </Card>
    </motion.div>
  )
}
