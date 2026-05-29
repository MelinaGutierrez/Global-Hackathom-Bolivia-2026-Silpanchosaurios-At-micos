import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Leaf, ChevronDown, Settings } from 'lucide-react'
import { SCENARIOS } from '../data/scenarios.js'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'rover',      label: 'Rover' },
  { id: 'soil',       label: 'Suelo' },
  { id: 'irrigation', label: 'Riego' },
  { id: 'aquifer',    label: 'Acuífero' },
]

export default function Nav({ activePage, onPageChange, alerts = [], scenario, onScenarioChange }) {
  const [scenarioOpen, setScenarioOpen] = useState(false)
  const sc = SCENARIOS[scenario]
  const criticalCount = alerts.filter(a => a.type === 'critical').length

  return (
    <header className="flex-shrink-0 bg-white border-b border-gray-100 px-5 h-13 flex items-center gap-5 z-50 relative" style={{ height: 52 }}>
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center">
          <Leaf size={13} className="text-white" />
        </div>
        <span className="font-display font-bold text-sm text-gray-800">AgriSphere <span className="text-green-600">AI</span></span>
      </div>

      {/* Live dot */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 border border-green-200 flex-shrink-0">
        <motion.div className="w-1.5 h-1.5 rounded-full bg-green-500"
          animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
        <span className="font-mono text-[10px] text-green-700 font-semibold">EN VIVO</span>
      </div>

      {/* Nav */}
      <nav className="flex items-center gap-0.5">
        {NAV_ITEMS.map(item => (
          <button key={item.id} onClick={() => onPageChange(item.id)}
            className={`relative px-3.5 py-1.5 rounded-lg text-sm font-outfit transition-all ${
              activePage === item.id
                ? 'text-green-700 font-semibold bg-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}>
            {item.label}
            {activePage === item.id && (
              <motion.div layoutId="navUnderline"
                className="absolute bottom-0.5 left-3.5 right-3.5 h-0.5 rounded-full bg-green-600"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }} />
            )}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {/* Scenario selector */}
        <div className="relative">
          <button
            onClick={() => setScenarioOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:border-gray-300 transition-all text-sm"
          >
            <span>{sc?.icon}</span>
            <span className="font-outfit text-gray-700 text-xs font-medium">{sc?.label}</span>
            <ChevronDown size={12} className="text-gray-400" />
          </button>
          {scenarioOpen && (
            <motion.div
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="absolute top-full right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-float py-1 z-50"
            >
              {Object.values(SCENARIOS).map(s => (
                <button key={s.id}
                  onClick={() => { onScenarioChange(s.id); setScenarioOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-gray-50 transition-colors ${scenario === s.id ? 'bg-green-50 text-green-700' : 'text-gray-700'}`}
                >
                  <span>{s.icon}</span>
                  <span className="font-outfit">{s.label}</span>
                  {scenario === s.id && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Alerts */}
        <button className="relative w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
          <Bell size={15} />
          {criticalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {criticalCount}
            </span>
          )}
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center">
            <span className="text-[11px] font-bold text-white">D</span>
          </div>
          <span className="text-sm font-outfit text-gray-700">Daniel</span>
        </div>
      </div>
    </header>
  )
}
