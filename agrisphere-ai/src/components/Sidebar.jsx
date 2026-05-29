import { motion, AnimatePresence } from 'framer-motion'
import {
  Droplets, Thermometer, Wind, Brain, CheckCircle,
  AlertTriangle, XCircle, Shield, Radio, Battery,
  MapPin, Clock, Wifi, TrendingDown, Leaf, Activity,
  Cpu, Signal, Zap
} from 'lucide-react'
import MoistureTrend from './charts/MoistureTrend.jsx'
import { SCENARIOS } from '../data/scenarios.js'

/* ── Rover Hero Card ────────────────────────────────────── */
function RoverHero({ rover }) {
  const isOnline  = rover.status === 'ONLINE'
  const batColor  = rover.battery < 20 ? '#ef4444' : rover.battery < 50 ? '#f59e0b' : '#16a34a'
  const sigColor  = rover.signal  < 40 ? '#ef4444' : rover.signal  < 70 ? '#f59e0b' : '#16a34a'
  const latOk     = rover.syncLatency <= 1000

  return (
    <div className="rounded-2xl border-2 overflow-hidden"
      style={{ borderColor: isOnline ? '#86efac' : '#fca5a5', background: isOnline ? '#f0fdf4' : '#fef2f2' }}>

      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: isOnline ? '#16a34a18' : '#ef444418' }}>
            <Cpu size={16} style={{ color: isOnline ? '#16a34a' : '#ef4444' }} />
          </div>
          <div>
            <div className="font-display font-bold text-sm text-gray-800">ROVER AGRS-01</div>
            <div className="text-[9px] font-outfit text-gray-400">Unidad de análisis de suelo</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <motion.div
            className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
          <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {rover.status}
          </span>
        </div>
      </div>

      {/* Battery — big visual */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <Battery size={12} style={{ color: batColor }} />
            <span className="text-xs font-outfit text-gray-600">Batería</span>
          </div>
          <span className="font-mono text-base font-bold" style={{ color: batColor }}>
            {rover.battery}%
          </span>
        </div>
        <div className="h-3 rounded-full bg-white/70 border border-gray-200 overflow-hidden">
          <motion.div className="h-full rounded-full"
            style={{ background: batColor }}
            animate={{ width: `${rover.battery}%` }}
            transition={{ duration: 0.8 }} />
        </div>
        {rover.battery < 20 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Zap size={9} className="text-red-500" />
            <span className="text-[9px] font-outfit text-red-600 font-semibold">Batería crítica — retorno a base recomendado</span>
          </div>
        )}
      </div>

      {/* Stats grid */}
      <div className="px-3 pb-3 grid grid-cols-2 gap-2">
        {[
          {
            icon: MapPin, label: 'Cuadrícula',
            value: rover._cell ? `[${rover._cell[0]},${rover._cell[1]}]` : '[—,—]',
            color: '#374151', danger: false
          },
          {
            icon: Activity, label: 'Zona actual',
            value: rover._zone ? `Zona ${rover._zone}` : '—',
            color: '#16a34a', danger: false
          },
          {
            icon: Signal, label: 'Señal',
            value: `${rover.signal}%`,
            color: sigColor, danger: rover.signal < 40
          },
          {
            icon: Clock, label: 'Latencia',
            value: `${rover.syncLatency} ms`,
            color: latOk ? '#374151' : '#ef4444', danger: !latOk
          },
        ].map(f => (
          <div key={f.label} className="rounded-xl bg-white/70 px-2.5 py-2 border border-white/80">
            <div className="flex items-center gap-1 mb-0.5">
              <f.icon size={9} style={{ color: f.color }} />
              <span className="text-[9px] font-outfit text-gray-400">{f.label}</span>
            </div>
            <span className="font-mono text-[11px] font-bold" style={{ color: f.color }}>{f.value}</span>
          </div>
        ))}
      </div>

      {/* Errors */}
      {rover.failures > 0 ? (
        <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-2">
          <AlertTriangle size={12} className="text-amber-600 flex-shrink-0" />
          <div>
            <div className="text-[10px] font-display font-bold text-amber-700">{rover.failures} fallo(s) detectado(s)</div>
            <div className="text-[9px] font-outfit text-amber-600">Modo recuperación activo</div>
          </div>
        </div>
      ) : isOnline ? (
        <div className="mx-3 mb-3 flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-2.5 py-2">
          <CheckCircle size={12} className="text-green-600 flex-shrink-0" />
          <div className="text-[10px] font-outfit text-green-700 font-semibold">Todos los sistemas operativos</div>
        </div>
      ) : null}
    </div>
  )
}

