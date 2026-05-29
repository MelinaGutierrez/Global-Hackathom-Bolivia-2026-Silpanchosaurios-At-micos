import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Droplets, TrendingDown, CheckCircle, Zap } from 'lucide-react'

const INK   = '#0f172a'
const GREEN = '#16a34a'
const ink   = (o) => `rgba(15,23,42,${o})`

const WEEKLY = [
  { day: 'Mon', actual: 4200, optimal: 3800 },
  { day: 'Tue', actual: 3100, optimal: 3800 },
  { day: 'Wed', actual: 2800, optimal: 3600 },
  { day: 'Thu', actual: 5200, optimal: 4000 },
  { day: 'Fri', actual: 3600, optimal: 3700 },
  { day: 'Sat', actual: 2400, optimal: 3200 },
  { day: 'Sun', actual: 1800, optimal: 2800 },
]

const AI_LOG = [
  { time: '08:32', decision: 'IRRIGATE_NOW',   zone: 'A',   vol: 22,   conf: 94 },
  { time: '07:15', decision: 'STABLE',          zone: 'B',   vol: null, conf: 91 },
  { time: '06:48', decision: 'CONSERVE_WATER',  zone: 'ALL', vol: 8,    conf: 88 },
  { time: '05:20', decision: 'STABLE',          zone: 'C',   vol: null, conf: 93 },
  { time: '04:01', decision: 'STOP_IRRIGATION', zone: 'C',   vol: 0,    conf: 97 },
  { time: 'Yesterday', decision: 'IRRIGATE_NOW',zone: 'A/B', vol: 18,   conf: 89 },
]

function decisionColor(d) {
  return { IRRIGATE_NOW: '#dc2626', STOP_IRRIGATION: '#2563eb', CONSERVE_WATER: '#7c3aed', SENSOR_ALERT: '#d97706', STABLE: GREEN }[d] || INK
}

function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: `1px solid ${ink(0.08)}`, borderRadius: 12, ...style }}>{children}</div>
}

export default function IrrigationInsights({ telemetry }) {
  const { water, ai, moisture } = telemetry
  const saved      = WEEKLY.reduce((s, d) => s + Math.max(0, d.optimal - d.actual), 0)
  const stableZones = [moisture.A, moisture.B, moisture.C].filter(m => m >= 40 && m < 70).length
  const aiColor    = decisionColor(ai.decision)

  const now = new Date().getHours()
  const SCHEDULE = Array.from({ length: 12 }, (_, i) => {
    const hour = (now + i * 2) % 24
    const type = [2, 3, 8].includes(i) ? (i === 2 ? 'urgent' : 'irrigate') : 'pause'
    return { hour: `${String(hour).padStart(2, '0')}:00`, type, vol: i === 2 ? 22 : i === 3 || i === 8 ? 12 : null }
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      style={{ height: '100%', padding: 14, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { icon: Droplets,    label: 'Saved This Week',  value: `${(saved/1000).toFixed(1)}k L`,  sub: 'vs. traditional',       color: GREEN    },
          { icon: TrendingDown,label: 'Efficiency',       value: `${water.efficiency}%`,            sub: 'AI-optimized',          color: '#2563eb' },
          { icon: Zap,         label: 'AI Decision',      value: ai.decision.replace(/_/g,' '),     sub: `${ai.confidence}% conf`,color: aiColor  },
          { icon: CheckCircle, label: 'Stable Zones',     value: `${stableZones} / 3`,              sub: '40–70% moisture range', color: '#7c3aed' },
        ].map(k => (
          <Card key={k.label} style={{ padding: '13px 15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <k.icon size={12} style={{ color: k.color }} />
              <span style={{ fontFamily: 'Outfit', fontSize: 9, fontWeight: 600, color: ink(0.38), letterSpacing: '0.06em' }}>
                {k.label.toUpperCase()}
              </span>
            </div>
            <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: k.color, lineHeight: 1.1 }}>{k.value}</div>
            <div style={{ fontFamily: 'Outfit', fontSize: 10, color: ink(0.38), marginTop: 4 }}>{k.sub}</div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {/* Bar chart */}
        <Card style={{ padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK }}>Weekly Consumption (L)</span>
            <div style={{ display: 'flex', gap: 10 }}>
              {[{ label: 'Actual', color: ink(0.18) }, { label: 'AI Optimal', color: 'rgba(22,163,74,0.35)' }].map(l => (
                <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: l.color }} />
                  <span style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.4) }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={165}>
            <BarChart data={WEEKLY} barGap={3}>
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: ink(0.3), fontFamily: 'Outfit' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: ink(0.3), fontFamily: 'Outfit' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${ink(0.1)}`, borderRadius: 8, fontSize: 11, fontFamily: 'Outfit' }} />
              <Bar dataKey="actual"  fill={ink(0.15)}              radius={[3,3,0,0]} name="Actual" />
              <Bar dataKey="optimal" fill="rgba(22,163,74,0.35)"  radius={[3,3,0,0]} name="AI Optimal" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* AI log */}
        <Card style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK, marginBottom: 10 }}>Decision Log</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {AI_LOG.map((log, i) => {
              const color = decisionColor(log.decision)
              return (
                <motion.div key={i}
                  initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9,
                    padding: '7px 10px', borderRadius: 8,
                    background: '#f8fafc', border: `1px solid ${ink(0.06)}`,
                  }}
                >
                  <span style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.3), width: 48, flexShrink: 0 }}>{log.time}</span>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'Outfit', fontSize: 11, fontWeight: 600, color, flex: 1 }}>
                    {log.decision.replace(/_/g, ' ')}
                  </span>
                  <span style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.35) }}>Z-{log.zone}</span>
                  {log.vol != null && <span style={{ fontFamily: 'Outfit', fontSize: 9, fontWeight: 600, color: '#2563eb' }}>{log.vol}L/m²</span>}
                  <span style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.28) }}>{log.conf}%</span>
                </motion.div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* 24h schedule */}
      <Card style={{ padding: 14 }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK, marginBottom: 10 }}>Next 24h Schedule</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 7 }}>
          {SCHEDULE.map((s, i) => {
            const urgent   = s.type === 'urgent'
            const irrigate = s.type === 'irrigate'
            return (
              <div key={i} style={{
                background: urgent ? 'rgba(220,38,38,0.05)' : irrigate ? 'rgba(22,163,74,0.05)' : '#f8fafc',
                border: `1px solid ${urgent ? 'rgba(220,38,38,0.18)' : irrigate ? 'rgba(22,163,74,0.18)' : ink(0.07)}`,
                borderRadius: 8, padding: '9px 5px', textAlign: 'center',
              }}>
                <div style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.35), marginBottom: 4 }}>{s.hour}</div>
                <div style={{ fontFamily: 'Outfit', fontSize: 10, fontWeight: 700, color: urgent ? '#dc2626' : irrigate ? GREEN : ink(0.28) }}>
                  {urgent ? 'URGENT' : irrigate ? 'IRRIGATE' : 'PAUSE'}
                </div>
                {s.vol != null && (
                  <div style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.35), marginTop: 2 }}>{s.vol} L/m²</div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </motion.div>
  )
}
