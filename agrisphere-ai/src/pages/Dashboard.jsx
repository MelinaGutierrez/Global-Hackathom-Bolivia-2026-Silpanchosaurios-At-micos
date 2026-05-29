import { AnimatePresence, motion } from 'framer-motion'
import Sidebar from '../components/Sidebar.jsx'
import FieldMap from '../components/FieldMap.jsx'

export default function Dashboard({ telemetry, scenario, tick, transitioning }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={scenario}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex h-full overflow-hidden"
      >
        <Sidebar telemetry={telemetry} scenario={scenario} />
        <main className="flex-1 min-w-0 overflow-hidden bg-[#f0f4ee] p-3">
          <FieldMap telemetry={telemetry} tick={tick} scenario={scenario} />
        </main>
      </motion.div>
    </AnimatePresence>
  )
}
