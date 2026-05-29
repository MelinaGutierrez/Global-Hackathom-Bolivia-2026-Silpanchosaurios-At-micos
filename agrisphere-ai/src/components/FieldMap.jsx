import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Droplets, ZoomIn, ZoomOut } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════
   PARCELAS DE CULTIVO — Sembradíos de Cliza (polígonos reales)
   Cada parcela es un polígono SVG irregular, similar a lotes reales
═══════════════════════════════════════════════════════════ */

// Parcelas Zona A — Parcela Norte (verde oscuro, maíz)
const FIELDS_A = [
  { id:'A1', pts:'82,48  195,38  200,138 80,148',    cx:140, cy:93  },
  { id:'A2', pts:'195,38 318,28  325,130 200,138',   cx:260, cy:83  },
  { id:'A3', pts:'318,28 435,22  442,122 325,130',   cx:378, cy:72  },
  { id:'A4', pts:'80,148 200,138 205,235 75,245',    cx:140, cy:191 },
  { id:'A5', pts:'200,138 325,130 330,225 205,235',  cx:265, cy:182 },
]

// Parcelas Zona B — Parcela Central (verde medio, papa)
const FIELDS_B = [
  { id:'B1', pts:'325,130 442,122 450,218 330,225',  cx:388, cy:173 },
  { id:'B2', pts:'442,122 558,115 566,210 450,218',  cx:503, cy:165 },
  { id:'B3', pts:'75,245 205,235 210,328 70,338',    cx:140, cy:290 },
  { id:'B4', pts:'205,235 330,225 336,320 210,328',  cx:268, cy:280 },
  { id:'B5', pts:'330,225 450,218 456,312 336,320',  cx:393, cy:268 },
]

// Parcelas Zona C — Parcela Sur (cerca del Río Cliza, hortalizas)
const FIELDS_C = [
  { id:'C1', pts:'70,338 210,328 215,418 65,428',   cx:140, cy:378 },
  { id:'C2', pts:'210,328 336,320 342,412 215,418', cx:278, cy:368 },
  { id:'C3', pts:'336,320 456,312 462,402 342,412', cx:398, cy:358 },
  { id:'C4', pts:'450,218 566,210 572,305 456,312', cx:512, cy:258 },
]

const ALL_FIELDS = [
  ...FIELDS_A.map(f => ({...f, zone:'A'})),
  ...FIELDS_B.map(f => ({...f, zone:'B'})),
  ...FIELDS_C.map(f => ({...f, zone:'C'})),
]

const ROVER_SEQ = ALL_FIELDS.map(f => f.id)

/* ─── Full-color moisture config ────────────────────────── */
function mCfg(pct) {
  if (pct < 25) return { fill:'#7f1d1d', stroke:'#ef4444', pin:'#dc2626', label:'Critical',  icon:'⚠',  action:'Irrigate NOW',   text:'#fef2f2' }
  if (pct < 40) return { fill:'#78350f', stroke:'#f59e0b', pin:'#d97706', label:'Dry',       icon:'💧', action:'Irrigate Soon',  text:'#fffbeb' }
  if (pct < 70) return { fill:'#14532d', stroke:'#22c55e', pin:'#16a34a', label:'Optimal',   icon:'✓',  action:'No Action',      text:'#f0fdf4' }
  if (pct < 85) return { fill:'#1e3a8a', stroke:'#60a5fa', pin:'#2563eb', label:'Wet',       icon:'~',  action:'Monitor',        text:'#eff6ff' }
  return             { fill:'#3b0764', stroke:'#c084fc', pin:'#7c3aed', label:'Saturated', icon:'⛔', action:'Stop Irrigation', text:'#faf5ff' }
}

