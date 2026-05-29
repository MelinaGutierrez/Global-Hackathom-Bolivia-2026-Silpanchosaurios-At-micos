import { motion } from 'framer-motion'
import { SCENARIOS } from '../data/scenarios.js'

export default function ScenarioBar({ activeScenario, onChange }) {
  return (
    <div className="flex items-center gap-2 px-5 py-2 border-b border-neon-700/10 bg-void/40 flex-shrink-0 overflow-x-auto">
      <span className="text-xs font-mono text-sage-600 whitespace-nowrap mr-1">DEMO SCENARIO</span>
      {Object.values(SCENARIOS).map(s => (
        <motion.button
          key={s.id}
          onClick={() => onChange(s.id)}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-outfit whitespace-nowrap transition-all duration-200 ${
            activeScenario === s.id
              ? 'bg-neon-500/20 border border-neon-500/50 text-neon-300'
              : 'bg-surface/50 border border-sage-800/40 text-sage-400 hover:border-sage-600/50 hover:text-sage-200'
          }`}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <span>{s.icon}</span>
          <span>{s.label}</span>
          {activeScenario === s.id && (
            <motion.span
              className="w-1 h-1 rounded-full"
              style={{ background: s.color }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </motion.button>
      ))}
    </div>
  )
}
