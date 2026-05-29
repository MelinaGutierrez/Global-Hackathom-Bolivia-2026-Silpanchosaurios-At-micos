import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from './components/Nav.jsx'
import ScenarioBar from './components/ScenarioBar.jsx'
import Dashboard from './pages/Dashboard.jsx'
import RoverMonitoring from './pages/RoverMonitoring.jsx'
import SoilIntelligence from './pages/SoilIntelligence.jsx'
import IrrigationInsights from './pages/IrrigationInsights.jsx'
import AquiferStatus from './pages/AquiferStatus.jsx'
import { useLiveTelemetry } from './hooks/useLiveTelemetry.js'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const { telemetry, scenario, changeScenario, transitioning, tick } = useLiveTelemetry('NORMAL')

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard telemetry={telemetry} scenario={scenario} tick={tick} transitioning={transitioning} />
      case 'rover': return <RoverMonitoring telemetry={telemetry} />
      case 'soil': return <SoilIntelligence telemetry={telemetry} />
      case 'irrigation': return <IrrigationInsights telemetry={telemetry} />
      case 'aquifer': return <AquiferStatus telemetry={telemetry} />
      default: return <Dashboard telemetry={telemetry} scenario={scenario} tick={tick} transitioning={transitioning} />
    }
  }

  return (
    <div className="flex flex-col w-screen h-screen bg-void overflow-hidden relative">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #22c55e 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #38bdf8 0%, transparent 70%)' }} />
        {/* Subtle grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="bg-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#22c55e" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#bg-grid)" />
        </svg>
      </div>

      {/* Transition overlay */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="absolute inset-0 z-[100] bg-void"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <Nav activePage={page} onPageChange={setPage} alerts={telemetry.alerts} scenario={scenario} />
      <ScenarioBar activeScenario={scenario} onChange={changeScenario} />

      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            className="absolute inset-0"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.25 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
