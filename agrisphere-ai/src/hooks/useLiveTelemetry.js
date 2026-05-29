import { useState, useEffect, useRef, useCallback } from 'react'
import { generateTelemetry } from '../data/mockEngine.js'
import { SCENARIOS } from '../data/scenarios.js'

export function useLiveTelemetry(initialScenario = 'NORMAL') {
  const [scenario, setScenario] = useState(initialScenario)
  const [telemetry, setTelemetry] = useState(() => generateTelemetry(initialScenario, 0))
  const [tick, setTick] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const tickRef = useRef(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      tickRef.current += 1
      setTick(tickRef.current)
      setTelemetry(generateTelemetry(scenario, tickRef.current))
    }, 2500)
    return () => clearInterval(intervalRef.current)
  }, [scenario])

  const changeScenario = useCallback((newScenario) => {
    if (!SCENARIOS[newScenario]) return
    setTransitioning(true)
    setTimeout(() => {
      setScenario(newScenario)
      tickRef.current = 0
      setTelemetry(generateTelemetry(newScenario, 0))
      setTransitioning(false)
    }, 600)
  }, [])

  return { telemetry, scenario, changeScenario, transitioning, tick }
}
