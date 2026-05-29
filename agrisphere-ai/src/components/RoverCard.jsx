import { motion } from 'framer-motion'
import { Radio, Battery, Wifi, AlertCircle, MapPin, Route, Clock } from 'lucide-react'

export default function RoverCard({ rover }) {
  const isOnline = rover.status === 'ONLINE'
  const batteryColor = rover.battery < 20 ? '#ef4444' : rover.battery < 50 ? '#f59e0b' : '#22c55e'

  return (
    <div className="glass rounded-2xl p-4 border border-neon-700/15">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-neon-400' : 'bg-critical'}`}>
            {isOnline && (
              <motion.div
                className="w-full h-full rounded-full bg-neon-400"
                animate={{ scale: [1, 2, 1], opacity: [1, 0, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
          </div>
          <span className="font-display font-semibold text-sm text-neon-100">Rover AGRS-01</span>
        </div>
        <motion.span
          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isOnline
              ? 'bg-neon-500/15 text-neon-400 border border-neon-500/30'
              : 'bg-critical/15 text-critical border border-critical/30'
          }`}
          animate={!isOnline ? { opacity: [1, 0.5, 1] } : {}}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          {rover.status} · {rover.mode}
        </motion.span>
      </div>

      {/* Battery */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Battery size={12} style={{ color: batteryColor }} />
            <span className="font-mono text-[10px] text-sage-400">Batería</span>
          </div>
          <span className="font-mono text-sm font-bold" style={{ color: batteryColor }}>{rover.battery}%</span>
        </div>
        <div className="h-1.5 bg-void/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${batteryColor}88, ${batteryColor})`, width: `${rover.battery}%` }}
            animate={rover.battery < 20 ? { opacity: [1, 0.5, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCell icon={MapPin} label="Lat" value={`${rover.lat?.toFixed(4)}°S`} />
        <StatCell icon={MapPin} label="Lon" value={`${Math.abs(rover.lng)?.toFixed(4)}°O`} />
        <StatCell
          icon={Wifi}
          label="Señal"
          value={`${rover.signal}%`}
          danger={rover.signal < 40}
        />
        <StatCell
          icon={Clock}
          label="Latencia"
          value={`${rover.syncLatency}ms`}
          danger={rover.syncLatency > 1000}
        />
        <StatCell icon={AlertCircle} label="Fallos" value={rover.failures} danger={rover.failures > 0} />
        <StatCell icon={Route} label="Ruta" value={`${rover.routeProgress}%`} />
      </div>

      {/* Route progress */}
      <div className="mt-3">
        <div className="flex justify-between mb-1">
          <span className="font-mono text-[9px] text-sage-500">PROGRESO DE RUTA</span>
          <span className="font-mono text-[10px] text-neon-400">{rover.routeProgress}%</span>
        </div>
        <div className="h-1 bg-void/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-neon-600 to-neon-400"
            animate={{ width: `${rover.routeProgress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}

function StatCell({ icon: Icon, label, value, danger }) {
  return (
    <div className="rounded-lg p-2 bg-void/40 border border-neon-700/10">
      <div className="flex items-center gap-1 mb-0.5">
        <Icon size={9} className="text-sage-500" />
        <span className="font-mono text-[9px] text-sage-500">{label}</span>
      </div>
      <span className={`font-mono text-xs font-semibold ${danger ? 'text-critical' : 'text-neon-200'}`}>
        {value}
      </span>
    </div>
  )
}
