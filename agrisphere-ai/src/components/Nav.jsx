import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Droplets, ChevronDown } from 'lucide-react'
import { SCENARIOS } from '../data/scenarios.js'

const NAV_ITEMS = [
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'rover',      label: 'Rover' },
  { id: 'soil',       label: 'Soil' },
  { id: 'irrigation', label: 'Irrigation' },
  { id: 'aquifer',    label: 'Aquifer' },
]

export default function Nav({ activePage, onPageChange, alerts = [], scenario, onScenarioChange }) {
  const [scenarioOpen, setScenarioOpen] = useState(false)
  const sc = SCENARIOS[scenario]
  const criticalCount = alerts.filter(a => a.type === 'critical').length

  return (
    <header
      className="flex-shrink-0 flex items-center gap-6 px-5 z-50 relative bg-white"
      style={{ height: 52, borderBottom: '1px solid rgba(15,23,42,0.08)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: '#2563eb' }}>
          <Droplets size={13} color="#fff" />
        </div>
        <span style={{ fontFamily:'Outfit', fontWeight:700, fontSize:14, color:'#0f172a', letterSpacing:'-0.01em' }}>
          Hydro<span style={{ color:'#2563eb' }}>Sphere</span> <span style={{ color:'rgba(15,23,42,0.35)', fontWeight:400 }}>AI</span>
        </span>
      </div>

      {/* Live indicator */}
      <div className="flex items-center gap-1.5 flex-shrink-0 px-2.5 py-1 rounded-full"
        style={{ background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.2)' }}>
        <motion.div
          className="w-1.5 h-1.5 rounded-full"
          style={{ background:'#16a34a' }}
          animate={{ opacity:[1,0.3,1] }}
          transition={{ duration:1.2, repeat:Infinity }}
        />
        <span style={{ fontFamily:'Outfit', fontWeight:600, fontSize:10, color:'#16a34a', letterSpacing:'0.05em' }}>
          LIVE
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex items-center gap-0.5">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className="relative px-3.5 py-1.5 rounded-lg transition-all"
            style={{
              fontFamily:'Outfit', fontSize:13,
              fontWeight: activePage === item.id ? 600 : 400,
              color: activePage === item.id ? '#0f172a' : 'rgba(15,23,42,0.45)',
              background: 'transparent', border: 'none', cursor: 'pointer',
            }}
          >
            {item.label}
            {activePage === item.id && (
              <motion.div
                layoutId="navLine"
                className="absolute bottom-0.5 rounded-full"
                style={{ left:14, right:14, height:2, background:'#16a34a' }}
                transition={{ type:'spring', bounce:0.2, duration:0.4 }}
              />
            )}
          </button>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        {/* Scenario selector */}
        <div className="relative">
          <button
            onClick={() => setScenarioOpen(o => !o)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
            style={{
              fontFamily:'Outfit', fontSize:12, fontWeight:500,
              color:'#0f172a',
              background: 'rgba(15,23,42,0.04)',
              border: '1px solid rgba(15,23,42,0.10)',
            }}
          >
            <span style={{ fontSize:13 }}>{sc?.icon}</span>
            <span>{sc?.label}</span>
            <ChevronDown size={11} style={{ color:'rgba(15,23,42,0.4)' }} />
          </button>

          {scenarioOpen && (
            <motion.div
              initial={{ opacity:0, y:4 }}
              animate={{ opacity:1, y:0 }}
              className="absolute top-full right-0 mt-1 rounded-xl overflow-hidden z-50"
              style={{
                width:210, background:'#ffffff',
                border:'1px solid rgba(15,23,42,0.10)',
                boxShadow:'0 8px 24px rgba(0,0,0,0.08)',
              }}
            >
              {Object.values(SCENARIOS).map(s => (
                <button
                  key={s.id}
                  onClick={() => { onScenarioChange(s.id); setScenarioOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors"
                  style={{
                    fontFamily:'Outfit', fontSize:12,
                    fontWeight: scenario === s.id ? 600 : 400,
                    color: scenario === s.id ? '#16a34a' : '#0f172a',
                    background: scenario === s.id ? 'rgba(22,163,74,0.06)' : 'transparent',
                  }}
                  onMouseEnter={e => { if (scenario !== s.id) e.currentTarget.style.background = 'rgba(15,23,42,0.04)' }}
                  onMouseLeave={e => { if (scenario !== s.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                  {scenario === s.id && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background:'#16a34a' }} />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </div>

        {/* Alerts */}
        <button className="relative w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ color:'rgba(15,23,42,0.45)' }}>
          <Bell size={15} />
          {criticalCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background:'#dc2626', color:'#fff', fontSize:9, fontWeight:700, fontFamily:'Outfit' }}>
              {criticalCount}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg cursor-pointer">
          <div className="w-6 h-6 rounded-full flex items-center justify-center"
            style={{ background:'#0f172a' }}>
            <span style={{ fontSize:10, fontWeight:700, color:'#fff', fontFamily:'Outfit' }}>D</span>
          </div>
          <span style={{ fontSize:12, fontWeight:500, fontFamily:'Outfit', color:'#0f172a' }}>Daniel</span>
        </div>
      </div>
    </header>
  )
}
