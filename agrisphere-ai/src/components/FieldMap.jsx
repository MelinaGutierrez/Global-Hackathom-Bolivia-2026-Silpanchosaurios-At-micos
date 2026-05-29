import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Rectangle, Tooltip, Marker, useMap } from 'react-leaflet'
import { motion, AnimatePresence } from 'framer-motion'
import { Droplets, X } from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* ── Geographic bounds of Cliza municipality ─────────────*/
const GEO = {
  center:   [-17.590, -65.935],
  latMin:   -17.670,
  latMax:   -17.510,
  lonMin:   -66.015,
  lonMax:   -65.855,
}

/* ── Grid config ──────────────────────────────────────────*/
const COLS = 10
const ROWS = 7

// Agricultural cells [col, row]
const ZONE_A_CELLS = [[1,0],[2,0],[3,0],[4,0],[5,0],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[1,2],[2,2],[3,2]]
const ZONE_B_CELLS = [[4,2],[5,2],[6,2],[7,2],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[3,4],[4,4],[5,4],[6,4],[7,4],[8,4]]
const ZONE_C_CELLS = [[1,5],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[2,6],[3,6],[4,6],[5,6],[6,6],[7,6]]

const ZONE_LOOKUP = {}
ZONE_A_CELLS.forEach(([c,r]) => { ZONE_LOOKUP[`${c},${r}`] = 'A' })
ZONE_B_CELLS.forEach(([c,r]) => { ZONE_LOOKUP[`${c},${r}`] = 'B' })
ZONE_C_CELLS.forEach(([c,r]) => { ZONE_LOOKUP[`${c},${r}`] = 'C' })

const ROVER_SEQUENCE = [...ZONE_A_CELLS, ...ZONE_B_CELLS, ...ZONE_C_CELLS]

/* ── Geo helpers ──────────────────────────────────────────*/
function cellBounds(col, row) {
  const latStep = (GEO.latMax - GEO.latMin) / ROWS
  const lonStep = (GEO.lonMax - GEO.lonMin) / COLS
  const latTop    = GEO.latMax - row * latStep
  const latBottom = GEO.latMax - (row + 1) * latStep
  const lonLeft   = GEO.lonMin + col * lonStep
  const lonRight  = GEO.lonMin + (col + 1) * lonStep
  return [[latBottom, lonLeft], [latTop, lonRight]]
}

function cellCenter(col, row) {
  const latStep = (GEO.latMax - GEO.latMin) / ROWS
  const lonStep = (GEO.lonMax - GEO.lonMin) / COLS
  return [
    GEO.latMax - (row + 0.5) * latStep,
    GEO.lonMin + (col + 0.5) * lonStep,
  ]
}

/* ── Color helpers ────────────────────────────────────────*/
function moistureColor(pct) {
  if (pct < 25) return { fill: '#b45309', text: '#ef4444', label: 'Crítico',  border: '#ef4444' }
  if (pct < 40) return { fill: '#ca8a04', text: '#f59e0b', label: 'Seco',     border: '#f59e0b' }
  if (pct < 70) return { fill: '#16a34a', text: '#16a34a', label: 'Óptimo',   border: '#22c55e' }
  if (pct < 85) return { fill: '#1d4ed8', text: '#3b82f6', label: 'Húmedo',   border: '#60a5fa' }
  return              { fill: '#7c3aed', text: '#7c3aed', label: 'Saturado', border: '#a78bfa' }
}

/* ── Rover DivIcon ────────────────────────────────────────*/
function makeRoverIcon(isOffline) {
  const html = isOffline
    ? `<div style="
        width:32px;height:32px;border-radius:6px;
        background:rgba(239,68,68,0.15);border:2px dashed #ef4444;
        display:flex;align-items:center;justify-content:center;
        font-size:10px;font-family:DM Mono,monospace;color:#ef4444;font-weight:700;
      ">✕</div>`
    : `<div style="position:relative;width:44px;">
        <div style="
          position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
          width:36px;height:36px;border-radius:50%;
          border:1.5px solid rgba(34,197,94,0.4);
          animation:ping 2s ease-out infinite;
        "></div>
        <div style="
          position:relative;z-index:2;
          width:28px;height:22px;border-radius:6px;background:#15803d;margin:8px auto 0;
          display:flex;align-items:center;justify-content:center;
          box-shadow:0 2px 8px rgba(21,128,61,0.5);
        ">
          <div style="width:16px;height:12px;border-radius:3px;background:#16a34a;display:flex;align-items:center;justify-content:center;">
            <div style="width:8px;height:6px;border-radius:1px;background:#4ade80;opacity:0.8;"></div>
          </div>
        </div>
        <div style="font-size:7px;font-family:DM Mono,monospace;font-weight:700;color:#111827;
          text-align:center;margin-top:2px;background:white;border-radius:3px;padding:1px 3px;
          box-shadow:0 1px 3px rgba(0,0,0,0.15);">ROVER-01</div>
      </div>`
  return L.divIcon({ html, iconSize: [44, 52], iconAnchor: [22, 44], className: '' })
}

