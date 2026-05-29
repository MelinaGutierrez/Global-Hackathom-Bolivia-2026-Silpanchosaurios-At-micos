import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Thermometer, Wind, Brain, CheckCircle,
  AlertTriangle, XCircle, Shield, Battery,
  MapPin, Clock, TrendingDown, Leaf, Activity,
  Cpu, Signal, Zap, History, Navigation
} from 'lucide-react'
import MoistureTrend from './charts/MoistureTrend.jsx'

/* ── Design tokens ──────────────────────────────────────── */
const INK   = '#0f172a'
const GREEN = '#16a34a'
const ink   = (o) => `rgba(15,23,42,${o})`
const gn    = (o) => `rgba(22,163,74,${o})`

const lbl = { fontFamily:'Outfit', fontSize:9,  fontWeight:500, letterSpacing:'0.07em', textTransform:'uppercase', color:ink(0.38) }
const sub = { fontFamily:'Outfit', fontSize:10, fontWeight:400, color:ink(0.50) }

/* ── Moisture level config ──────────────────────────────── */
export function moistureLevel(pct) {
  if (pct < 25) return { label:'Critical',   pin:'#dc2626', bg:'rgba(220,38,38,0.08)',   border:'rgba(220,38,38,0.20)',   action:'Irrigate NOW'   }
  if (pct < 40) return { label:'Dry',        pin:'#d97706', bg:'rgba(217,119,6,0.08)',   border:'rgba(217,119,6,0.20)',   action:'Irrigate Soon'  }
  if (pct < 70) return { label:'Optimal',    pin:'#16a34a', bg:'rgba(22,163,74,0.08)',   border:'rgba(22,163,74,0.20)',   action:'No Action'      }
  if (pct < 85) return { label:'Wet',        pin:'#2563eb', bg:'rgba(37,99,235,0.08)',   border:'rgba(37,99,235,0.20)',   action:'Monitor'        }
  return              { label:'Saturated',  pin:'#7c3aed', bg:'rgba(124,58,237,0.08)',  border:'rgba(124,58,237,0.20)',  action:'Stop Irrigation' }
}

