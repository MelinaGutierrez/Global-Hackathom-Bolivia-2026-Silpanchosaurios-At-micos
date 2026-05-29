import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ZoomIn, ZoomOut, Maximize2, Navigation } from 'lucide-react'
import { interpolateRoverPosition } from '../data/mockEngine.js'
import { ROVER_PATH, SENSOR_NODES } from '../data/scenarios.js'

const getMoistureColor = (pct) => {
  if (pct < 25) return { fill: 'rgba(239,68,68,0.22)', stroke: 'rgba(239,68,68,0.7)', label: 'CRÍTICO' }
  if (pct < 40) return { fill: 'rgba(245,158,11,0.18)', stroke: 'rgba(245,158,11,0.6)', label: 'SECO' }
  if (pct < 70) return { fill: 'rgba(34,197,94,0.15)', stroke: 'rgba(34,197,94,0.5)', label: 'ÓPTIMO' }
  if (pct < 85) return { fill: 'rgba(56,189,248,0.15)', stroke: 'rgba(56,189,248,0.5)', label: 'HÚMEDO' }
  return { fill: 'rgba(99,102,241,0.22)', stroke: 'rgba(99,102,241,0.7)', label: 'SATURADO' }
}

export default function FieldMap({ telemetry, tick, scenario }) {
  const [roverPos, setRoverPos] = useState({ x: 130, y: 140 })
  const [trail, setTrail] = useState([])
  const [scanY, setScanY] = useState(-50)
  const [hoveredZone, setHoveredZone] = useState(null)
  const [zoom, setZoom] = useState(1)
  const animRef = useRef()

  const { moisture, rover } = telemetry

  // Animate rover
  useEffect(() => {
    let t = 0
    const animate = () => {
      t += 0.4
      const pos = interpolateRoverPosition(t, ROVER_PATH)
      setRoverPos(pos)
      setTrail(prev => {
        const next = [...prev, pos].slice(-18)
        return next
      })
      setScanY(v => {
        const next = v + 1.5
        return next > 460 ? -50 : next
      })
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [scenario])

  const zA = getMoistureColor(moisture.A)
  const zB = getMoistureColor(moisture.B)
  const zC = getMoistureColor(moisture.C)

  const isOffline = rover.status === 'OFFLINE'

  return (
    <div className="relative flex-1 glass rounded-2xl overflow-hidden border border-neon-700/15 min-h-0">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 pt-3 pb-2">
        <div>
          <h3 className="font-display font-semibold text-sm text-neon-100">Campo Inteligente — Cliza, VACbba</h3>
          <p className="font-mono text-xs text-sage-500 mt-0.5">
            {`${telemetry.rover.lat?.toFixed(4)}°S  ${Math.abs(telemetry.rover.lng)?.toFixed(4)}°O`}
            <span className="ml-2 text-neon-600">· TELEMETRÍA EN VIVO</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
            className="w-7 h-7 rounded-lg glass flex items-center justify-center text-sage-400 hover:text-neon-300 transition-colors"
          >
            <ZoomIn size={13} />
          </button>
          <button
            onClick={() => setZoom(z => Math.max(z - 0.2, 0.6))}
            className="w-7 h-7 rounded-lg glass flex items-center justify-center text-sage-400 hover:text-neon-300 transition-colors"
          >
            <ZoomOut size={13} />
          </button>
          <button className="w-7 h-7 rounded-lg glass flex items-center justify-center text-sage-400 hover:text-neon-300 transition-colors">
            <Maximize2 size={13} />
          </button>
        </div>
      </div>

      {/* SVG Map */}
      <svg
        viewBox="0 0 600 450"
        className="w-full h-full"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center', transition: 'transform 0.3s ease' }}
      >
        <defs>
          {/* Grid pattern */}
          <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(34,197,94,0.06)" strokeWidth="0.5" />
          </pattern>
          {/* Glow filter */}
          <filter id="glow-green">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-critical">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          {/* Rover trail gradient */}
          <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(34,197,94,0)" />
            <stop offset="100%" stopColor="rgba(34,197,94,0.8)" />
          </linearGradient>
          {/* Moisture gradients */}
          <radialGradient id="gradA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={zA.fill.replace('0.22', '0.4').replace('0.18', '0.35').replace('0.15', '0.3')} />
            <stop offset="100%" stopColor={zA.fill} />
          </radialGradient>
          <radialGradient id="gradB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={zB.fill.replace('0.22', '0.4').replace('0.18', '0.35').replace('0.15', '0.3')} />
            <stop offset="100%" stopColor={zB.fill} />
          </radialGradient>
          <radialGradient id="gradC" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={zC.fill.replace('0.22', '0.4').replace('0.18', '0.35').replace('0.15', '0.3')} />
            <stop offset="100%" stopColor={zC.fill} />
          </radialGradient>
          <clipPath id="mapClip">
            <rect x="50" y="40" width="500" height="380" rx="8" />
          </clipPath>
        </defs>

        {/* Background */}
        <rect width="600" height="450" fill="rgba(3,13,6,0.95)" />
        <rect x="50" y="40" width="500" height="380" rx="8" fill="rgba(6,18,9,0.9)" />
        <rect x="50" y="40" width="500" height="380" rx="8" fill="url(#grid)" />

        {/* Terrain texture */}
        <ellipse cx="300" cy="230" rx="220" ry="160" fill="rgba(34,197,94,0.03)" />

        {/* ZONE A — Top Left (Parcela Norte) */}
        <g clipPath="url(#mapClip)" onMouseEnter={() => setHoveredZone('A')} onMouseLeave={() => setHoveredZone(null)} style={{ cursor: 'pointer' }}>
          <rect x="65" y="55" width="220" height="160" rx="6" fill={`url(#gradA)`} />
          <rect x="65" y="55" width="220" height="160" rx="6" fill="none" stroke={zA.stroke} strokeWidth="1.5" />
          {/* Field furrows */}
          {[0,1,2,3,4,5,6].map(i => (
            <line key={i} x1="65" y1={75 + i * 22} x2="285" y2={75 + i * 22}
              stroke={zA.stroke} strokeWidth="0.3" strokeDasharray="8,12" opacity="0.4" />
          ))}
          {/* Zone Label */}
          <text x="80" y="76" fontFamily="DM Mono" fontSize="10" fill={zA.stroke} opacity="0.9">ZONA A</text>
          <text x="80" y="90" fontFamily="Outfit" fontSize="8.5" fill="rgba(240,253,244,0.5)">Parcela Norte</text>
          <text x="220" y="76" fontFamily="DM Mono" fontSize="13" fontWeight="bold" fill={zA.stroke} textAnchor="middle">{moisture.A.toFixed(1)}%</text>
          <text x="220" y="90" fontFamily="DM Mono" fontSize="7.5" fill={zA.stroke} opacity="0.8" textAnchor="middle">HUMEDAD</text>
          {/* Status badge */}
          <rect x="198" y="96" width="44" height="14" rx="7" fill={zA.stroke} opacity="0.2" />
          <text x="220" y="107" fontFamily="DM Mono" fontSize="7" fill={zA.stroke} textAnchor="middle" fontWeight="bold">{zA.label}</text>

          {hoveredZone === 'A' && (
            <rect x="65" y="55" width="220" height="160" rx="6" fill="rgba(255,255,255,0.04)" />
          )}
        </g>

        {/* ZONE B — Right (Parcela Central) */}
        <g clipPath="url(#mapClip)" onMouseEnter={() => setHoveredZone('B')} onMouseLeave={() => setHoveredZone(null)} style={{ cursor: 'pointer' }}>
          <rect x="305" y="55" width="230" height="250" rx="6" fill={`url(#gradB)`} />
          <rect x="305" y="55" width="230" height="250" rx="6" fill="none" stroke={zB.stroke} strokeWidth="1.5" />
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <line key={i} x1="305" y1={75 + i * 26} x2="535" y2={75 + i * 26}
              stroke={zB.stroke} strokeWidth="0.3" strokeDasharray="8,12" opacity="0.4" />
          ))}
          <text x="320" y="76" fontFamily="DM Mono" fontSize="10" fill={zB.stroke} opacity="0.9">ZONA B</text>
          <text x="320" y="90" fontFamily="Outfit" fontSize="8.5" fill="rgba(240,253,244,0.5)">Parcela Central</text>
          <text x="420" y="76" fontFamily="DM Mono" fontSize="13" fontWeight="bold" fill={zB.stroke} textAnchor="middle">{moisture.B.toFixed(1)}%</text>
          <text x="420" y="90" fontFamily="DM Mono" fontSize="7.5" fill={zB.stroke} opacity="0.8" textAnchor="middle">HUMEDAD</text>
          <rect x="398" y="96" width="44" height="14" rx="7" fill={zB.stroke} opacity="0.2" />
          <text x="420" y="107" fontFamily="DM Mono" fontSize="7" fill={zB.stroke} textAnchor="middle" fontWeight="bold">{zB.label}</text>
          {hoveredZone === 'B' && (
            <rect x="305" y="55" width="230" height="250" rx="6" fill="rgba(255,255,255,0.04)" />
          )}
        </g>

        {/* ZONE C — Bottom Left (Parcela Sur) */}
        <g clipPath="url(#mapClip)" onMouseEnter={() => setHoveredZone('C')} onMouseLeave={() => setHoveredZone(null)} style={{ cursor: 'pointer' }}>
          <rect x="65" y="235" width="220" height="170" rx="6" fill={`url(#gradC)`} />
          <rect x="65" y="235" width="220" height="170" rx="6" fill="none" stroke={zC.stroke} strokeWidth="1.5" />
          {[0,1,2,3,4,5,6].map(i => (
            <line key={i} x1="65" y1={252 + i * 22} x2="285" y2={252 + i * 22}
              stroke={zC.stroke} strokeWidth="0.3" strokeDasharray="8,12" opacity="0.4" />
          ))}
          <text x="80" y="255" fontFamily="DM Mono" fontSize="10" fill={zC.stroke} opacity="0.9">ZONA C</text>
          <text x="80" y="269" fontFamily="Outfit" fontSize="8.5" fill="rgba(240,253,244,0.5)">Parcela Sur</text>
          <text x="220" y="255" fontFamily="DM Mono" fontSize="13" fontWeight="bold" fill={zC.stroke} textAnchor="middle">{moisture.C.toFixed(1)}%</text>
          <text x="220" y="269" fontFamily="DM Mono" fontSize="7.5" fill={zC.stroke} opacity="0.8" textAnchor="middle">HUMEDAD</text>
          <rect x="198" y="275" width="44" height="14" rx="7" fill={zC.stroke} opacity="0.2" />
          <text x="220" y="286" fontFamily="DM Mono" fontSize="7" fill={zC.stroke} textAnchor="middle" fontWeight="bold">{zC.label}</text>
          {hoveredZone === 'C' && (
            <rect x="65" y="235" width="220" height="170" rx="6" fill="rgba(255,255,255,0.04)" />
          )}
        </g>

        {/* Scan line effect */}
        <g clipPath="url(#mapClip)">
          <line x1="50" y1={scanY} x2="550" y2={scanY}
            stroke="rgba(34,197,94,0.25)" strokeWidth="1" />
          <rect x="50" y={scanY - 20} width="500" height="20"
            fill="url(#scanGrad)" opacity="0.08" />
        </g>

        {/* Sensor nodes */}
        {SENSOR_NODES.map((node, i) => {
          const zoneColor = node.zone === 'A' ? zA : node.zone === 'B' ? zB : zC
          return (
            <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
              <circle r="10" fill="rgba(3,13,6,0.9)" stroke={zoneColor.stroke} strokeWidth="1" />
              <circle r="4" fill={zoneColor.stroke} opacity="0.9" />
              {/* Pulse */}
              <circle r="10" fill="none" stroke={zoneColor.stroke} strokeWidth="0.8" opacity="0">
                <animate attributeName="r" values="6;18;6" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0;0.8" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              </circle>
              <text x="0" y="20" fontFamily="DM Mono" fontSize="7" fill={zoneColor.stroke} textAnchor="middle" opacity="0.8">{node.label}</text>
            </g>
          )
        })}

        {/* Rover trail */}
        {!isOffline && trail.length > 1 && trail.map((pt, i) => i > 0 && (
          <line key={i}
            x1={trail[i-1].x} y1={trail[i-1].y}
            x2={pt.x} y2={pt.y}
            stroke="rgba(34,197,94,0.8)"
            strokeWidth={0.5 + (i / trail.length) * 1.5}
            opacity={i / trail.length * 0.7}
          />
        ))}

        {/* Rover path preview */}
        <polyline
          points={ROVER_PATH.map(p => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke="rgba(34,197,94,0.12)"
          strokeWidth="1"
          strokeDasharray="4,8"
        />

        {/* Rover */}
        {!isOffline ? (
          <g transform={`translate(${roverPos.x}, ${roverPos.y})`} filter="url(#glow-green)">
            {/* Ping rings */}
            <circle r="16" fill="none" stroke="rgba(34,197,94,0.4)" strokeWidth="1">
              <animate attributeName="r" values="8;22;8" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle r="8" fill="none" stroke="rgba(34,197,94,0.6)" strokeWidth="0.8">
              <animate attributeName="r" values="6;14;6" dur="2s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            {/* Body */}
            <rect x="-9" y="-7" width="18" height="14" rx="3" fill="rgba(34,197,94,0.25)" stroke="rgba(34,197,94,0.9)" strokeWidth="1.5" />
            {/* Antenna */}
            <line x1="0" y1="-7" x2="0" y2="-13" stroke="rgba(34,197,94,0.8)" strokeWidth="1" />
            <circle cx="0" cy="-14" r="2" fill="rgba(34,197,94,1)" />
            {/* Wheels */}
            <rect x="-11" y="-4" width="4" height="8" rx="2" fill="rgba(34,197,94,0.5)" />
            <rect x="7" y="-4" width="4" height="8" rx="2" fill="rgba(34,197,94,0.5)" />
            {/* Label */}
            <text x="0" y="20" fontFamily="DM Mono" fontSize="7" fill="rgba(34,197,94,0.9)" textAnchor="middle" fontWeight="bold">ROVER-01</text>
          </g>
        ) : (
          <g transform={`translate(${roverPos.x}, ${roverPos.y})`}>
            <rect x="-9" y="-7" width="18" height="14" rx="3" fill="rgba(239,68,68,0.15)" stroke="rgba(239,68,68,0.6)" strokeWidth="1.5" strokeDasharray="3,2" />
            <text x="0" y="20" fontFamily="DM Mono" fontSize="7" fill="rgba(239,68,68,0.9)" textAnchor="middle">OFFLINE</text>
          </g>
        )}

        {/* Map border */}
        <rect x="50" y="40" width="500" height="380" rx="8" fill="none" stroke="rgba(34,197,94,0.15)" strokeWidth="1" />

        {/* Compass */}
        <g transform="translate(530, 70)">
          <circle r="14" fill="rgba(3,13,6,0.8)" stroke="rgba(34,197,94,0.25)" strokeWidth="1" />
          <text x="0" y="-5" fontFamily="DM Mono" fontSize="8" fill="rgba(34,197,94,0.9)" textAnchor="middle">N</text>
          <line x1="0" y1="-10" x2="0" y2="10" stroke="rgba(34,197,94,0.3)" strokeWidth="0.5" />
          <line x1="-10" y1="0" x2="10" y2="0" stroke="rgba(34,197,94,0.3)" strokeWidth="0.5" />
        </g>

        {/* Scale bar */}
        <g transform="translate(65, 418)">
          <line x1="0" y1="0" x2="80" y2="0" stroke="rgba(134,239,172,0.5)" strokeWidth="1" />
          <line x1="0" y1="-3" x2="0" y2="3" stroke="rgba(134,239,172,0.5)" strokeWidth="1" />
          <line x1="80" y1="-3" x2="80" y2="3" stroke="rgba(134,239,172,0.5)" strokeWidth="1" />
          <text x="40" y="-5" fontFamily="DM Mono" fontSize="7" fill="rgba(134,239,172,0.6)" textAnchor="middle">200m</text>
        </g>
      </svg>

      {/* Floating telemetry widget */}
      <div className="absolute bottom-3 right-3 glass rounded-xl p-3 border border-neon-700/20 min-w-[140px]">
        <div className="flex items-center gap-1.5 mb-2">
          <Navigation size={10} className="text-neon-400" />
          <span className="font-mono text-[10px] text-neon-400 font-semibold">ROVER TELEMETRÍA</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between gap-4">
            <span className="font-mono text-[9px] text-sage-500">Velocidad</span>
            <span className="font-mono text-[10px] text-neon-300">{isOffline ? '—' : `${telemetry.rover.speed?.toFixed(1)} m/s`}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-mono text-[9px] text-sage-500">Señal</span>
            <span className={`font-mono text-[10px] ${telemetry.rover.signal < 40 ? 'text-critical' : 'text-neon-300'}`}>
              {telemetry.rover.signal}%
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-mono text-[9px] text-sage-500">Latencia</span>
            <span className={`font-mono text-[10px] ${telemetry.rover.syncLatency > 1000 ? 'text-warning' : 'text-neon-300'}`}>
              {telemetry.rover.syncLatency}ms
            </span>
          </div>
        </div>
      </div>

      {/* Hover zone tooltip */}
      {hoveredZone && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-16 left-1/2 -translate-x-1/2 glass rounded-lg px-3 py-2 border border-neon-500/30 pointer-events-none"
        >
          <span className="font-mono text-xs text-neon-300">
            Zona {hoveredZone} · {hoveredZone === 'A' ? moisture.A : hoveredZone === 'B' ? moisture.B : moisture.C}% humedad
          </span>
        </motion.div>
      )}
    </div>
  )
}