/* ── Component that flies map to rover position ──────────*/
function RoverFly({ pos }) {
  const map = useMap()
  const prevPos = useRef(null)
  useEffect(() => {
    if (!prevPos.current || (prevPos.current[0] !== pos[0] || prevPos.current[1] !== pos[1])) {
      prevPos.current = pos
    }
  }, [pos, map])
  return null
}

/* ── Cell info popup (React overlay, not Leaflet popup) ──*/
function CellPanel({ col, row, zone, moisture, onClose }) {
  const pct = moisture[zone]
  const cfg = moistureColor(pct)
  const names = { A: 'Parcela Norte', B: 'Parcela Central', C: 'Parcela Sur' }
  const [lat, lon] = cellCenter(col, row)
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      className="absolute top-14 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-2xl shadow-float border border-gray-200 overflow-hidden pointer-events-auto"
      style={{ width: 260 }}
    >
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between"
        style={{ background: cfg.text + '12' }}>
        <div>
          <div className="font-display font-bold text-sm" style={{ color: cfg.text }}>
            Zona {zone} · [{col},{row}]
          </div>
          <div className="text-xs font-outfit text-gray-400">{names[zone]}</div>
        </div>
        <button onClick={onClose}
          className="w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-gray-100">
          <X size={11} className="text-gray-500" />
        </button>
      </div>
      <div className="px-4 py-3 space-y-2.5">
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-xs font-outfit text-gray-500">Humedad del suelo</span>
            <span className="font-mono text-xl font-bold" style={{ color: cfg.text }}>{pct.toFixed(1)}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: cfg.text }}
              animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
          </div>
          <div className="mt-1 text-right text-[10px] font-outfit font-semibold" style={{ color: cfg.text }}>
            {cfg.label}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { label: 'Sonda neutrónica', value: `${pct.toFixed(1)}%` },
            { label: 'Temp. suelo',      value: `${(18 + pct * 0.15).toFixed(1)}°C` },
            { label: 'Latitud',          value: `${lat.toFixed(5)}°` },
            { label: 'Longitud',         value: `${lon.toFixed(5)}°` },
          ].map(r => (
            <div key={r.label} className="rounded-lg bg-gray-50 px-2 py-1.5">
              <div className="text-[9px] font-outfit text-gray-400">{r.label}</div>
              <div className="font-mono text-[11px] font-bold text-gray-700 mt-0.5">{r.value}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl p-2 border flex items-center gap-2"
          style={{ borderColor: cfg.text + '40', background: cfg.text + '08' }}>
          <Droplets size={11} style={{ color: cfg.text }} className="flex-shrink-0" />
          <p className="text-[10px] font-outfit leading-relaxed" style={{ color: cfg.text }}>
            {pct < 30 ? 'Irrigación requerida — humedad bajo umbral.' :
             pct < 70 ? 'Condición óptima — no se requiere acción.' :
             'Riesgo de saturación — suspender irrigación.'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Main ─────────────────────────────────────────────────*/
export default function FieldMap({ telemetry, tick }) {
  const { moisture, rover } = telemetry
  const isOffline = rover.status === 'OFFLINE'

  const cellIdx     = tick % ROVER_SEQUENCE.length
  const [col, row]  = ROVER_SEQUENCE[cellIdx]
  const roverZone   = ZONE_LOOKUP[`${col},${row}`] || 'B'
  const roverLatLng = cellCenter(col, row)

  // Expose to telemetry — also set on first render
  telemetry.rover._cell  = [col, row]
  telemetry.rover._zone  = roverZone
  telemetry.rover._utmX  = Math.round(182000 + (col / COLS) * 15000)
  telemetry.rover._utmY  = Math.round(8049000 + ((ROWS - row) / ROWS) * 9500)

  const [visited, setVisited] = useState(new Set([`${col},${row}`]))
  useEffect(() => {
    setVisited(prev => new Set([...prev, `${col},${row}`]))
  }, [col, row])

  const [popup, setPopup] = useState(null)
  const roverIcon = makeRoverIcon(isOffline)

  const allAgriCells = [...ZONE_A_CELLS, ...ZONE_B_CELLS, ...ZONE_C_CELLS]

  return (
    <div className="relative flex-1 min-h-0 h-full overflow-hidden rounded-2xl border border-gray-200"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.10)' }}>

      {/* Cell popup (above map) */}
      <AnimatePresence>
        {popup && (
          <CellPanel {...popup} moisture={moisture} onClose={() => setPopup(null)} />
        )}
      </AnimatePresence>

      <MapContainer
        center={GEO.center}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
        scrollWheelZoom={true}
        attributionControl={true}
      >
        {/* Satellite imagery base */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          maxZoom={19}
        />
        {/* Labels overlay on satellite */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          opacity={0.7}
          maxZoom={19}
        />

        {/* Agricultural grid cells */}
        {allAgriCells.map(([c, r]) => {
          const key      = `${c},${r}`
          const zone     = ZONE_LOOKUP[key]
          const pct      = moisture[zone]
          const cfg      = moistureColor(pct)
          const isRover  = c === col && r === row && !isOffline
          const wasSeen  = visited.has(key)
          const bounds   = cellBounds(c, r)
          const opacity  = isRover ? 0.75 : wasSeen ? 0.55 : 0.40

          return (
            <Rectangle
              key={key}
              bounds={bounds}
              pathOptions={{
                color:       isRover ? '#ffffff' : cfg.border,
                weight:      isRover ? 3 : 1.5,
                fillColor:   cfg.fill,
                fillOpacity: isRover ? 0.70 : wasSeen ? 0.50 : 0.38,
                opacity:     1,
                dashArray:   isRover ? null : null,
              }}
              eventHandlers={{
                click: () => setPopup({ col: c, row: r, zone })
              }}
            >
              <Tooltip sticky={false} permanent={false} direction="top">
                <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, fontWeight: 700 }}>
                  Zona {zone} · {pct.toFixed(0)}% · {cfg.label}
                </span>
              </Tooltip>
            </Rectangle>
          )
        })}

        {/* Rover marker */}
        <Marker
          position={roverLatLng}
          icon={roverIcon}
          zIndexOffset={1000}
        />

        <RoverFly pos={roverLatLng} />
      </MapContainer>

      {/* Bottom telemetry bar */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-[900] bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 border border-gray-200 flex items-center gap-4"
        style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.12)', pointerEvents: 'none' }}>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`} />
          <span className={`font-mono text-[10px] font-bold ${isOffline ? 'text-red-500' : 'text-green-600'}`}>
            {isOffline ? 'OFFLINE' : 'EN VIVO'}
          </span>
        </div>
        <div className="w-px h-5 bg-gray-200"/>
        <div className="text-center">
          <div className="text-[8px] font-outfit text-gray-400">Cuadrícula</div>
          <div className="font-mono text-xs font-bold text-gray-700">[{col},{row}] · Zona {roverZone}</div>
        </div>
        <div className="w-px h-5 bg-gray-200"/>
        <div className="text-center">
          <div className="text-[8px] font-outfit text-gray-400">Lat / Lon</div>
          <div className="font-mono text-xs font-bold text-gray-700">
            {roverLatLng[0].toFixed(4)}° / {roverLatLng[1].toFixed(4)}°
          </div>
        </div>
        <div className="w-px h-5 bg-gray-200"/>
        <div className="text-center">
          <div className="text-[8px] font-outfit text-gray-400">Señal</div>
          <div className={`font-mono text-xs font-bold ${rover.signal < 40 ? 'text-red-500' : 'text-gray-700'}`}>
            {rover.signal}%
          </div>
        </div>
        <div className="w-px h-5 bg-gray-200"/>
        <div className="text-center">
          <div className="text-[8px] font-outfit text-gray-400">Latencia</div>
          <div className={`font-mono text-xs font-bold ${rover.syncLatency > 1000 ? 'text-red-500' : 'text-gray-700'}`}>
            {rover.syncLatency}ms
          </div>
        </div>
      </div>
    </div>
  )
}