/* ── Rover Card ─────────────────────────────────────────── */
function RoverCard({ rover }) {
  const online = rover.status === 'ONLINE'
  const batLow = rover.battery < 20
  const sigLow = rover.signal  < 40
  const latBad = rover.syncLatency > 1000
  const ac     = online ? GREEN : INK

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border:`1.5px solid ${online ? gn(0.22) : ink(0.12)}`, background:'#fff' }}>

      {/* Header */}
      <div className="px-3.5 pt-3 pb-2 flex items-center justify-between"
        style={{ borderBottom:`1px solid ${ink(0.06)}` }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: online ? gn(0.09) : ink(0.05) }}>
            <Cpu size={14} style={{ color:ac }} />
          </div>
          <div>
            <div style={{ fontFamily:'Outfit', fontSize:12, fontWeight:700, color:INK }}>HYDRO ROVER HR-01</div>
            <div style={sub}>Soil analysis unit · HydroSphere</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background:ac }}
            animate={{ opacity:[1,0.3,1] }} transition={{ duration:1.2, repeat:Infinity }} />
          <span style={{
            fontFamily:'Outfit', fontSize:9, fontWeight:700, letterSpacing:'0.06em',
            color:ac, padding:'2px 7px', borderRadius:999,
            background: online ? gn(0.08) : ink(0.05),
            border:`1px solid ${online ? gn(0.18) : ink(0.10)}`
          }}>{rover.status}</span>
        </div>
      </div>

      {/* Battery */}
      <div className="px-3.5 py-2.5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Battery size={11} style={{ color: batLow ? '#dc2626' : ink(0.35) }} />
            <span style={lbl}>Battery</span>
          </div>
          <span style={{ fontFamily:'Outfit', fontSize:16, fontWeight:700,
            color: batLow ? '#dc2626' : ink(0.65) }}>
            {rover.battery}%
          </span>
        </div>
        <div className="rounded-full overflow-hidden" style={{ height:7, background:ink(0.07) }}>
          <motion.div className="h-full rounded-full"
            style={{ background: batLow ? '#dc2626' : GREEN }}
            animate={{ width:`${rover.battery}%` }} transition={{ duration:0.8 }} />
        </div>
        {batLow && (
          <div className="flex items-center gap-1 mt-1.5">
            <Zap size={9} style={{ color:'#dc2626' }} />
            <span style={{ fontFamily:'Outfit', fontSize:9, fontWeight:600, color:'#dc2626' }}>
              Critical — return to base recommended
            </span>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="px-3 pb-3 grid grid-cols-2 gap-1.5">
        {[
          { I:MapPin,   label:'Grid Cell',    value: rover._cell ? `[${rover._cell[0]},${rover._cell[1]}]` : '[—,—]', hi:false },
          { I:Activity, label:'Current Zone', value: rover._zone ? `Zone ${rover._zone}` : '—',                        hi:true  },
          { I:Signal,   label:'Signal',       value:`${rover.signal}%`,        hi:sigLow },
          { I:Clock,    label:'Latency',      value:`${rover.syncLatency} ms`, hi:latBad },
        ].map(f => (
          <div key={f.label} className="rounded-lg px-2.5 py-2"
            style={{ background:ink(0.03), border:`1px solid ${ink(0.06)}` }}>
            <div className="flex items-center gap-1 mb-0.5">
              <f.I size={9} style={{ color: f.hi ? ac : ink(0.30) }} />
              <span style={lbl}>{f.label}</span>
            </div>
            <span style={{ fontFamily:'Outfit', fontSize:11, fontWeight:700,
              color: f.hi ? ac : ink(0.60) }}>{f.value}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      {rover.failures > 0 ? (
        <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg px-2.5 py-2"
          style={{ background:'rgba(217,119,6,0.07)', border:'1px solid rgba(217,119,6,0.20)' }}>
          <AlertTriangle size={11} style={{ color:'#d97706' }} />
          <div>
            <div style={{ fontFamily:'Outfit', fontSize:10, fontWeight:700, color:'#d97706' }}>{rover.failures} failure(s) detected</div>
            <div style={sub}>Recovery mode active</div>
          </div>
        </div>
      ) : online ? (
        <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg px-2.5 py-2"
          style={{ background:gn(0.06), border:`1px solid ${gn(0.18)}` }}>
          <CheckCircle size={11} style={{ color:GREEN }} />
          <span style={{ fontFamily:'Outfit', fontSize:10, fontWeight:600, color:GREEN }}>All systems operational</span>
        </div>
      ) : null}
    </div>
  )
}

/* ── AI Decision Card ───────────────────────────────────── */
const AI_MAP = {
  IRRIGATE_NOW:    { label:'Irrigate Now',    Icon:Droplets,      color:'#dc2626', darkBg:true  },
  STABLE:          { label:'Soil Healthy',    Icon:CheckCircle,   color:'#16a34a', darkBg:false },
  STOP_IRRIGATION: { label:'Stop Irrigation', Icon:XCircle,       color:'#2563eb', darkBg:false },
  SENSOR_ALERT:    { label:'Sensor Alert',    Icon:AlertTriangle, color:'#d97706', darkBg:false },
  CONSERVE_WATER:  { label:'Conserve Water',  Icon:Shield,        color:'#7c3aed', darkBg:false },
}

function AICard({ ai }) {
  const cfg   = AI_MAP[ai.decision] || AI_MAP.STABLE
  const { Icon, color, darkBg } = cfg
  const bg    = darkBg ? color : '#fff'
  const bdr   = darkBg ? color : `${color}40`
  const clr   = darkBg ? '#fff' : color
  const dim   = darkBg ? 'rgba(255,255,255,0.55)' : ink(0.40)
  const pill  = darkBg ? 'rgba(255,255,255,0.15)' : `${color}18`
  const pillT = darkBg ? 'rgba(255,255,255,0.90)' : color

  return (
    <motion.div key={ai.decision}
      initial={{ opacity:0, scale:0.98 }} animate={{ opacity:1, scale:1 }}
      className="rounded-xl overflow-hidden"
      style={{ background:bg, border:`1.5px solid ${bdr}` }}>
      <div className="px-3.5 pt-3 pb-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <Brain size={11} style={{ color:dim }} />
            <span style={{ ...lbl, color:dim }}>AI Decision</span>
          </div>
          <span style={{ fontFamily:'Outfit', fontSize:10, fontWeight:600,
            color:pillT, padding:'2px 7px', borderRadius:999, background:pill }}>
            {ai.confidence}% conf.
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: darkBg ? 'rgba(255,255,255,0.10)' : `${color}12` }}>
            <Icon size={17} style={{ color:clr }} />
          </div>
          <div>
            <div style={{ fontFamily:'Outfit', fontSize:16, fontWeight:700, lineHeight:1.15, color:clr }}>
              {cfg.label}
            </div>
            {ai.volume != null && (
              <div style={{ fontFamily:'Outfit', fontSize:11, fontWeight:400, color:dim }}>
                Volume: <span style={{ fontWeight:700, color:clr }}>{ai.volume} L/m²</span>
              </div>
            )}
          </div>
        </div>
        <p style={{
          fontFamily:'Outfit', fontSize:11, lineHeight:1.55, color:dim, marginTop:10,
          paddingLeft:10, borderLeft:`2px solid ${darkBg ? 'rgba(255,255,255,0.15)' : `${color}30`}`
        }}>
          {ai.message}
        </p>
      </div>
    </motion.div>
  )
}

/* ── Zone moisture bar ──────────────────────────────────── */
function ZoneBar({ label, name, pct }) {
  const m = moistureLevel(pct)
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex-shrink-0" style={{ width:56 }}>
        <div style={{ fontFamily:'Outfit', fontSize:10, fontWeight:600, color:ink(0.65) }}>{label}</div>
        <div style={{ fontFamily:'Outfit', fontSize:9,  fontWeight:400, color:ink(0.38), marginTop:1 }} className="truncate">{name}</div>
      </div>
      <div className="flex-1">
        <div className="rounded-full overflow-hidden" style={{ height:5, background:ink(0.07) }}>
          <motion.div className="h-full rounded-full" style={{ background:m.pin }}
            animate={{ width:`${pct}%` }} transition={{ duration:0.8 }} />
        </div>
      </div>
      <div className="text-right flex-shrink-0" style={{ width:62 }}>
        <span style={{ fontFamily:'Outfit', fontSize:13, fontWeight:700, color:m.pin }}>{pct.toFixed(1)}%</span>
        <div style={{ fontFamily:'Outfit', fontSize:9, fontWeight:500, color:m.pin, opacity:0.85 }}>{m.label}</div>
      </div>
    </div>
  )
}

