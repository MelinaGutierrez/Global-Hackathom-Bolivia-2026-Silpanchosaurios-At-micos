import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Nav from './components/Nav.jsx'
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
    <div className="flex flex-col w-screen h-screen bg-[#f0f4ee] overflow-hidden">
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="absolute inset-0 z-[100] bg-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      <Nav
        activePage={page}
        onPageChange={setPage}
        alerts={telemetry.alerts}
        scenario={scenario}
        onScenarioChange={changeScenario}
      />

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
