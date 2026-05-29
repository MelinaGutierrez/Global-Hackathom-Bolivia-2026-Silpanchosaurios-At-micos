import { motion } from 'framer-motion'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'

const INK   = '#0f172a'
const GREEN = '#16a34a'
const ink   = (o) => `rgba(15,23,42,${o})`

const ZONE_META = {
  A: { name: 'North Plot',   color: INK },
  B: { name: 'Central Plot', color: GREEN },
  C: { name: 'South Plot',   color: '#2563eb' },
}

function mColor(pct) {
  if (pct < 25) return '#dc2626'
  if (pct < 40) return '#d97706'
  if (pct < 70) return GREEN
  if (pct < 85) return '#2563eb'
  return '#7c3aed'
}
function mLabel(pct) {
  if (pct < 25) return 'Critical'
  if (pct < 40) return 'Dry'
  if (pct < 70) return 'Optimal'
  if (pct < 85) return 'Wet'
  return 'Saturated'
}

const SOIL_PROFILES = [
  { depth: '0–15 cm',  label: 'Surface',       n: 42, p: 18, k: 85, ph: 6.8, ec: 0.4 },
  { depth: '15–35 cm', label: 'Root Zone',      n: 38, p: 22, k: 71, ph: 7.0, ec: 0.5 },
  { depth: '35–60 cm', label: 'Upper Subsoil',  n: 21, p: 14, k: 55, ph: 7.2, ec: 0.6 },
  { depth: '60–90 cm', label: 'Deep Subsoil',   n: 12, p:  9, k: 38, ph: 7.4, ec: 0.7 },
]

const NUTRIENTS = [
  { key: 'n',  label: 'N',  color: GREEN,    unit: 'mg/kg' },
  { key: 'p',  label: 'P',  color: '#2563eb',unit: 'mg/kg' },
  { key: 'k',  label: 'K',  color: '#d97706',unit: 'mg/kg' },
  { key: 'ph', label: 'pH', color: '#7c3aed',unit: '' },
  { key: 'ec', label: 'EC', color: '#db2777',unit: 'dS/m' },
]

function Card({ children, style = {} }) {
  return <div style={{ background: '#fff', border: `1px solid ${ink(0.08)}`, borderRadius: 12, ...style }}>{children}</div>
}

export default function SoilIntelligence({ telemetry }) {
  const { moisture } = telemetry

  const radarData = [
    { metric: 'Moisture',   A: moisture.A, B: moisture.B, C: moisture.C },
    { metric: 'Nitrogen',   A: 42, B: 55, C: 38 },
    { metric: 'Phosphorus', A: 18, B: 22, C: 31 },
    { metric: 'Potassium',  A: 85, B: 71, C: 62 },
    { metric: 'pH',         A: 68, B: 70, C: 72 },
    { metric: 'EC',         A: 40, B: 50, C: 35 },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
      style={{ height: '100%', padding: 14, overflowY: 'auto', background: '#f8fafc', display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      {/* Zone moisture cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {['A', 'B', 'C'].map(zone => {
          const pct   = moisture[zone]
          const mc    = mColor(pct)
          const meta  = ZONE_META[zone]
          const depths = [
            { d: '0–15 cm',  v: Math.min(100, pct * 1.3) },
            { d: '15–35 cm', v: pct },
            { d: '35–60 cm', v: pct * 0.85 },
            { d: '60–90 cm', v: pct * 0.6 },
          ]
          return (
            <Card key={zone} style={{ padding: 14 }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 13, color: INK }}>Zone {zone}</span>
                  </div>
                  <div style={{ fontFamily: 'Outfit', fontSize: 10, color: ink(0.4), marginTop: 1, marginLeft: 14 }}>{meta.name}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: 20, color: mc, lineHeight: 1 }}>{pct.toFixed(1)}%</div>
                  <div style={{
                    fontFamily: 'Outfit', fontSize: 9, fontWeight: 600, color: mc,
                    padding: '2px 7px', borderRadius: 10, marginTop: 3,
                    background: mc + '18',
                  }}>{mLabel(pct)}</div>
                </div>
              </div>
              {/* Depth bars */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {depths.map(d => (
                  <div key={d.d}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.38) }}>{d.d}</span>
                      <span style={{ fontFamily: 'Outfit', fontSize: 9, fontWeight: 600, color: mc }}>{d.v.toFixed(0)}%</span>
                    </div>
                    <div style={{ height: 4, background: ink(0.06), borderRadius: 3, overflow: 'hidden' }}>
                      <motion.div style={{ height: '100%', borderRadius: 3, background: mc }}
                        animate={{ width: `${d.v}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
        {/* Radar — no separate legend, zones already labeled on axes */}
        <Card style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK, marginBottom: 4 }}>Multi-Zone Profile</div>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={radarData} outerRadius={75}>
              <PolarGrid stroke={ink(0.07)} />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 9, fill: ink(0.4), fontFamily: 'Outfit' }} />
              <Radar name="Zone A" dataKey="A" stroke={INK}      fill={INK}       fillOpacity={0.07} strokeWidth={1.5} />
              <Radar name="Zone B" dataKey="B" stroke={GREEN}    fill={GREEN}     fillOpacity={0.10} strokeWidth={1.5} />
              <Radar name="Zone C" dataKey="C" stroke="#2563eb"  fill="#2563eb"   fillOpacity={0.07} strokeWidth={1.5} />
            </RadarChart>
          </ResponsiveContainer>
          {/* Inline legend — compact, below chart */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 4 }}>
            {Object.entries(ZONE_META).map(([z, m]) => (
              <div key={z} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color }} />
                <span style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.45) }}>Zone {z}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Soil profile table */}
        <Card style={{ padding: 14 }}>
          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: 12, color: INK, marginBottom: 10 }}>Profile by Depth</div>
          {/* Column headers */}
          <div style={{ display: 'flex', gap: 8, paddingBottom: 7, borderBottom: `1px solid ${ink(0.06)}`, marginBottom: 7 }}>
            <div style={{ width: 95, flexShrink: 0 }} />
            {NUTRIENTS.map(n => (
              <div key={n.key} style={{ flex: 1, textAlign: 'center', fontFamily: 'Outfit', fontSize: 10, fontWeight: 700, color: n.color }}>
                {n.label}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SOIL_PROFILES.map((layer, i) => (
              <motion.div key={layer.depth}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: ink(0.02), border: `1px solid ${ink(0.05)}`,
                  borderRadius: 8, padding: '9px 11px',
                }}
              >
                <div style={{ width: 95, flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Outfit', fontSize: 11, fontWeight: 700, color: INK }}>{layer.depth}</div>
                  <div style={{ fontFamily: 'Outfit', fontSize: 9, color: ink(0.38) }}>{layer.label}</div>
                </div>
                {NUTRIENTS.map(n => (
                  <div key={n.key} style={{ flex: 1, textAlign: 'center' }}>
                    <span style={{ fontFamily: 'Outfit', fontSize: 12, fontWeight: 700, color: n.color }}>
                      {layer[n.key]}
                    </span>
                    {n.unit && <span style={{ fontFamily: 'Outfit', fontSize: 8, color: ink(0.3), marginLeft: 1 }}>{n.unit}</span>}
                  </div>
                ))}
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