/* ─── Background terrain polygons (simula vista aérea) ──── */
const TERRAIN = [
  // Campos de fondo — variedad de verdes como en foto aérea
  { pts:'0,0 820,0 820,520 0,520',        fill:'#4a7c3f' },   // base verde
  { pts:'0,0 270,0 265,180 0,185',        fill:'#3d6b35' },
  { pts:'270,0 500,0 495,175 265,180',    fill:'#5a8c48' },
  { pts:'500,0 700,0 695,160 495,175',    fill:'#436e38' },
  { pts:'700,0 820,0 820,200 695,160',    fill:'#6b9a55' },
  { pts:'0,185 265,180 260,360 0,365',    fill:'#3a6232' },
  { pts:'265,180 495,175 490,350 260,360',fill:'#508840' },
  { pts:'495,175 695,160 690,340 490,350',fill:'#4a7a3c' },
  { pts:'695,160 820,200 820,380 690,340',fill:'#5c9248' },
  { pts:'0,365 260,360 255,520 0,520',    fill:'#3c6533' },
  { pts:'260,360 490,350 485,520 255,520',fill:'#477840' },
  { pts:'490,350 690,340 686,520 485,520',fill:'#52834a' },
  { pts:'690,340 820,380 820,520 686,520',fill:'#5e9452' },
  // Variaciones más oscuras (setos/bordes de campo)
  { pts:'558,115 680,108 688,145 566,150',fill:'#2d5428' },
  { pts:'0,248 70,245 68,340 0,345',      fill:'#2a4e25' },
  { pts:'566,210 680,200 686,308 572,318',fill:'#355c2e' },
  { pts:'680,108 820,100 820,220 688,210',fill:'#3e6a36' },
  { pts:'680,200 820,220 820,380 686,365',fill:'#456e3c' },
  { pts:'686,365 820,380 820,520 686,520',fill:'#3a6032' },
  // Parche marrón — terreno sin cultivo
  { pts:'600,300 720,290 725,410 595,415',fill:'#8c7a52' },
  { pts:'620,100 760,92  765,140 622,148',fill:'#7a6b44' },
]

// Caminos (bordean los campos)
const ROADS = [
  { pts:'0,440 820,420',   w:5, color:'#2c2c2c' },
  { pts:'0,442 820,422',   w:2, color:'#555' },
  { pts:'460,0 455,520',   w:4, color:'#2c2c2c' },
  { pts:'462,0 457,520',   w:1.5, color:'#666' },
  { pts:'0,250 820,238',   w:3, color:'#3a3a2a', dash:'6,4' },
]

// Setos / líneas de árboles entre campos
const HEDGES = [
  { pts:'0,180 820,168',   w:6,  color:'#1a3d18' },
  { pts:'0,340 820,328',   w:5,  color:'#1e4518' },
  { pts:'195,0 192,340',   w:4,  color:'#1a3d18' },
  { pts:'325,0 320,340',   w:4,  color:'#1e4518' },
  { pts:'442,0 438,240',   w:4,  color:'#1a3d18' },
  { pts:'558,0 552,320',   w:3.5,color:'#1e4518' },
]

// Río Cliza
const RIVER_PTS = '0,480 80,472 180,468 300,458 400,455 500,460 600,452 700,448 820,445'
const RIVER_PTS2 = '0,478 80,470 180,466 300,456 400,453 500,458 600,450 700,446 820,443'