/* ── Weather chip ───────────────────────────────────────── */
function WeatherChip({ Icon, label, value, accent }) {
  return (
    <div className="rounded-lg px-3 py-2"
      style={{ background:ink(0.03), border:`1px solid ${ink(0.06)}` }}>
      <div className="flex items-center gap-1.5 mb-0.5">
        <Icon size={9} style={{ color: accent || ink(0.30) }} />
        <span style={lbl}>{label}</span>
      </div>
      <span style={{ fontFamily:'Outfit', fontSize:13, fontWeight:700, color: accent || ink(0.65) }}>{value}</span>
    </div>
  )
}

/* ── Rover Timeline ─────────────────────────────────────── */
function RoverTimeline({ entries }) {
  if (!entries.length) return (
    <div className="rounded-xl px-4 py-6 flex flex-col items-center gap-2"
      style={{ background:ink(0.02), border:`1px dashed ${ink(0.10)}` }}>
      <Navigation size={16} style={{ color:ink(0.25) }} />
      <span style={{ fontFamily:'Outfit', fontSize:11, color:ink(0.35) }}>
        Scanning in progress…
      </span>
    </div>
  )

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border:`1px solid ${ink(0.08)}`, background:'#fff' }}>
      <div className="overflow-y-auto" style={{ maxHeight:220 }}>
        {entries.map((e, i) => {
          const m = moistureLevel(e.pct)
          const isFirst = i === 0
          return (
            <div key={e.id}
              className="flex items-start gap-3 px-3 py-2.5"
              style={{
                borderBottom: i < entries.length-1 ? `1px solid ${ink(0.05)}` : 'none',
                background: isFirst ? `${m.pin}08` : 'transparent',
              }}>
              {/* Timeline dot + line */}
              <div className="flex flex-col items-center flex-shrink-0" style={{ paddingTop:3 }}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: m.pin, boxShadow: isFirst ? `0 0 0 3px ${m.pin}25` : 'none' }}/>
                {i < entries.length-1 && (
                  <div style={{ width:1, flexGrow:1, minHeight:14, background:ink(0.08), marginTop:3 }}/>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontFamily:'Outfit', fontSize:11, fontWeight:700, color:INK }}>
                      Plot {e.plotId}
                    </span>
                    <span style={{
                      fontFamily:'Outfit', fontSize:9, fontWeight:600,
                      color:m.pin, padding:'1px 5px', borderRadius:999,
                      background:m.bg, border:`1px solid ${m.border}`
                    }}>{m.label}</span>
                  </div>
                  <span style={{ fontFamily:'Outfit', fontSize:9, color:ink(0.35), flexShrink:0 }}>
                    {e.time}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span style={{ fontFamily:'Outfit', fontSize:13, fontWeight:700, color:m.pin }}>
                    {e.pct.toFixed(1)}%
                  </span>
                  <span style={{ fontFamily:'Outfit', fontSize:10, color:ink(0.45) }}>
                    → {m.action}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Main Sidebar ───────────────────────────────────────── */
export default function Sidebar({ telemetry, scenario }) {
  const { moisture, ai, rover, weather, water, charts } = telemetry

  // ── Rover scan history ──────────────────────────────────
  const [history, setHistory] = useState([])
  const prevKeyRef = useRef(null)
  const counterRef = useRef(0)

  useEffect(() => {
    if (!rover._zone || rover._cell == null) return
    const key = `${rover._cell[0]}-${rover._cell[1]}`
    if (key === prevKeyRef.current) return
    prevKeyRef.current = key

    const now = new Date()
    const timeStr = now.toLocaleTimeString('en', { hour:'2-digit', minute:'2-digit', second:'2-digit', hour12:false })
    const pct  = moisture[rover._zone]
    const plotId = `${rover._zone}${rover._cell[0]}`

    counterRef.current += 1
    setHistory(prev => [{
      id: counterRef.current,
      time: timeStr,
      plotId,
      zone: rover._zone,
      pct,
    }, ...prev].slice(0, 30))
  }, [rover._cell?.[0], rover._cell?.[1]])

  return (
    <aside className="flex-shrink-0 flex flex-col overflow-hidden"
      style={{ width:296, background:'#fff', borderRight:`1px solid ${ink(0.08)}` }}>

      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3"
        style={{ borderBottom:`1px solid ${ink(0.07)}` }}>
        <div className="flex items-center gap-2 mb-0.5">
          <Droplets size={12} style={{ color:'#2563eb' }} />
          <span style={{ fontFamily:'Outfit', fontSize:13, fontWeight:700, color:INK }}>
            Hydro<span style={{ color:'#2563eb' }}>Sphere</span>
          </span>
          <span style={{ fontFamily:'Outfit', fontSize:9, fontWeight:500, color:ink(0.38) }}>
            · Cliza Field
          </span>
          <span className="ml-auto" style={{
            fontFamily:'Outfit', fontSize:9, fontWeight:600, color:GREEN, letterSpacing:'0.05em',
            background:gn(0.08), border:`1px solid ${gn(0.18)}`, padding:'2px 7px', borderRadius:999
          }}>17 WELLS</span>
        </div>
        <div style={{ fontFamily:'Outfit', fontSize:10, color:ink(0.38) }}>
          Cliza Municipality · Valle Alto, Cochabamba
        </div>
      </div>

      {/* Scroll area */}
      <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-3">

        <RoverCard rover={rover} />

        <AnimatePresence mode="wait">
          <AICard key={ai.decision} ai={ai} />
        </AnimatePresence>

        {/* Root Moisture */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Droplets size={10} style={{ color:'#2563eb' }} />
            <span style={lbl}>Root Moisture</span>
          </div>
          <div className="space-y-2">
            <ZoneBar label="Zone A" name="North Plot"   pct={moisture.A} />
            <ZoneBar label="Zone B" name="Central Plot" pct={moisture.B} />
            <ZoneBar label="Zone C" name="South Plot"   pct={moisture.C} />
          </div>
        </div>

        {/* Weather */}
        <div className="grid grid-cols-2 gap-1.5">
          <WeatherChip Icon={Thermometer} label="Temperature"  value={`${weather.temp.toFixed(1)}°C`}    accent={weather.temp > 30 ? '#dc2626' : undefined} />
          <WeatherChip Icon={Droplets}    label="Air Humidity" value={`${weather.humidity.toFixed(0)}%`} accent='#2563eb' />
          <WeatherChip Icon={Wind}        label="Wind"         value={`${weather.wind.toFixed(0)} km/h`} />
          <WeatherChip Icon={TrendingDown}label="ET₀"          value={`${weather.et0.toFixed(1)} mm/d`}  accent='#d97706' />
        </div>

        {/* Water saved */}
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-3"
          style={{ background:gn(0.06), border:`1px solid ${gn(0.16)}` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background:gn(0.12) }}>
            <Leaf size={14} style={{ color:GREEN }} />
          </div>
          <div>
            <div style={{ fontFamily:'Outfit', fontSize:9, fontWeight:600, color:GREEN, textTransform:'uppercase', letterSpacing:'0.05em' }}>
              Water Saved Today
            </div>
            <div style={{ fontFamily:'Outfit', fontSize:18, fontWeight:700, color:GREEN }}>
              {water.saved.toLocaleString()} L
            </div>
          </div>
          <div className="ml-auto text-right">
            <div style={{ fontFamily:'Outfit', fontSize:9, fontWeight:500, color:GREEN, opacity:0.65 }}>Efficiency</div>
            <div style={{ fontFamily:'Outfit', fontSize:14, fontWeight:700, color:GREEN }}>{water.efficiency}%</div>
          </div>
        </div>

        {/* 24h moisture chart */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={10} style={{ color:ink(0.30) }} />
            <span style={lbl}>24h Moisture Trend</span>
          </div>
          <MoistureTrend data={charts.moistureHistory} />
        </div>

        {/* ── Rover Scan Timeline ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <History size={10} style={{ color:ink(0.30) }} />
              <span style={lbl}>Rover Scan Log</span>
            </div>
            {history.length > 0 && (
              <span style={{ fontFamily:'Outfit', fontSize:9, color:ink(0.35) }}>
                {history.length} scan{history.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <RoverTimeline entries={history} />
        </div>

      </div>
    </aside>
  )
}
