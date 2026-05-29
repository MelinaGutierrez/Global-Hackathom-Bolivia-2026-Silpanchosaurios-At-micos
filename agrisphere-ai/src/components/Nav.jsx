import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, ChevronDown, Wifi, Activity, Leaf } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'rover', label: 'Rover Monitoring' },
  { id: 'soil', label: 'Soil Intelligence' },
  { id: 'irrigation', label: 'Irrigation Insights' },
  { id: 'aquifer', label: 'Aquifer Status' },
]

export default function Nav({ activePage, onPageChange, alerts = [], scenario }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const criticalCount = alerts.filter(a => a.type === 'critical').length

  return (
    <header className="relative z-50 flex-shrink-0">
      <div className="glass-strong border-b border-neon-700/20">
        <div className="flex items-center h-14 px-5 gap-6">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 rounded-lg bg-neon-500/20 border border-neon-500/40 flex items-center justify-center">
                <Leaf size={14} className="text-neon-400" />
              </div>
              <motion.div
                className="absolute inset-0 rounded-lg border border-neon-400/30"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </div>
            <div>
              <span className="font-display font-bold text-sm text-neon-50 tracking-wide">AgriSphere</span>
              <span className="font-display font-bold text-sm text-neon-400 tracking-wide"> AI</span>
            </div>
          </motion.div>

          {/* Live indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-500/10 border border-neon-500/20">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-neon-400"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
            />
            <span className="font-mono text-xs text-neon-400 font-medium">LIVE</span>
          </div>

          {/* Nav */}
          <nav className="flex items-center gap-0.5 ml-2">
            {NAV_ITEMS.map(item => (
              <motion.button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`relative px-3.5 py-1.5 rounded-lg text-sm font-outfit transition-all duration-200 ${
                  activePage === item.id
                    ? 'text-neon-300 font-medium'
                    : 'text-sage-300 hover:text-neon-200'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                {activePage === item.id && (
                  <motion.div
                    layoutId="navActive"
                    className="absolute inset-0 rounded-lg bg-neon-500/12 border border-neon-500/25"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative">{item.label}</span>
              </motion.button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Signal */}
            <div className="hidden md:flex items-center gap-1.5 text-sage-400">
              <Wifi size={13} />
              <span className="font-mono text-xs">Cliza, VACbba</span>
            </div>

            {/* Search */}
            <motion.button
              className="w-8 h-8 rounded-lg glass flex items-center justify-center text-sage-400 hover:text-neon-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <Search size={14} />
            </motion.button>

            {/* Alerts bell */}
            <motion.button
              className="relative w-8 h-8 rounded-lg glass flex items-center justify-center text-sage-400 hover:text-neon-300 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Bell size={14} />
              {criticalCount > 0 && (
                <motion.span
                  className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-critical text-white text-[9px] font-bold flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {criticalCount}
                </motion.span>
              )}
            </motion.button>

            {/* User */}
            <motion.button
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg glass hover:border-neon-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-neon-600 to-sage-600 flex items-center justify-center">
                <span className="text-xs font-bold text-white">D</span>
              </div>
              <span className="text-sm text-sage-200 font-outfit">Daniel</span>
              <ChevronDown size={12} className="text-sage-500" />
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  )
}
