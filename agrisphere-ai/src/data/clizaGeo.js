// Real geographic data — Cliza, Valle Alto de Cochabamba
// UTM Zone 19S — WGS84
// Source: Research map of 17 irrigation wells in Cliza municipality

// UTM bounds for SVG mapping
export const BOUNDS = {
  xMin: 182000, xMax: 197000, // 15 km wide
  yMin: 8049000, yMax: 8058500, // 9.5 km tall
  svgW: 820, svgH: 520,
}

// Map UTM → SVG coords
export function toSVG(utm_x, utm_y) {
  const sx = (utm_x - BOUNDS.xMin) / (BOUNDS.xMax - BOUNDS.xMin) * BOUNDS.svgW
  const sy = BOUNDS.svgH - (utm_y - BOUNDS.yMin) / (BOUNDS.yMax - BOUNDS.yMin) * BOUNDS.svgH
  return { x: parseFloat(sx.toFixed(1)), y: parseFloat(sy.toFixed(1)) }
}

// 17 Wells from Figura 1
export const WELLS = [
  { id: 'P-01', name: 'Pozo San Marcos 1',   utm: [183500, 8055900], depth: 18.4, flow: 2.1 },
  { id: 'P-02', name: 'Pozo San Marcos 2',   utm: [183900, 8055700], depth: 22.1, flow: 1.8 },
  { id: 'P-03', name: 'Pozo Lomas Liquinas', utm: [184300, 8055500], depth: 19.8, flow: 2.4 },
  { id: 'P-04', name: 'Pozo Porvenir',       utm: [186100, 8056000], depth: 24.3, flow: 1.6 },
  { id: 'P-05', name: 'Pozo Cliza-Totata',   utm: [186600, 8054500], depth: 28.7, flow: 3.2 },
  { id: 'P-06', name: 'Pozo Rokjo Lote',     utm: [186900, 8053200], depth: 21.5, flow: 2.8 },
  { id: 'P-07', name: 'Pozo Sal Agucia',     utm: [186400, 8052800], depth: 17.9, flow: 1.9 },
  { id: 'P-08', name: 'Pozo Villa 20 Agosto',utm: [189900, 8054300], depth: 31.2, flow: 4.1 },
  { id: 'P-09', name: 'Pozo Central Norte',  utm: [187400, 8052600], depth: 20.3, flow: 2.2 },
  { id: 'P-10', name: 'Pozo Central Sur',    utm: [188100, 8052100], depth: 23.6, flow: 3.0 },
  { id: 'P-11', name: 'Pozo Chijini',        utm: [186700, 8051600], depth: 26.4, flow: 2.5 },
  { id: 'P-12', name: 'Pozo Cruz Pata 1',    utm: [187100, 8050600], depth: 29.1, flow: 3.4 },
  { id: 'P-13', name: 'Pozo Cruz Pata 2',    utm: [187600, 8050200], depth: 32.8, flow: 2.7 },
  { id: 'P-14', name: 'Pozo Río Cliza',      utm: [188400, 8049800], depth: 15.6, flow: 4.8 },
  { id: 'P-15', name: 'Pozo Ana Rancho',     utm: [190300, 8051100], depth: 27.3, flow: 2.1 },
  { id: 'P-16', name: 'Pozo Kjuchin',        utm: [191700, 8051400], depth: 33.9, flow: 1.4 },
  { id: 'P-17', name: 'Pozo Villa Rivero',   utm: [192500, 8050600], depth: 38.2, flow: 1.1 },
]

// Road network — paved roads
export const ROADS_PAVED = [
  { id: 'TARATA-CLIZA', label: 'TARATA — CLIZA', points: [[182000,8051500],[183200,8051700],[184500,8052000],[186000,8052300],[187000,8052200],[188000,8052000]] },
  { id: 'SAN-BENITO', label: 'CLIZA — SAN BENITO', points: [[188000,8052000],[188200,8053500],[188400,8055000],[188600,8056500],[188800,8058000]] },
  { id: 'TOKO', label: 'CLIZA — TOKO', points: [[188000,8052000],[187900,8051000],[187800,8050000],[187700,8049200],[187600,8048800]] },
  { id: 'BUNATA', label: 'CLIZA — BUNATA', points: [[188000,8052000],[189200,8052800],[190200,8053400],[191000,8054000],[192000,8054500]] },
  { id: 'ISLAS', label: 'CLIZA — ISLAS MALVINAS', points: [[188000,8052000],[189500,8052200],[191000,8052000],[192500,8051800],[194000,8051500]] },
  { id: 'VILLA-RIVERO', label: 'CLIZA — VILLA RIVERO', points: [[188000,8052000],[189500,8051200],[191000,8050800],[192500,8050500],[194000,8050200]] },
  { id: 'CHIRUSE', label: 'CHIRUSE ROSARIO', points: [[192000,8054500],[192200,8053000],[192300,8051500],[192500,8050000]] },
  { id: 'HUACO', label: 'CLIZA — HUACO', points: [[188000,8052000],[187000,8051000],[186000,8050200],[185000,8049800],[184000,8049500]] },
]

