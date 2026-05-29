import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Droplets, AlertTriangle, CheckCircle, XCircle, Zap, TrendingDown, Shield } from 'lucide-react'

const DECISION_CONFIG = {
  IRRIGATE_NOW: {
    label: 'IRRIGAR AHORA',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.5)',
    glow: 'rgba(239,68,68,0.3)',
    icon: Droplets,
    pulse: true,
  },
  STABLE: {
    label: 'CONDICIÓN ESTABLE',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.4)',
    glow: 'rgba(34,197,94,0.2)',
    icon: CheckCircle,
    pulse: false,
  },
  STOP_IRRIGATION: {
    label: 'DETENER RIEGO',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.1)',
    border: 'rgba(56,189,248,0.45)',
    glow: 'rgba(56,189,248,0.25)',
    icon: XCircle,
    pulse: true,
  },
  SENSOR_ALERT: {
    label: 'ALERTA DE SENSOR',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.1)',
    border: 'rgba(245,158,11,0.45)',
    glow: 'rgba(245,158,11,0.25)',
    icon: AlertTriangle,
    pulse: true,
  },
  CONSERVE_WATER: {
    label: 'CONSERVAR AGUA',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.1)',
    border: 'rgba(139,92,246,0.45)',
    glow: 'rgba(139,92,246,0.25)',
    icon: Shield,
    pulse: true,
  },
}

export default function AICard({ ai, telemetry }) {
  const cfg = DECISION_CONFIG[ai.decision] || DECISION_CONFIG.STABLE
  const Icon = cfg.icon

  return (
    <motion.div
      className="relative rounded-2xl overflow-hidden border flex-shrink-0"
      style={{
        background: cfg.bg,
        borderColor: cfg.border,
        boxShadow: `0 0 30px ${cfg.glow}, 0 0 80px ${cfg.glow.replace('0.3', '0.08')}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      animate={{ boxShadow: cfg.pulse
        ? [`0 0 20px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`, `0 0 50px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`, `0 0 20px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`]
        : `0 0 20px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Animated border shimmer */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, transparent 40%, ${cfg.border.replace('0.45', '0.15')} 50%, transparent 60%)`,
            backgroundSize: '200% 200%',
          }}
          animate={{ backgroundPosition: ['0% 0%', '200% 200%'] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
        />
      </div>

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
              <Brain size={14} style={{ color: cfg.color }} />
              {cfg.pulse && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{ border: `1px solid ${cfg.color}` }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <div className="font-display font-semibold text-xs tracking-wider" style={{ color: cfg.color }}>
                MOTOR IA — DECISIÓN
              </div>
              <div className="font-mono text-[9px] text-sage-500">claude-agri-v2.4 · región andina</div>
            </div>
          </div>
          <motion.div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
            animate={cfg.pulse ? { opacity: [1, 0.6, 1] } : {}}
            transition={{ duration: 1.2, repeat: Infinity }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
            <span className="font-mono text-[10px] font-bold" style={{ color: cfg.color }}>
              {cfg.pulse ? 'ACTIVO' : 'MONITOR'}
            </span>
          </motion.div>
        </div>

        {/* Main Decision */}
        <AnimatePresence mode="wait">
          <motion.div
            key={ai.decision}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <Icon size={22} style={{ color: cfg.color }} />
              </div>
              <div className="flex-1">
                <div className="font-display font-bold text-lg leading-tight" style={{ color: cfg.color }}>
                  {cfg.label}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-xs text-sage-400">Confianza IA:</span>
                  <span className="font-mono text-sm font-bold" style={{ color: cfg.color }}>{ai.confidence}%</span>
                </div>
              </div>
            </div>

            {/* Confidence bar */}
            <div className="mb-3">
              <div className="h-1.5 bg-void/60 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${ai.confidence}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Message */}
            <p className="font-outfit text-xs text-sage-200 leading-relaxed mb-3 border-l-2 pl-3"
              style={{ borderColor: cfg.color + '60' }}>
              {ai.message}
            </p>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 gap-2">
              {ai.volume != null && (
                <div className="rounded-lg p-2.5" style={{ background: 'rgba(3,13,6,0.6)', border: '1px solid rgba(34,197,94,0.1)' }}>
                  <div className="font-mono text-[9px] text-sage-500 mb-0.5">VOLUMEN REC.</div>
                  <div className="font-mono text-base font-bold" style={{ color: cfg.color }}>
                    {ai.volume} <span className="text-xs font-normal text-sage-400">L/m²</span>
                  </div>
                </div>
              )}
              <div className="rounded-lg p-2.5" style={{ background: 'rgba(3,13,6,0.6)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <div className="font-mono text-[9px] text-sage-500 mb-0.5">RIESGO ACUÍFERO</div>
                <div className="flex items-center gap-1">
                  <TrendingDown size={12} style={{ color: cfg.color }} />
                  <span className="font-mono text-sm font-bold" style={{ color: cfg.color }}>
                    -{ai.aquiferReduction}%
                  </span>
                </div>
              </div>
              <div className="rounded-lg p-2.5 col-span-1" style={{ background: 'rgba(3,13,6,0.6)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <div className="font-mono text-[9px] text-sage-500 mb-0.5">NIVEL RIESGO</div>
                <div className="font-mono text-xs font-bold" style={{ color: ai.riskLevel === 'CRITICAL' ? '#ef4444' : ai.riskLevel === 'HIGH' ? '#f59e0b' : '#22c55e' }}>
                  {ai.riskLevel}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer timestamp */}
        <div className="mt-3 pt-3 border-t flex items-center justify-between" style={{ borderColor: 'rgba(34,197,94,0.08)' }}>
          <span className="font-mono text-[9px] text-sage-600">Actualizado: {new Date().toLocaleTimeString('es-BO')}</span>
          <div className="flex items-center gap-1">
            <Zap size={9} style={{ color: cfg.color }} />
            <span className="font-mono text-[9px]" style={{ color: cfg.color }}>IA ACTIVA</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
