import { motion } from 'framer-motion'
import { Waves, TrendingUp, AlertTriangle, Leaf, BarChart3 } from 'lucide-react'

export default function WaterCard({ water }) {
  const { saved, efficiency, aquiferStress, aquiferDepth, consumption, nutrientLoss } = water

  const stressColor = aquiferStress > 75 ? '#ef4444' : aquiferStress > 50 ? '#f59e0b' : '#22c55e'
  const effColor = efficiency > 75 ? '#22c55e' : efficiency > 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="glass rounded-2xl p-4 border border-neon-700/15">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display font-semibold text-sm text-neon-100">Recursos Hídricos</span>
        <Waves size={14} className="text-aquifer" />
      </div>

      {/* Water saved hero */}
      <div className="rounded-xl p-3 mb-3 border" style={{ background: 'rgba(34,197,94,0.06)', borderColor: 'rgba(34,197,94,0.2)' }}>
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-neon-500/15">
            <Leaf size={12} className="text-neon-400" />
          </div>
          <div>
            <div className="font-mono text-[9px] text-sage-500">AGUA CONSERVADA HOY</div>
            <motion.div
              className="font-mono text-xl font-bold text-neon-300"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {saved.toLocaleString()} L
            </motion.div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <GaugeCell
          label="Eficiencia de Riego"
          value={efficiency}
          unit="%"
          color={effColor}
          showBar
        />
        <GaugeCell
          label="Estrés Acuífero"
          value={aquiferStress}
          unit="%"
          color={stressColor}
          showBar
          warning={aquiferStress > 65}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg p-2 bg-void/40 border border-neon-700/10">
          <div className="font-mono text-[9px] text-sage-500 mb-0.5">PROF. ACUÍFERO</div>
          <div className="font-mono text-sm font-bold text-aquifer">{aquiferDepth} m</div>
        </div>
        <div className="rounded-lg p-2 bg-void/40 border border-neon-700/10">
          <div className="font-mono text-[9px] text-sage-500 mb-0.5">CONSUMO EST.</div>
          <div className="font-mono text-sm font-bold text-neon-200">{consumption.toLocaleString()} L/d</div>
        </div>
      </div>

      {nutrientLoss > 30 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 flex items-center gap-2 rounded-lg p-2 bg-warning/8 border border-warning/30"
        >
          <AlertTriangle size={11} className="text-warning flex-shrink-0" />
          <span className="font-mono text-[9px] text-warning">Riesgo de pérdida de nutrientes: {nutrientLoss}%</span>
        </motion.div>
      )}
    </div>
  )
}

function GaugeCell({ label, value, unit, color, showBar, warning }) {
  return (
    <div className="rounded-lg p-2 bg-void/40 border border-neon-700/10">
      {warning && (
        <AlertTriangle size={9} className="text-warning mb-0.5" />
      )}
      <div className="font-mono text-[9px] text-sage-500 mb-0.5">{label.toUpperCase()}</div>
      <div className="font-mono text-base font-bold" style={{ color }}>{value}{unit}</div>
      {showBar && (
        <div className="h-1 bg-void/60 rounded-full mt-1.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: color, opacity: 0.8 }}
            animate={{ width: `${value}%` }}
            transition={{ duration: 0.7 }}
          />
        </div>
      )}
    </div>
  )
}