/* ── AI Decision card ───────────────────────────────────── */
const AI_CFG = {
  IRRIGATE_NOW:    { label: 'Irrigar Ahora',    icon: Droplets,      bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', urgent: true },
  STABLE:          { label: 'Suelo Saludable',  icon: CheckCircle,   bg: '#f0fdf4', border: '#86efac', text: '#16a34a', urgent: false },
  STOP_IRRIGATION: { label: 'Bloquear Riego',   icon: XCircle,       bg: '#eff6ff', border: '#93c5fd', text: '#2563eb', urgent: true },
  SENSOR_ALERT:    { label: 'Alerta de Sensor', icon: AlertTriangle, bg: '#fffbeb', border: '#fcd34d', text: '#d97706', urgent: true },
  CONSERVE_WATER:  { label: 'Conservar Agua',   icon: Shield,        bg: '#faf5ff', border: '#c4b5fd', text: '#7c3aed', urgent: false },
}

function AIDecisionCard({ ai }) {
  const cfg  = AI_CFG[ai.decision] || AI_CFG.STABLE
  const Icon = cfg.icon
  return (
    <motion.div key={ai.decision}
      initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-3.5 border-2"
      style={{ background: cfg.bg, borderColor: cfg.border }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Brain size={12} style={{ color: cfg.text }} />
          <span className="font-display font-bold text-[10px] text-gray-500 uppercase tracking-wide">Decisión IA</span>
        </div>
        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
          style={{ background: cfg.text + '18', color: cfg.text }}>
          {ai.confidence}% conf.
        </span>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: cfg.text + '15' }}>
          <Icon size={18} style={{ color: cfg.text }} />
        </div>
        <div>
          <div className="font-display font-bold text-base leading-tight" style={{ color: cfg.text }}>
            {cfg.label}
          </div>
          {ai.volume != null && (
            <div className="font-mono text-xs text-gray-500">
              Volumen: <span className="font-bold" style={{ color: cfg.text }}>{ai.volume} L/m²</span>
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-600 leading-relaxed font-outfit border-l-2 pl-2.5 mt-2.5"
        style={{ borderColor: cfg.border }}>
        {ai.message}
      </p>
    </motion.div>
  )
}

/* ── Zone moisture bars ─────────────────────────────────── */
function ZoneBar({ label, name, pct }) {
  const color  = pct < 25 ? '#ef4444' : pct < 40 ? '#f59e0b' : pct < 70 ? '#16a34a' : pct < 85 ? '#3b82f6' : '#7c3aed'
  const status = pct < 25 ? 'Crítico' : pct < 40 ? 'Seco' : pct < 70 ? 'Óptimo' : pct < 85 ? 'Húmedo' : 'Saturado'
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-14 flex-shrink-0">
        <div className="text-[10px] font-mono text-gray-400">{label}</div>
        <div className="text-[10px] font-outfit text-gray-500 truncate">{name}</div>
      </div>
      <div className="flex-1">
        <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
          <motion.div className="h-full rounded-full" style={{ background: color }}
            animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
        </div>
      </div>
      <div className="text-right w-16 flex-shrink-0">
        <span className="font-mono text-sm font-bold" style={{ color }}>{pct.toFixed(1)}%</span>
        <div className="text-[9px] font-outfit" style={{ color }}>{status}</div>
      </div>
    </div>
  )
}

/* ── Main Sidebar ───────────────────────────────────────── */
export default function Sidebar({ telemetry, scenario }) {
  const { moisture, ai, rover, weather, water, charts } = telemetry

  return (
    <aside className="w-80 flex-shrink-0 bg-white border-r border-gray-100 flex flex-col overflow-hidden">

      {/* Field header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-0.5">
          <Leaf size={13} className="text-green-600" />
          <span className="font-display font-bold text-sm text-gray-800">Campo Cliza</span>
          <span className="ml-auto text-[10px] font-mono text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">17 POZOS</span>
        </div>
        <div className="text-xs font-outfit text-gray-400">Municipio de Cliza · Valle Alto de Cochabamba</div>
      </div>

      {/* Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5">

        {/* ── ROVER — protagonist ── */}
        <RoverHero rover={rover} />

        {/* ── AI Decision ── */}
        <AnimatePresence mode="wait">
          <AIDecisionCard key={ai.decision} ai={ai} />
        </AnimatePresence>

        {/* ── Moisture zones ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Droplets size={11} className="text-blue-500" />
            <span className="font-display font-semibold text-[10px] text-gray-500 uppercase tracking-wide">Humedad Radicular</span>
          </div>
          <div className="space-y-2">
            <ZoneBar label="Zona A" name="Parcela Norte"   pct={moisture.A} />
            <ZoneBar label="Zona B" name="Parcela Central" pct={moisture.B} />
            <ZoneBar label="Zona C" name="Parcela Sur"     pct={moisture.C} />
          </div>
        </div>

        {/* ── Weather strip ── */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: Thermometer, label: 'Temperatura',  value: `${weather.temp.toFixed(1)}°C`,      color: weather.temp > 30 ? '#ef4444' : '#16a34a' },
            { icon: Droplets,    label: 'Humedad aire', value: `${weather.humidity.toFixed(0)}%`,    color: '#3b82f6' },
            { icon: Wind,        label: 'Viento',       value: `${weather.wind.toFixed(0)} km/h`,    color: '#6b7280' },
            { icon: TrendingDown,label: 'ET₀',          value: `${weather.et0.toFixed(1)} mm/d`,     color: '#f59e0b' },
          ].map(w => (
            <div key={w.label} className="rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <w.icon size={9} style={{ color: w.color }} />
                <span className="text-[9px] font-outfit text-gray-400">{w.label}</span>
              </div>
              <span className="font-mono text-sm font-bold" style={{ color: w.color }}>{w.value}</span>
            </div>
          ))}
        </div>

        {/* ── Water saved ── */}
        <div className="rounded-xl bg-green-50 border border-green-200 px-3 py-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
            <Leaf size={14} className="text-green-600" />
          </div>
          <div>
            <div className="text-[10px] font-outfit text-green-700">Agua conservada hoy</div>
            <div className="font-mono text-lg font-bold text-green-700">{water.saved.toLocaleString()} L</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[9px] text-green-600">Eficiencia</div>
            <div className="font-mono text-sm font-bold text-green-700">{water.efficiency}%</div>
          </div>
        </div>

        {/* ── Moisture trend ── */}
        <div>
          <div className="text-[10px] font-display font-semibold text-gray-400 uppercase tracking-wide mb-2">Humedad 24h</div>
          <MoistureTrend data={charts.moistureHistory} />
        </div>
      </div>
    </aside>
  )
}
