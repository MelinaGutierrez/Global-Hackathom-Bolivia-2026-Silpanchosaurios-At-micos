import { motion } from 'framer-motion'
import { Cpu, Waves, Activity, Route, Database, CheckCircle, Loader, AlertCircle } from 'lucide-react'

const OPS = [
  { id: 'sensors', icon: Cpu, label: 'Inspeccionar Sensores', desc: 'Validar lecturas de 8 nodos', progressKey: 'sensorProgress' },
  { id: 'wells', icon: Waves, label: 'Niveles de Pozo', desc: 'Monitoreo de acuífero activo', progressKey: 'wellProgress' },
  { id: 'moisture', icon: Activity, label: 'Validar Humedad', desc: 'Calibración de zonas A/B/C', progressKey: 'moistureProgress' },
  { id: 'route', icon: Route, label: 'Optimizar Ruta Rover', desc: 'Cálculo de recorrido IA', progressKey: 'routeProgress' },
  { id: 'aquifer', icon: Database, label: 'Monitoreo Acuífero', desc: 'Análisis de presión subterránea', progressKey: 'aquiferProgress' },
]

function getStatus(progress) {
  if (progress >= 100) return { label: 'COMPLETADO', color: '#22c55e', icon: CheckCircle }
  if (progress > 0) return { label: 'EN PROGRESO', color: '#f59e0b', icon: Loader }
  return { label: 'PENDIENTE', color: '#4d7a5a', icon: AlertCircle }
}

export default function OpsCards({ tick }) {
  // Generate pseudo-realistic progress values
  const getProgress = (id, offset) => {
    const base = ((tick * 1.3 + offset) % 120)
    if (base < 100) return Math.min(Math.round(base), 100)
    return 100
  }

  const progresses = {
    sensorProgress: getProgress('sensors', 10),
    wellProgress: getProgress('wells', 35),
    moistureProgress: getProgress('moisture', 60),
    routeProgress: getProgress('route', 80),
    aquiferProgress: getProgress('aquifer', 20),
  }

  return (
    <div className="flex-shrink-0">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-1 h-3 rounded-full bg-neon-500" />
        <span className="font-display font-semibold text-xs text-neon-200 tracking-wide">OPERACIONES DE CAMPO</span>
        <div className="h-px flex-1 bg-neon-800/30" />
        <span className="font-mono text-[9px] text-sage-600">{new Date().toLocaleTimeString('es-BO')}</span>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {OPS.map((op) => {
          const progress = progresses[op.progressKey]
          const status = getStatus(progress)
          const StatusIcon = status.icon
          const OpIcon = op.icon

          return (
            <motion.div
              key={op.id}
              className="glass rounded-xl p-3 border border-neon-700/15 cursor-pointer"
              whileHover={{ scale: 1.02, borderColor: 'rgba(34,197,94,0.3)' }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-1.5 rounded-lg bg-neon-500/10 border border-neon-500/20">
                  <OpIcon size={12} className="text-neon-400" />
                </div>
                <motion.div
                  animate={status.label === 'EN PROGRESO' ? { rotate: 360 } : {}}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <StatusIcon size={10} style={{ color: status.color }} />
                </motion.div>
              </div>

              <div className="font-outfit text-xs font-semibold text-neon-100 leading-tight mb-1">{op.label}</div>
              <div className="font-mono text-[9px] text-sage-500 leading-tight mb-2">{op.desc}</div>

              <div className="h-1 bg-void/60 rounded-full overflow-hidden mb-1">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${status.color}88, ${status.color})` }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-mono text-[8px]" style={{ color: status.color }}>{status.label}</span>
                <span className="font-mono text-[9px] text-sage-400">{progress}%</span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