// Dirt roads / caminos de tierra
export const ROADS_DIRT = [
  { id: 'D1', label: '', points: [[183500,8055900],[184500,8055500],[186000,8056000]] },
  { id: 'D2', label: '', points: [[186000,8053000],[186600,8052000],[187000,8051600]] },
  { id: 'D3', label: '', points: [[188000,8052000],[188500,8051000],[189000,8050500],[189500,8050200]] },
  { id: 'D4', label: '', points: [[190200,8051100],[190500,8052000],[191000,8052500]] },
  { id: 'D5', label: '', points: [[186500,8054500],[187500,8054000],[188500,8054200]] },
  { id: 'D6', label: '', points: [[182500,8053500],[183000,8052500],[183500,8052000]] },
  { id: 'D7', label: '', points: [[191000,8054000],[191500,8053500],[192000,8053000]] },
]

// Communities
export const COMMUNITIES = [
  { name: 'Valle Hermoso', utm: [183600, 8056400], major: false },
  { name: 'Villa Florida', utm: [185500, 8056700], major: false },
  { name: 'Villa Concepción', utm: [187800, 8056800], major: false },
  { name: 'Lobo Rancho', utm: [190500, 8056100], major: false },
  { name: 'Liquinas', utm: [182600, 8054500], major: false },
  { name: 'Rokjo Lote', utm: [186800, 8053300], major: false },
  { name: 'Villa 20 Agosto', utm: [190200, 8054500], major: false },
  { name: 'Tackoloma', utm: [191200, 8053900], major: false },
  { name: 'Aranjuez', utm: [183300, 8051700], major: false },
  { name: 'CLIZA', utm: [188000, 8052000], major: true },
  { name: 'Huasacalle Alto', utm: [190100, 8052600], major: false },
  { name: 'Chijini', utm: [186300, 8051300], major: false },
  { name: 'Ana Rancho', utm: [190200, 8050800], major: false },
  { name: 'Cruz Pata', utm: [187200, 8050300], major: false },
  { name: 'Kjuchin', utm: [191600, 8051200], major: false },
  { name: 'Chiñichi', utm: [186500, 8049500], major: false },
  { name: 'Sacha Kantu', utm: [187600, 8049100], major: false },
]

// River Cliza — runs through the south
export const RIO_CLIZA = [
  [185500, 8049600], [186200, 8049400], [187000, 8049300], [187800, 8049200],
  [188400, 8049100], [189200, 8049300], [190000, 8049600], [190800, 8049900],
  [191500, 8050200], [192200, 8050500], [193000, 8050800],
]

// Municipality boundary (approximate polygon)
export const BOUNDARY = [
  [182000, 8057800], [183000, 8057900], [184000, 8057800], [185000, 8057900],
  [186000, 8058000], [186500, 8058200], [187500, 8058300], [188500, 8058000],
  [189500, 8057500], [190500, 8057200], [191500, 8056800], [192500, 8056000],
  [193500, 8055000], [194000, 8054000], [194500, 8053000], [195000, 8052000],
  [195500, 8051000], [195000, 8050000], [194000, 8049500], [193000, 8049000],
  [192000, 8048800], [191000, 8048700], [190000, 8048800], [189000, 8048900],
  [188000, 8049000], [187000, 8048900], [186000, 8049000], [185000, 8049200],
  [184000, 8049300], [183000, 8049600], [182200, 8050200], [182000, 8051200],
  [182100, 8052500], [182000, 8054000], [182100, 8055500], [182000, 8057000],
  [182000, 8057800],
]

// Rover patrol path — follows road network visiting wells
export const ROVER_PATROL = [
  [188000, 8052000], // Start: Cliza center
  [187000, 8052200], // West on TARATA
  [186000, 8052300],
  [184500, 8052000],
  [183200, 8051700],
  [182800, 8052000], // West tip
  [183500, 8052500], // North
  [184000, 8053500],
  [183900, 8055700], // P-02
  [183500, 8055900], // P-01
  [184300, 8055500], // P-03
  [185500, 8056000], // North area
  [186100, 8056000], // P-04
  [186600, 8054500], // P-05 via dirt road
  [186900, 8053200], // P-06
  [186400, 8052800], // P-07
  [187400, 8052600], // P-09 — back toward center
  [188000, 8052000], // Center
  [188200, 8053500], // North — SAN BENITO route
  [188400, 8055000],
  [188800, 8056500], // North
  [189200, 8052800], // Back south, BUNATA branch
  [189900, 8054300], // P-08
  [190200, 8053400],
  [192000, 8054500], // CHIRUSE junction
  [192300, 8051500], // CHIRUSE south
  [191700, 8051400], // P-16
  [190300, 8051100], // P-15
  [188100, 8052100], // P-10 — back center
  [188000, 8052000],
  [189500, 8052200], // East — ISLAS MALVINAS
  [191000, 8052000],
  [192500, 8050500], // P-17
  [191000, 8050800],
  [190200, 8051100], // P-15 again
  [188000, 8052000], // Center
  [187000, 8051000], // South — HUACO/TOKO
  [187100, 8050600], // P-12
  [187600, 8050200], // P-13
  [188400, 8049800], // P-14
  [187900, 8050500],
  [187800, 8051500], // P-11 area
  [186700, 8051600], // P-11
  [186400, 8052800], // P-07 — back north
  [188000, 8052000], // Home
]

// UTM grid lines for coordinate display
export const UTM_GRID_X = [182000, 183500, 185000, 186500, 188000, 189500, 191000, 192500, 194000, 195500]
export const UTM_GRID_Y = [8049000, 8050500, 8052000, 8053500, 8055000, 8056500, 8058000]