/* ─── Cell popup ────────────────────────────────────────── */
function FieldPopup({ field, zone, pct, onClose }) {
  const cfg   = mCfg(pct)
  const names = { A:'North Plot', B:'Central Plot', C:'South Plot' }
  const INK   = '#0f172a'
  const GREEN = '#16a34a'
  const ink   = (o) => `rgba(15,23,42,${o})`
  const isLow = pct < 40
  const ac    = isLow ? INK : GREEN

  return (
    <motion.div
      initial={{ opacity:0, y:-8, scale:0.96 }}
      animate={{ opacity:1, y:0, scale:1 }}
      exit={{ opacity:0, y:-4, scale:0.97 }}
      className="absolute top-14 left-1/2 -translate-x-1/2 z-30 overflow-hidden pointer-events-auto"
      style={{ width:272, background:'#fff', borderRadius:14,
        border:`1px solid ${ink(0.10)}`, boxShadow:'0 8px 28px rgba(0,0,0,0.10)' }}
    >
      <div className="px-4 py-3 flex items-center justify-between"
        style={{ borderBottom:`1px solid ${ink(0.07)}`, background:isLow ? ink(0.03) : 'rgba(22,163,74,0.05)' }}>
        <div>
          <div style={{ fontFamily:'Outfit', fontSize:13, fontWeight:700, color:ac }}>
            {field} · Zone {zone}
          </div>
          <div style={{ fontFamily:'Outfit', fontSize:10, color:ink(0.45) }}>{names[zone]}</div>
        </div>
        <button onClick={onClose} className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background:ink(0.05), border:`1px solid ${ink(0.08)}` }}>
          <X size={10} style={{ color:ink(0.50) }}/>
        </button>
      </div>
      <div className="px-4 py-3" style={{ display:'flex', flexDirection:'column', gap:10 }}>
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span style={{ fontFamily:'Outfit', fontSize:10, color:ink(0.45) }}>Soil Moisture</span>
            <span style={{ fontFamily:'Outfit', fontSize:22, fontWeight:700, color:ac }}>{pct.toFixed(1)}%</span>
          </div>
          <div className="rounded-full overflow-hidden" style={{ height:6, background:ink(0.07) }}>
            <motion.div className="h-full rounded-full" style={{ background:ac }}
              animate={{ width:`${pct}%` }} transition={{ duration:0.6 }}/>
          </div>
        </div>
        <div className="rounded-xl px-3 py-2.5 flex items-center gap-3"
          style={{ background: isLow ? ink(0.04) : 'rgba(22,163,74,0.06)',
            border:`1px solid ${isLow ? ink(0.10) : 'rgba(22,163,74,0.18)'}` }}>
          <div style={{ fontFamily:'Outfit', fontSize:18 }}>{cfg.icon}</div>
          <div>
            <div style={{ fontFamily:'Outfit', fontSize:14, fontWeight:700, color:ac }}>{cfg.action}</div>
            <div style={{ fontFamily:'Outfit', fontSize:10, color:ink(0.45) }}>
              {cfg.label} — {pct.toFixed(0)}% root moisture
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label:'Conductivity', value:`${(0.3+pct*0.005).toFixed(2)} dS/m` },
            { label:'Soil Temp.',   value:`${(18+pct*0.14).toFixed(1)}°C` },
            { label:'Water Pot.',   value:`${(-10-(100-pct)*0.8).toFixed(0)} kPa` },
            { label:'Plot ID',      value:field },
          ].map(r => (
            <div key={r.label} className="rounded-lg px-2.5 py-2"
              style={{ background:ink(0.03), border:`1px solid ${ink(0.06)}` }}>
              <div style={{ fontFamily:'Outfit', fontSize:9, color:ink(0.38), textTransform:'uppercase', letterSpacing:'0.05em' }}>{r.label}</div>
              <div style={{ fontFamily:'Outfit', fontSize:11, fontWeight:700, color:INK }}>{r.value}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════ */
export default function FieldMap({ telemetry, tick }) {
  const { moisture, rover } = telemetry
  const isOffline = rover.status === 'OFFLINE'

  const fieldIdx   = tick % ROVER_SEQ.length
  const roverField = ALL_FIELDS[fieldIdx]
  const roverZone  = roverField?.zone || 'B'
  const roverPct   = moisture[roverZone]

  // Expose telemetry
  telemetry.rover._cell = [fieldIdx % 8, Math.floor(fieldIdx / 8)]
  telemetry.rover._zone = roverZone
  telemetry.rover._utmX = Math.round(182000 + (roverField?.cx || 300) / 820 * 15000)
  telemetry.rover._utmY = Math.round(8049000 + (520 - (roverField?.cy || 250)) / 520 * 9500)

  const [visited, setVisited] = useState(new Set([roverField?.id]))
  useEffect(() => {
    if (roverField?.id) setVisited(prev => new Set([...prev, roverField.id]))
  }, [roverField?.id])

  const [zoom, setZoom]   = useState(1)
  const [popup, setPopup] = useState(null)

  const roverCfg = mCfg(roverPct)

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl border border-gray-200"
      style={{ boxShadow:'0 4px 20px rgba(0,0,0,0.10)', background:'#4a7c3f' }}>

      {/* Controls */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
        <button onClick={() => setZoom(z => Math.min(z+0.3, 2.2))}
          className="w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800">
          <ZoomIn size={14}/>
        </button>
        <button onClick={() => setZoom(z => Math.max(z-0.3, 0.6))}
          className="w-8 h-8 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-800">
          <ZoomOut size={14}/>
        </button>
      </div>

      {/* Badge */}
      <div className="absolute top-3 left-3 z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
          style={{ background:'rgba(255,255,255,0.92)', border:'1px solid rgba(15,23,42,0.10)',
            boxShadow:'0 2px 8px rgba(0,0,0,0.08)', backdropFilter:'blur(4px)' }}>
          <div className="w-2 h-2 rounded-full" style={{ background:'#16a34a', animation:'pulse 1.5s infinite' }}/>
          <span style={{ fontFamily:'Outfit', fontSize:11, fontWeight:700, color:'#0f172a' }}>HydroSphere · Cliza</span>
          <span style={{ fontFamily:'Outfit', fontSize:9, color:'rgba(15,23,42,0.40)', marginLeft:2 }}>14 active plots</span>
        </div>
      </div>

      {/* Popup */}
      <AnimatePresence>
        {popup && <FieldPopup {...popup} onClose={() => setPopup(null)}/>}
      </AnimatePresence>

      <svg viewBox="55 12 530 440" className="w-full h-full"
        style={{ transform:`scale(${zoom})`, transformOrigin:'center', transition:'transform 0.3s ease' }}>

        <defs>
          {/* Grain texture for satellite feel */}
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch" result="noise"/>
            <feColorMatrix type="saturate" values="0" in="noise" result="grayNoise"/>
            <feBlend in="SourceGraphic" in2="grayNoise" mode="multiply" result="blend"/>
            <feComposite in="blend" in2="SourceGraphic" operator="in"/>
          </filter>
          <filter id="shadow-pin">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.4"/>
          </filter>
          <filter id="glow-rover">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Crop row patterns per zone */}
          <pattern id="rowsA" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="none"/>
            <line x1="0" y1="5" x2="10" y2="5" stroke="rgba(0,0,0,0.15)" strokeWidth="1"/>
          </pattern>
          <pattern id="rowsB" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
            <rect width="10" height="10" fill="none"/>
            <line x1="0" y1="5" x2="10" y2="5" stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
          </pattern>
          <pattern id="rowsC" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <rect width="10" height="10" fill="none"/>
            <line x1="0" y1="5" x2="10" y2="5" stroke="rgba(0,0,0,0.12)" strokeWidth="1"/>
          </pattern>
        </defs>

        {/* ── 1. Terrain background (vista aérea simulada) ── */}
        {TERRAIN.map((t, i) => (
          <polygon key={i} points={t.pts} fill={t.fill}/>
        ))}

        {/* Grain overlay for satellite feel */}
        <rect width="820" height="520" fill="rgba(0,0,0,0.06)" style={{ filter:'url(#grain)' }}/>

        {/* ── 2. Hedgerows / tree lines ── */}
        {HEDGES.map((h, i) => (
          <polyline key={i} points={h.pts}
            fill="none" stroke={h.color} strokeWidth={h.w} strokeLinecap="round"/>
        ))}

        {/* ── 3. Roads ── */}
        {ROADS.map((r, i) => (
          <polyline key={i} points={r.pts} fill="none"
            stroke={r.color} strokeWidth={r.w}
            strokeDasharray={r.dash || ''} strokeLinecap="round"/>
        ))}

        {/* ── 4. Río Cliza ── */}
        <polyline points={RIVER_PTS}  fill="none" stroke="#1d4ed8" strokeWidth="6" strokeLinecap="round" opacity="0.8"/>
        <polyline points={RIVER_PTS2} fill="none" stroke="#93c5fd" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
        <text x="300" y="445" fontSize="8" fontFamily="Outfit" fill="#93c5fd" fontWeight="600" opacity="0.9"
          transform="rotate(-2,300,445)">Cliza River</text>

        {/* ── 5. Monitored field polygons ── */}
        {ALL_FIELDS.map(f => {
          const pct      = moisture[f.zone]
          const cfg      = mCfg(pct)
          const isRover  = !isOffline && f.id === roverField?.id
          const wasSeen  = visited.has(f.id)
          const rowPat   = f.zone === 'A' ? 'rowsA' : f.zone === 'B' ? 'rowsB' : 'rowsC'

          return (
            <g key={f.id} style={{ cursor:'pointer' }}
              onClick={() => setPopup({ field:f.id, zone:f.zone, pct })}>

              {/* Field fill — moisture color */}
              <polygon points={f.pts}
                fill={cfg.fill}
                opacity={isRover ? 0.82 : wasSeen ? 0.70 : 0.58}
              />
              {/* Crop row texture */}
              <polygon points={f.pts}
                fill={`url(#${rowPat})`}
                opacity="0.6"
              />
              {/* White outline border — like reference image */}
              <polygon points={f.pts}
                fill="none"
                stroke={isRover ? '#ffffff' : 'rgba(255,255,255,0.75)'}
                strokeWidth={isRover ? 2.5 : 1.8}
                strokeLinejoin="round"
              />
              {/* Rover scan pulse */}
              {isRover && (
                <polygon points={f.pts} fill="none"
                  stroke="rgba(255,255,255,0.5)" strokeWidth="5">
                  <animate attributeName="stroke-opacity" values="0.5;0;0.5" dur="2s" repeatCount="indefinite"/>
                  <animate attributeName="stroke-width" values="4;10;4" dur="2s" repeatCount="indefinite"/>
                </polygon>
              )}
            </g>
          )
        })}

        {/* ── 6. Status pins (like the reference image) ── */}
        {ALL_FIELDS.map(f => {
          const pct     = moisture[f.zone]
          const cfg     = mCfg(pct)
          const isRover = !isOffline && f.id === roverField?.id
          const wasSeen = visited.has(f.id)
          if (!wasSeen && !isRover) return null  // only show visited + current

          return (
            <g key={f.id + '-pin'} transform={`translate(${f.cx},${f.cy})`}
              filter="url(#shadow-pin)" style={{ cursor:'pointer' }}
              onClick={() => setPopup({ field:f.id, zone:f.zone, pct })}>

              {/* Pin circle — same visual language as reference */}
              <circle r={isRover ? 18 : 13}
                fill={cfg.pin}
                stroke="white"
                strokeWidth={isRover ? 3 : 2}
              />
              {/* Rover ring pulse */}
              {isRover && (
                <circle r="26" fill="none" stroke={cfg.pin} strokeWidth="1.5" opacity="0">
                  <animate attributeName="r"       values="18;30;18" dur="1.8s" repeatCount="indefinite"/>
                  <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite"/>
                </circle>
              )}
              {/* Icon / % */}
              {isRover ? (
                <>
                  <text y="-3" fontSize="10" textAnchor="middle">{cfg.icon}</text>
                  <text y="9" fontSize="8" fontFamily="Outfit" fill="white"
                    textAnchor="middle" fontWeight="700">{pct.toFixed(0)}%</text>
                </>
              ) : (
                <text y="4.5" fontSize="9" fontFamily="Outfit" fill="white"
                  textAnchor="middle" fontWeight="700">{pct.toFixed(0)}%</text>
              )}

              {/* 💧 Water-drop badge — shown on dry/critical fields */}
              {pct < 40 && !isRover && (
                <g transform="translate(10,-10)">
                  <circle r="7.5" fill={pct < 25 ? '#dc2626' : '#d97706'} stroke="white" strokeWidth="1.8"/>
                  <path d="M0,-4.5 C-2.8,-1.2 -4,1.2 -4,2.8 A4,4 0 0,0 4,2.8 C4,1.2 2.8,-1.2 0,-4.5Z"
                    fill="white" opacity="0.95"/>
                  <animateTransform attributeName="transform" type="scale"
                    values="1;1.15;1" dur="1.8s" repeatCount="indefinite" additive="sum"/>
                </g>
              )}
            </g>
          )
        })}

        {/* ── 7. Rover AGRS-01 (yellow-green dome, blue trim, sensor mast) ── */}
        {!isOffline && roverField && (
          <g transform={`translate(${roverField.cx},${roverField.cy - 46})`}
            filter="url(#glow-rover)">

            {/* Ground shadow */}
            <ellipse cx="0" cy="16" rx="19" ry="5" fill="rgba(0,0,0,0.38)"/>

            {/* ── WHEELS (4 large knobby) ── */}
            <ellipse cx="-16" cy="9"  rx="6.5" ry="7.5" fill="#1a1a1a"/>
            <ellipse cx="-16" cy="9"  rx="4.5" ry="5.5" fill="#2e2e2e"/>
            <circle  cx="-16" cy="9"  r="1.5"            fill="#555"/>
            <ellipse cx="16"  cy="9"  rx="6.5" ry="7.5" fill="#1a1a1a"/>
            <ellipse cx="16"  cy="9"  rx="4.5" ry="5.5" fill="#2e2e2e"/>
            <circle  cx="16"  cy="9"  r="1.5"            fill="#555"/>
            <ellipse cx="-15" cy="10" rx="5.5" ry="6.5" fill="#1a1a1a"/>
            <ellipse cx="15"  cy="10" rx="5.5" ry="6.5" fill="#1a1a1a"/>
            {/* Wheel tread marks */}
            {[-3,-1,1,3].map(d => (
              <g key={d}>
                <line x1={-16+d} y1="3"  x2={-16+d} y2="15" stroke="#111" strokeWidth="0.7"/>
                <line x1={ 16+d} y1="3"  x2={ 16+d} y2="15" stroke="#111" strokeWidth="0.7"/>
              </g>
            ))}

            {/* ── LEG ARMS (dark metal, angled) ── */}
            <line x1="-9" y1="1"  x2="-16" y2="9"  stroke="#2a2a2a" strokeWidth="3"   strokeLinecap="round"/>
            <line x1="9"  y1="1"  x2="16"  y2="9"  stroke="#2a2a2a" strokeWidth="3"   strokeLinecap="round"/>
            <line x1="-8" y1="2"  x2="-15" y2="10" stroke="#444"    strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8"  y1="2"  x2="15"  y2="10" stroke="#444"    strokeWidth="1.5" strokeLinecap="round"/>

            {/* ── CHASSIS BASE ── */}
            <rect x="-12" y="-5" width="24" height="11" rx="2.5" fill="#212121"/>
            <rect x="-10" y="-3" width="20" height="7"  rx="1.5" fill="#2d2d2d"/>

            {/* ── BLUE TRIM RING (lower collar) ── */}
            <ellipse cx="0" cy="-1" rx="12" ry="4.5" fill="none" stroke="#1565c0" strokeWidth="3"/>
            <ellipse cx="0" cy="-1" rx="12" ry="4.5" fill="none" stroke="#64b5f6" strokeWidth="1"/>

            {/* ── DOME BODY (yellow-green, like reference image) ── */}
            <ellipse cx="0" cy="-10" rx="12"  ry="10"   fill="#7cb342"/>
            <ellipse cx="0" cy="-11" rx="10.5" ry="8.5" fill="#c6e040"/>
            {/* Blue accent wedges on dome */}
            <path d="M-12,-8 C-10,-14 -5,-17 0,-17 L0,-10 Z"   fill="#1565c0" opacity="0.75"/>
            <path d="M12,-8  C10,-14  5,-17 0,-17 L0,-10 Z"    fill="#1565c0" opacity="0.75"/>
            {/* Dome sheen */}
            <ellipse cx="-3" cy="-14" rx="4" ry="3" fill="rgba(255,255,255,0.25)"/>
            {/* Center logo dot */}
            <circle cx="0" cy="-11" r="2.5" fill="white" opacity="0.6"/>

            {/* ── SOLAR PANEL (small tilted, attached to mast) ── */}
            <g transform="translate(5,-20) rotate(-25)">
              <rect x="-7" y="-3" width="14" height="6" rx="0.8" fill="#0d47a1"/>
              <rect x="-7" y="-3" width="14" height="6" rx="0.8" fill="none" stroke="#42a5f5" strokeWidth="0.6"/>
              {[-3.5,0,3.5].map(x => (
                <line key={x} x1={x} y1="-3" x2={x} y2="3" stroke="#0a3880" strokeWidth="0.5"/>
              ))}
              <line x1="-7" y1="0" x2="7" y2="0" stroke="#0a3880" strokeWidth="0.5"/>
              {/* Panel arm */}
              <line x1="0" y1="-3" x2="0" y2="-6" stroke="#666" strokeWidth="1.2"/>
            </g>

            {/* ── SENSOR MAST (silver tube, tall) ── */}
            <rect x="-1.5" y="-37" width="3" height="20" rx="1.5" fill="#9e9e9e"/>
            <rect x="-0.5" y="-37" width="1" height="20"          fill="#e0e0e0" opacity="0.8"/>
            {/* Blue sensor modules on mast */}
            {[-34,-28,-22].map(y => (
              <g key={y}>
                <rect x="-4" y={y} width="8" height="5" rx="1.5" fill="#1565c0"/>
                <rect x="-4" y={y} width="8" height="5" rx="1.5" fill="#42a5f5" opacity="0.45"/>
                <rect x="-3" y={y+1} width="2" height="3" rx="0.5" fill="#90caf9" opacity="0.8"/>
              </g>
            ))}
            {/* Camera/sensor head at top */}
            <circle cy="-39" r="4.5" fill="#546e7a"/>
            <circle cy="-39" r="3"   fill="#37474f"/>
            <circle cy="-39" r="1.5" fill="#b0bec5">
              <animate attributeName="opacity" values="1;0.2;1" dur="0.85s" repeatCount="indefinite"/>
            </circle>
            <rect x="-4.5" y="-45" width="9" height="4" rx="1" fill="#455a64"/>

            {/* ── LABEL TAG ── */}
            <rect x="-23" y="-56" width="46" height="14" rx="7" fill="white" opacity="0.97"/>
            <text x="0" y="-45.5" fontSize="7" fontFamily="Outfit"
              fill="#111827" textAnchor="middle" fontWeight="700">HR-01</text>
          </g>
        )}

        {/* OFFLINE state */}
        {isOffline && roverField && (
          <g transform={`translate(${roverField.cx},${roverField.cy})`}>
            <circle r="16" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,2"/>
            <text y="5" fontSize="12" textAnchor="middle">⚠️</text>
            <rect x="-18" y="-30" width="36" height="13" rx="6" fill="white" opacity="0.95"/>
            <text y="-20" fontSize="7" fontFamily="Outfit" fill="#ef4444" textAnchor="middle" fontWeight="700">OFFLINE</text>
          </g>
        )}

        {/* ── 8. Zone labels ── */}
        {[
          { zone:'A', x:140, y:22  },
          { zone:'B', x:140, y:222 },
          { zone:'C', x:140, y:318 },
        ].map(z => {
          const pct = moisture[z.zone]
          const cfg = mCfg(pct)
          return (
            <g key={z.zone}>
              <rect x={z.x-22} y={z.y-9} width={44} height={18} rx={9}
                fill="rgba(255,255,255,0.92)" stroke={cfg.pin} strokeWidth="1.2"/>
              <text x={z.x} y={z.y+5} fontSize="8.5" fontFamily="Outfit"
                fill={cfg.pin} textAnchor="middle" fontWeight="700">
                ZONE {z.zone}
              </text>
            </g>
          )
        })}

        {/* ── 9. CLIZA town label ── */}
        <g transform="translate(600,290)">
          <rect x="-24" y="-10" width="48" height="20" rx="4"
            fill="rgba(255,255,255,0.92)" stroke="#d1d5db" strokeWidth="0.8"/>
          <text x="0" y="5" fontSize="9" fontFamily="Outfit"
            fill="#111827" textAnchor="middle" fontWeight="700">CLIZA</text>
        </g>

        {/* ── 10. Compass ── */}
        <g transform="translate(790,56)">
          <circle r="18" fill="rgba(255,255,255,0.92)" stroke="#e5e7eb" strokeWidth="1"/>
          <text x="0" y="-3"  fontSize="7.5" fontFamily="Outfit" fill="#111827" textAnchor="middle" fontWeight="700">N</text>
          <text x="0" y="12"  fontSize="6"   fontFamily="Outfit" fill="#6b7280" textAnchor="middle">S</text>
          <text x="-11" y="4" fontSize="6"   fontFamily="Outfit" fill="#6b7280" textAnchor="middle">O</text>
          <text x="11"  y="4" fontSize="6"   fontFamily="Outfit" fill="#6b7280" textAnchor="middle">E</text>
          <polygon points="0,-14 -2,-4 0,-8 2,-4" fill="#374151"/>
        </g>

        {/* ── 11. Legend ── */}
        <g transform="translate(8,340)">
          <rect x="0" y="0" width="112" height="114" rx="7"
            fill="rgba(255,255,255,0.92)" stroke="#e5e7eb" strokeWidth="0.8"/>
          <text x="8" y="14" fontSize="7" fontFamily="Outfit" fill="#0f172a" fontWeight="700">MOISTURE LEVEL</text>
          {[
            { pct:18, label:'Critical  (<25%)' },
            { pct:33, label:'Dry       (25-40%)' },
            { pct:55, label:'Optimal   (40-70%)' },
            { pct:77, label:'Wet       (70-85%)' },
            { pct:90, label:'Saturated (>85%)' },
          ].map((l, i) => {
            const c = mCfg(l.pct)
            return (
              <g key={l.pct} transform={`translate(0,${18+i*19})`}>
                <circle cx="15" cy="4" r="6" fill={c.pin} stroke="white" strokeWidth="1.2"/>
                <text x="26" y="8.5" fontSize="6.5" fontFamily="Outfit" fill="#374151">{l.label}</text>
              </g>
            )
          })}
        </g>

        {/* ── 12. Scale bar ── */}
        <g transform="translate(620,505)">
          <rect x="-2" y="-10" width="130" height="13" rx="3" fill="rgba(255,255,255,0.88)"/>
          <line x1="0" y1="0" x2="80" y2="0" stroke="#374151" strokeWidth="1.2"/>
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#374151" strokeWidth="1.2"/>
          <line x1="80" y1="-3" x2="80" y2="3" stroke="#374151" strokeWidth="1.2"/>
          <text x="40" y="-2" fontSize="6" fontFamily="Outfit" fill="#374151" textAnchor="middle" fontWeight="600">500 m</text>
        </g>
      </svg>

      {/* ── Telemetry bar ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 rounded-xl px-4 py-2"
        style={{ background:'rgba(255,255,255,0.95)', backdropFilter:'blur(6px)',
          border:'1px solid rgba(15,23,42,0.09)', boxShadow:'0 4px 20px rgba(0,0,0,0.10)',
          pointerEvents:'none' }}>
        {/* Live status */}
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full"
            style={{ background: isOffline ? '#0f172a' : '#16a34a',
              animation: isOffline ? 'none' : 'pulse 1.5s infinite' }}/>
          <span style={{ fontFamily:'Outfit', fontSize:10, fontWeight:700, letterSpacing:'0.06em',
            color: isOffline ? '#0f172a' : '#16a34a' }}>
            {isOffline ? 'OFFLINE' : 'LIVE'}
          </span>
        </div>
        <div style={{ width:1, height:20, background:'rgba(15,23,42,0.10)' }}/>
        {/* Current plot */}
        <div className="text-center">
          <div style={{ fontFamily:'Outfit', fontSize:8, color:'rgba(15,23,42,0.40)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Current Plot</div>
          <div style={{ fontFamily:'Outfit', fontSize:12, fontWeight:700, color:'#0f172a' }}>{roverField?.id} · Zone {roverZone}</div>
        </div>
        <div style={{ width:1, height:20, background:'rgba(15,23,42,0.10)' }}/>
        {/* Moisture */}
        <div className="text-center">
          <div style={{ fontFamily:'Outfit', fontSize:8, color:'rgba(15,23,42,0.40)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Moisture</div>
          <div style={{ fontFamily:'Outfit', fontSize:12, fontWeight:700, color: roverPct < 40 ? '#0f172a' : '#16a34a' }}>
            {roverPct.toFixed(1)}% · {roverCfg.label}
          </div>
        </div>
        <div style={{ width:1, height:20, background:'rgba(15,23,42,0.10)' }}/>
        {/* AI Decision */}
        <div className="text-center">
          <div style={{ fontFamily:'Outfit', fontSize:8, color:'rgba(15,23,42,0.40)', textTransform:'uppercase', letterSpacing:'0.06em' }}>AI Decision</div>
          <div style={{ fontFamily:'Outfit', fontSize:12, fontWeight:700, color:'#0f172a' }}>{roverCfg.action}</div>
        </div>
        <div style={{ width:1, height:20, background:'rgba(15,23,42,0.10)' }}/>
        {/* Signal */}
        <div className="text-center">
          <div style={{ fontFamily:'Outfit', fontSize:8, color:'rgba(15,23,42,0.40)', textTransform:'uppercase', letterSpacing:'0.06em' }}>Signal</div>
          <div style={{ fontFamily:'Outfit', fontSize:12, fontWeight:700,
            color: rover.signal < 40 ? '#0f172a' : 'rgba(15,23,42,0.65)' }}>{rover.signal}%</div>
        </div>
      </div>
    </div>
  )
}
