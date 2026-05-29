import { SCENARIOS } from './scenarios.js'

const jitter = (base, range) => parseFloat((base + (Math.random() - 0.5) * range).toFixed(2))
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

export function generateTelemetry(scenario, tick) {
  const s = SCENARIOS[scenario]
  const t = tick / 10

  // Moisture fluctuates realistically
  const moisture = {
    A: clamp(jitter(s.moisture.A, 2.5), 5, 98),
    B: clamp(jitter(s.moisture.B, 2.0), 5, 98),
    C: clamp(jitter(s.moisture.C, 2.0), 5, 98),
  }

  // Rover position along path (interpolated)
  const roverLat = -17.601 + Math.sin(t * 0.3) * 0.002
  const roverLng = -65.931 + Math.cos(t * 0.25) * 0.003
  const roverBattery = scenario === 'ROVER_FAIL'
    ? clamp(s.roverBattery - (tick % 5 === 0 ? 1 : 0), 1, 100)
    : clamp(s.roverBattery - (tick * 0.02), 10, 100)
  const roverSpeed = scenario === 'ROVER_FAIL' ? 0 : clamp(jitter(2.1, 0.8), 0, 4.5)
  const roverSignal = scenario === 'ROVER_FAIL' ? clamp(jitter(15, 10), 0, 40) : clamp(jitter(92, 6), 60, 100)
  const syncLatency = scenario === 'ROVER_FAIL' ? jitter(2400, 800) : jitter(180, 60)
  const routeProgress = clamp(((tick * 1.2) % 100), 0, 100)

  // Weather with natural variation
  const temp = clamp(jitter(s.temp, 1.5), 10, 42)
  const humidity = clamp(jitter(s.humidity, 3), 15, 99)
  const wind = clamp(jitter(s.wind, 2), 0, 35)
  const et0 = clamp(jitter(s.et0, 0.4), 0.5, 12)
  const rainfall = clamp(jitter(s.rainfall, 0.3), 0, 30)

  // AI metrics
  const avgMoisture = (moisture.A + moisture.B + moisture.C) / 3
  let aiDecision = s.aiDecision
  let aiConfidence = clamp(jitter(s.aiConfidence, 3), 50, 99)
  let aiVolume = s.aiVolume

  // Water conservation
  const waterSaved = scenario === 'OVERWATER' ? jitter(2800, 200) : jitter(1240, 150)
  const irrigationEff = clamp(jitter(scenario === 'DROUGHT' ? 58 : 82, 4), 40, 98)
  const aquiferStress = clamp(jitter(s.aquiferStress, 3), 5, 98)
  const aquiferDepth = clamp(jitter(scenario === 'AQUIFER' ? 31.2 : 18.4, 0.8), 8, 60)
  const nutrientLoss = clamp(jitter(scenario === 'OVERWATER' ? 78 : 12, 5), 2, 95)

  // History arrays for charts
  const moistureHistory = Array.from({ length: 24 }, (_, i) => ({
    hour: `${String(i).padStart(2, '0')}:00`,
    A: clamp(s.moisture.A + Math.sin(i * 0.5) * 8 + (Math.random() - 0.5) * 5, 5, 98),
    B: clamp(s.moisture.B + Math.cos(i * 0.4) * 6 + (Math.random() - 0.5) * 4, 5, 98),
    C: clamp(s.moisture.C + Math.sin(i * 0.6 + 1) * 7 + (Math.random() - 0.5) * 4, 5, 98),
  }))

  const aquiferHistory = Array.from({ length: 12 }, (_, i) => ({
    month: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'][i],
    depth: clamp(aquiferDepth - (11 - i) * 0.8 + Math.sin(i) * 1.5, 8, 60),
    recharge: clamp(jitter(4.2, 1.5), 0, 12),
  }))

  const alerts = buildAlerts(scenario, moisture, roverBattery, aquiferStress, roverSignal)

  return {
    timestamp: new Date().toISOString(),
    scenario,
    moisture,
    avgMoisture,
    rover: {
      status: s.roverStatus,
      battery: Math.round(roverBattery),
      speed: roverSpeed,
      lat: roverLat,
      lng: roverLng,
      signal: Math.round(roverSignal),
      syncLatency: Math.round(syncLatency),
      routeProgress: Math.round(routeProgress),
      failures: scenario === 'ROVER_FAIL' ? Math.floor(tick / 20) + 2 : 0,
      mode: scenario === 'ROVER_FAIL' ? 'RECOVERY' : 'SCANNING',
    },
    weather: { temp, humidity, wind, et0, rainfall },
    ai: {
      decision: aiDecision,
      confidence: Math.round(aiConfidence),
      volume: aiVolume,
      message: s.aiMessage,
      aquiferReduction: clamp(jitter(18, 4), 5, 35),
      riskLevel: getRiskLevel(aiDecision),
    },
    water: {
      saved: Math.round(waterSaved),
      efficiency: Math.round(irrigationEff),
      aquiferStress: Math.round(aquiferStress),
      aquiferDepth: aquiferDepth.toFixed(1),
      consumption: Math.round(jitter(4200, 300)),
      nutrientLoss: Math.round(nutrientLoss),
    },
    charts: { moistureHistory, aquiferHistory },
    alerts,
  }
}

function getRiskLevel(decision) {
  const map = {
    IRRIGATE_NOW: 'CRITICAL',
    STOP_IRRIGATION: 'HIGH',
    CONSERVE_WATER: 'HIGH',
    SENSOR_ALERT: 'MEDIUM',
    STABLE: 'LOW',
  }
  return map[decision] || 'MEDIUM'
}

function buildAlerts(scenario, moisture, battery, aquiferStress, signal) {
  const alerts = []
  if (moisture.A < 25) alerts.push({ id: 'a1', type: 'critical', zone: 'A', msg: 'Zona A: Humedad crítica — bajo umbral de riesgo', ts: new Date() })
  if (moisture.C > 85) alerts.push({ id: 'a2', type: 'warning', zone: 'C', msg: 'Zona C: Riesgo de saturación detectado', ts: new Date() })
  if (battery < 20) alerts.push({ id: 'a3', type: 'warning', zone: null, msg: 'Rover: Batería baja — recarga urgente', ts: new Date() })
  if (aquiferStress > 75) alerts.push({ id: 'a4', type: 'critical', zone: null, msg: 'Acuífero: Nivel de estrés crítico (>' + aquiferStress + '%)', ts: new Date() })
  if (signal < 40) alerts.push({ id: 'a5', type: 'warning', zone: null, msg: 'Rover: Señal débil — posible pérdida de telemetría', ts: new Date() })
  return alerts
}

export function interpolateRoverPosition(tick, path) {
  const totalPoints = path.length - 1
  const t = (tick * 0.8) % (totalPoints * 10)
  const segment = Math.floor(t / 10)
  const frac = (t % 10) / 10
  const s = Math.min(segment, totalPoints - 1)
  const p1 = path[s]
  const p2 = path[s + 1] || path[0]
  return {
    x: p1.x + (p2.x - p1.x) * frac,
    y: p1.y + (p2.y - p1.y) * frac,
  }
}
