import { WELLS, toSVG, BOUNDS, ROADS_PAVED, ROADS_DIRT, RIO_CLIZA, BOUNDARY, ROVER_PATROL, COMMUNITIES } from '../data/clizaGeo.js'

export const wellsSVG      = WELLS.map(w => ({ ...w, pos: toSVG(w.utm[0], w.utm[1]) }))
export const roadsPavedSVG = ROADS_PAVED.map(r => ({ ...r, pts: r.points.map(([x,y]) => toSVG(x,y)) }))
export const roadsDirtSVG  = ROADS_DIRT.map(r =>  ({ ...r, pts: r.points.map(([x,y]) => toSVG(x,y)) }))
export const rioSVG        = RIO_CLIZA.map(([x,y]) => toSVG(x,y))
export const boundSVG      = BOUNDARY.map(([x,y]) => toSVG(x,y))
export const patrolSVG     = ROVER_PATROL.map(([x,y]) => toSVG(x,y))
export const commSVG       = COMMUNITIES.map(c => ({ ...c, pos: toSVG(c.utm[0], c.utm[1]) }))
export const centerSVG     = toSVG(188000, 8052000)

export { BOUNDS }

export function toPoints(pts) { return pts.map(p => `${p.x},${p.y}`).join(' ') }

export function lerpAlongPath(path, t) {
  const total = path.length - 1
  const raw   = ((t % total) + total) % total
  const seg   = Math.floor(raw)
  const frac  = raw - seg
  const a     = path[seg]       || path[0]
  const b     = path[(seg+1) % path.length] || path[0]
  return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac }
}
