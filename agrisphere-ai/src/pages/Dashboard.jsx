import { motion, AnimatePresence } from 'framer-motion'
import { Activity, AlertTriangle, Droplets, Leaf, Wifi } from 'lucide-react'
import FieldMap from '../components/FieldMap.jsx'
import RoverCard from '../components/RoverCard.jsx'
import WeatherCard from '../components/WeatherCard.jsx'
import WaterCard from '../components/WaterCard.jsx'
import AICard from '../components/AICard.jsx'
import OpsCards from '../components/OpsCards.jsx'
import MoistureTrend from '../components/charts/MoistureTrend.jsx'
import { SCENARIOS } from '../data/scenarios.js'

const ZONE_COLORS = (pct) =>
  pct < 25 ? '#ef4444' : pct < 40 ? '#f59e0b' : pct < 70 ? '#22c55e' : pct < 85 ? '#38bdf8' : '#8b5cf6'
const ZONE_LABEL = (pct) =>
  pct < 25 ? 'CRÍTICO' : pct < 40 ? 'SECO' : pct < 70 ? 'ÓPTIMO' : pct < 85 ? 'HÚMEDO' : 'SATURADO'

export default function Dashboard({ telemetry, scenario, tick, transitioning }) {
  const sc = SCENARIOS[scenario]
  const { moisture, ai, rover, weather, water, alerts, charts } = telemetry

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scenario}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="flex flex-col h-full overflow-hidden"
        style={{ padding: '12px 14px 10px' }}
      >
        {/* ─── TOP STRIP ─── */}
        <div className="flex items-center gap-3 mb-2 flex-shrink-0">
          {/* Greeting */}
          <div className="flex-shrink-0">
            <h1 className="font-display font-bold text-xl text-neon-50 leading-none">Hola, Daniel 👋</h1>
            <p className="font-outfit text-xs text-sage-500 mt-0.5">Riego IA · Cliza, Cochabamba · {new Date().toLocaleDateString('es-BO')}</p>
          </div>

          {/* Zone moisture pills — compact */}
          <div className="flex gap-2 flex-shrink-0">
            {['A','B','C'].map(zone => {
              const pct = moisture[zone]
              const color = ZONE_COLORS(pct)
              return (
                <motion.div
                  key={zone}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border"
                  style={{ borderColor: color + '35' }}
                  whileHover={{ scale: 1.03 }}
                >
                  <div>
                    <div className="font-mono text-[8px] text-sage-600">ZONA {zone}</div>
                    <div className="font-mono font-bold text-base leading-none" style={{ color }}>{pct.toFixed(0)}%</div>
                  </div>
                  <div className="h-8 w-1 rounded-full bg-void/60 overflow-hidden flex flex-col-reverse">
                    <motion.div className="rounded-full" style={{ background: color }}
                      animate={{ height: `${pct}%` }} transition={{ duration: 0.8 }} />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* AI quick decision badge */}
          <motion.div
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl glass border"
            style={{ borderColor: ai.riskLevel === 'CRITICAL' ? 'rgba(239,68,68,0.45)' : ai.riskLevel === 'HIGH' ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.3)' }}
            animate={{ boxShadow: ai.riskLevel === 'CRITICAL' ? ['0 0 12px rgba(239,68,68,0.25)','0 0 24px rgba(239,68,68,0.15)','0 0 12px rgba(239,68,68,0.25)'] : 'none' }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div>
              <div className="font-mono text-[8px] text-sage-600">IA · {ai.confidence}% conf.</div>
              <div className="font-mono font-bold text-xs leading-none"
                style={{ color: ai.riskLevel === 'CRITICAL' ? '#ef4444' : ai.riskLevel === 'HIGH' ? '#f59e0b' : '#22c55e' }}>
                {sc?.icon} {ai.decision.replace(/_/g, ' ')}
              </div>
            </div>
          </motion.div>

          {/* Rover status */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-neon-700/20">
            <motion.div
              className={`w-1.5 h-1.5 rounded-full ${rover.status === 'ONLINE' ? 'bg-neon-400' : 'bg-critical'}`}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <div>
              <div className="font-mono text-[8px] text-sage-600">ROVER · {rover.battery}%</div>
              <div className={`font-mono font-bold text-xs leading-none ${rover.status === 'ONLINE' ? 'text-neon-400' : 'text-critical'}`}>
                {rover.status}
              </div>
            </div>
          </div>

          {/* Weather */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass border border-neon-700/15">
            <div>
              <div className="font-mono text-[8px] text-sage-600">TEMP · HUMEDAD</div>
              <div className="font-mono font-bold text-xs leading-none text-neon-200">
                {weather.temp.toFixed(0)}°C · {weather.humidity.toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Alerts */}
          <div className="ml-auto flex items-center gap-2">
            {alerts.length === 0 ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-500/10 border border-neon-500/20">
                <Activity size={9} className="text-neon-500" />
                <span className="font-mono text-[9px] text-neon-500">Sistemas normales</span>
              </div>
            ) : (
              alerts.slice(0, 1).map(a => (
                <motion.div key={a.id}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${a.type === 'critical' ? 'bg-critical/10 border-critical/40 text-critical' : 'bg-warning/10 border-warning/40 text-warning'}`}
                  animate={{ opacity: [1, 0.7, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <AlertTriangle size={9} />
                  <span className="font-mono text-[9px]">{a.msg}</span>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* ─── MAIN GRID ─── */}
        <div className="flex gap-3 flex-1 min-h-0">

          {/* ── LEFT: Field Map (dominant) ── */}
          <div className="flex-[2.2] min-h-0">
            <FieldMap telemetry={telemetry} tick={tick} scenario={scenario} />
          </div>

          {/* ── RIGHT: Analytics column ── */}
          <div className="w-72 flex flex-col gap-2.5 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
            <AICard ai={ai} telemetry={telemetry} />
            <RoverCard rover={rover} />
            <WeatherCard weather={weather} />
            <WaterCard water={water} />
            {/* Inline moisture trend in right col */}
            <div className="glass rounded-2xl p-3.5 border border-neon-700/15 flex-shrink-0">
              <MoistureTrend data={charts.moistureHistory} />
            </div>
          </div>
        </div>

        {/* ─── BOTTOM OPS ─── */}
        <div className="flex-shrink-0 mt-2">
          <OpsCards tick={tick} />
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
